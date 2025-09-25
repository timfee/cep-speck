# Hashing URLs

## Overview

The Web Risk lists consist of variable length SHA256 hashes. For more details, see [List Contents](https://cloud.google.com/web-risk/docs/lists#list%5Fcontents). To check a URL against a Web Risk list, either locally or on the server, clients must first compute the hash prefix of that URL.

To compute the hash prefix of a URL, follow these steps:

1. Canonicalize the URL as described in [Canonicalization](undefined/#canonicalization).
2. Create the suffix/prefix expressions for the URL as described under[Suffix/Prefix expressions](undefined/#suffixprefix%5Fexpressions).
3. Compute the full-length hash for each suffix/prefix expression as described under [Hash computations](undefined/#hash%5Fcomputations).
4. Compute the hash prefix for each full-length hash, as described in[Hash prefix computations](undefined/#hash%5Fprefix%5Fcomputations).

Note that these steps mirror the process the Web Risk server uses to maintain the Web Risk lists.

## Canonicalization

To begin, we assume that the client has parsed the URL and made it valid according to RFC 2396\. If the URL uses an internationalized domain name (IDN), the client should convert the URL to the ASCII Punycode representation. The URL must include a path component; that is, it must have a leading slash (`http://google.com/`).

First, remove tab (`0x09`), CR (`0x0d`), and LF (`0x0a`) characters from the URL. Do not remove escape sequences for these characters, like `%0a`.

Second, if the URL ends in a fragment, remove the fragment. For example, shorten`http://google.com/#frag` to `http://google.com/`.

Third, repeatedly remove percent-escapes from the URL until it has no more percent-escapes.

### To canonicalize the hostname

Extract the hostname from the URL and then:

1. Remove all leading and trailing dots.
2. Replace consecutive dots with a single dot.
3. If the hostname can be parsed as an IP address, normalize it to 4 dot-separated decimal values. The client should handle any legal IP-address encoding, including octal, hex, and fewer than four components.
4. Lowercase the whole string.

### To canonicalize the path

1. Resolve the sequences `/../` and `/./` in the path by replacing `/./` with `/`, and removing `/../` along with the preceding path component.
2. Replace runs of consecutive slashes with a single slash character.

Do not apply these path canonicalizations to the query parameters.

In the URL, percent-escape all characters that are <= ASCII 32, >= 127, `#`, or`%`. The escapes should use uppercase hex characters.

Below are tests to help validate a canonicalization implementation.

Canonicalize("http://host/%25%32%35") = "http://host/%25";
Canonicalize("http://host/%25%32%35%25%32%35") = "http://host/%25%25";
Canonicalize("http://host/%2525252525252525") = "http://host/%25";
Canonicalize("http://host/asdf%25%32%35asd") = "http://host/asdf%25asd";
Canonicalize("http://host/%%%25%32%35asd%%") = "http://host/%25%25%25asd%25%25";
Canonicalize("http://www.google.com/") = "http://www.google.com/";
Canonicalize("http://%31%36%38%2e%31%38%38%2e%39%39%2e%32%36/%2E%73%65%63%75%72%65/%77%77%77%2E%65%62%61%79%2E%63%6F%6D/") = "http://168.188.99.26/.secure/www.ebay.com/";
Canonicalize("http://195.127.0.11/uploads/%20%20%20%20/.verify/.eBaysecure=updateuserdataxplimnbqmn-xplmvalidateinfoswqpcmlx=hgplmcx/") = "http://195.127.0.11/uploads/%20%20%20%20/.verify/.eBaysecure=updateuserdataxplimnbqmn-xplmvalidateinfoswqpcmlx=hgplmcx/";
Canonicalize("http://host%23.com/%257Ea%2521b%2540c%2523d%2524e%25f%255E00%252611%252A22%252833%252944_55%252B") = "http://host%23.com/~a!b@c%23d$e%25f^00&11\*22(33)44_55+";
Canonicalize("http://3279880203/blah") = "http://195.127.0.11/blah";
Canonicalize("http://www.google.com/blah/..") = "http://www.google.com/";
Canonicalize("www.google.com/") = "http://www.google.com/";
Canonicalize("www.google.com") = "http://www.google.com/";
Canonicalize("http://www.evil.com/blah#frag") = "http://www.evil.com/blah";
Canonicalize("http://www.GOOgle.com/") = "http://www.google.com/";
Canonicalize("http://www.google.com.../") = "http://www.google.com/";
Canonicalize("http://www.google.com/foo\tbar\rbaz\n2") ="http://www.google.com/foobarbaz2";
Canonicalize("http://www.google.com/q?") = "http://www.google.com/q?";
Canonicalize("http://www.google.com/q?r?") = "http://www.google.com/q?r?";
Canonicalize("http://www.google.com/q?r?s") = "http://www.google.com/q?r?s";
Canonicalize("http://evil.com/foo#bar#baz") = "http://evil.com/foo";
Canonicalize("http://evil.com/foo;") = "http://evil.com/foo;";
Canonicalize("http://evil.com/foo?bar;") = "http://evil.com/foo?bar;";
Canonicalize("http://\x01\x80.com/") = "http://%01%80.com/";
Canonicalize("http://notrailingslash.com") = "http://notrailingslash.com/";
Canonicalize("http://www.gotaport.com:1234/") = "http://www.gotaport.com/";
Canonicalize(" http://www.google.com/ ") = "http://www.google.com/";
Canonicalize("http:// leadingspace.com/") = "http://%20leadingspace.com/";
Canonicalize("http://%20leadingspace.com/") = "http://%20leadingspace.com/";
Canonicalize("%20leadingspace.com/") = "http://%20leadingspace.com/";
Canonicalize("https://www.securesite.com/") = "https://www.securesite.com/";
Canonicalize("http://host.com/ab%23cd") = "http://host.com/ab%23cd";
Canonicalize("http://host.com//twoslashes?more//slashes") = "http://host.com/twoslashes?more//slashes";

## Suffix/prefix expressions

After the URL is canonicalized, the next step is to create the suffix/prefix expressions. Each suffix/prefix expression consists of a host suffix (or full host) and a path prefix (or full path) as shown in these examples.

| Suffix/Prefix Expression     | Equivalent Regular Expression                         |
| ---------------------------- | ----------------------------------------------------- |
| a.b/mypath/                  | http\\:\\/\\/.\*\\.a\\.b\\/mypath\\/.\*               |
| c.d/full/path.html?myparam=a | http\\:\\/\\/.\*.c\\.d\\/full\\/path\\.html?myparam=a |

The client will form up to 30 different possible host suffix and path prefix combinations. These combinations use only the host and path components of the URL. The scheme, username, password, and port are discarded. If the URL includes query parameters, then at least one combination will include the full path and query parameters.

**For the host**, the client will try at most five different strings. They are:

- The exact hostname in the URL.
- Up to four hostnames formed by starting with the last five components and successively removing the leading component. The top-level domain can be skipped. These additional hostnames should not be checked if the host is an IP address.

**For the path**, the client will try at most six different strings. They are:

- The exact path of the URL, including query parameters.
- The exact path of the URL, without query parameters.
- The four paths formed by starting at the root (`/`) and successively appending path components, including a trailing slash.

The following examples illustrate the check behavior:

For the URL `http://a.b.c/1/2.html?param=1`, the client will try these possible strings:

a.b.c/1/2.html?param=1
a.b.c/1/2.html
a.b.c/
a.b.c/1/
b.c/1/2.html?param=1
b.c/1/2.html
b.c/
b.c/1/

For the URL `http://a.b.c.d.e.f.g/1.html`, the client will try these possible strings:

a.b.c.d.e.f.g/1.html
a.b.c.d.e.f.g/
(Note: skip b.c.d.e.f.g, since we'll take only the last five hostname components, and the full hostname)
c.d.e.f.g/1.html
c.d.e.f.g/
d.e.f.g/1.html
d.e.f.g/
e.f.g/1.html
e.f.g/
f.g/1.html
f.g/

For the URL `http://1.2.3.4/1/`, the client will try these possible strings:

1.2.3.4/1/
1.2.3.4/

## Hash computations

After the set of suffix/prefix expressions has been created, the next step is to compute the full-length SHA256 hash for each expression. Below is a unit test in pseudo-C that you can use to validate your hash computations.

Examples from[FIPS-180-2](http://csrc.nist.gov/publications/fips/fips180-2/fips180-2withchangenotice.pdf):

// Example B1 from FIPS-180-2
string input1 = "abc";
string output1 = TruncatedSha256Prefix(input1, 32);
int expected1[] = { 0xba, 0x78, 0x16, 0xbf };
assert(output1.size() == 4); // 4 bytes == 32 bits
for (int i = 0; i < output1.size(); i++) assert(output1[i] == expected1[i]);

// Example B2 from FIPS-180-2
string input2 = "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq";
string output2 = TruncatedSha256Prefix(input2, 48);
int expected2[] = { 0x24, 0x8d, 0x6a, 0x61, 0xd2, 0x06 };
assert(output2.size() == 6);
for (int i = 0; i < output2.size(); i++) assert(output2[i] == expected2[i]);

// Example B3 from FIPS-180-2
string input3(1000000, 'a'); // 'a' repeated a million times
string output3 = TruncatedSha256Prefix(input3, 96);
int expected3[] = { 0xcd, 0xc7, 0x6e, 0x5c, 0x99, 0x14, 0xfb, 0x92,
0x81, 0xa1, 0xc7, 0xe2 };
assert(output3.size() == 12);
for (int i = 0; i < output3.size(); i++) assert(output3[i] == expected3[i]);

## Hash prefix computations

Finally, the client needs to compute the hash prefix for each full-length SHA256 hash. For Web Risk, a hash prefix consists of the most significant 4-32 bytes of a SHA256 hash.

Examples from[FIPS-180-2](http://csrc.nist.gov/publications/fips/fips180-2/fips180-2withchangenotice.pdf):

- Example B1 from FIPS-180-2
  - Input is "abc".
  - SHA256 digest is `ba7816bf 8f01cfea 414140de 5dae2223 b00361a3 96177a9c b410ff61 f20015ad`.
  - The 32-bit hash prefix is `ba7816bf`.
- Example B2 from FIPS-180-2
  - Input is `abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq`.
  - SHA256 digest is `248d6a61 d20638b8 e5c02693 0c3e6039 a33ce459 64ff2167 f6ecedd4 19db06c1`.
  - The 48-bit hash prefix is `248d6a61 d206`.
    Send feedback
