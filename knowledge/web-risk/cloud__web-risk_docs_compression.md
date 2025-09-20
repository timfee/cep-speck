# Compression

## About compression

Compression is a key feature of Web Risk. Compression significantly reduces bandwidth requirements, which is particularly relevant for mobile devices. The Web Risk server currently supports Rice compression. More compression methods might be added in the future.

Compression is set using the[supportedCompressions](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#constraints)field and[CompressionType](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#compressiontype). Clients should use the RICE and RAW compression types. Web Risk uses the`COMPRESSION_TYPE_UNSPECIFIED` type when the compression type is not set (RAW compression will be substituted).

The Web Risk server will also use standard HTTP compression to further compress responses, regardless of the compression type selected, as long as the client sets the correct HTTP compression header. To learn more, see the Wikipedia article on [HTTP compression](https://en.wikipedia.org/wiki/HTTP%5Fcompression).

## Rice compression

As noted, the Web Risk server currently supports Rice compression. For more inforomation, see the Wikipedia article [Golomb coding](https://en.wikipedia.org/wiki/Golomb%5Fcoding).

### Compression/decompression

The[RiceDeltaEncoding](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#ricedeltaencoding)object represents the Rice-Golomb encoded data and is used to send compressed removal indices or compressed 4-byte hash prefixes. Hash prefixes longer than 4 bytes will not be compressed, and will be served in raw format instead.

For removal indices, the list of indices is sorted in ascending order and then delta encoded using RICE encoding. For additions, the 4-byte hash prefixes are re-interpreted as little-endian uint32s, sorted in ascending order, and then delta encoded using RICE encoding. Note the difference in hash format between RICE compression and RAW: raw hashes are lexicographically sorted bytes, whereas RICE hashes are uint32s sorted in acsending order (after decompression).

That is, the list of integers \[1, 5, 7, 13\] will be encoded as 1 (the first value) and the deltas \[4, 2, 6\].

The first value is stored in the `firstValue` field and the deltas are encoded using a Golomb-Rice encoder. The Rice parameter `k` (see below) is stored in`riceParameter`. The `numEntries` field contains the number of deltas encoded in the Rice encoder (3 in our example above, not 4). The `encodedData` field contains the actual encoded deltas.

### Encoder/decoder

In the Rice encoder/decoder every delta `n` is encoded as `q` and `r` where`n = (q<<k) + r` (or, `n = q * (2**k) + r`). `k` is a constant and a parameter of the Rice encoder/decoder. The values for `q` and `r` are encoded in the bit stream using different encoding schemes.

The quotient `q` is encoded in unary coding followed by a 0\. That is, 3 would be encoded as 1110, 4 as 11110 and 7 as 11111110\. The quotient `q` is decoded first.

The remainder `r` is encoded using truncated binary encoding. Only the least significant `k` bits of `r` are written (and therefore read) from the bit stream. The remainder `r` is decoded after having decoded `q`.

### Bit encoder/decoder

The Rice encoder relies on a bit encoder/decoder where single bits can be appended to the bit encoder; that is, to encode a quotient `q` that could be only two bits long.

The bit encoder is a list of 8-bit bytes. Bits are set from the lowest significant bit in the first byte to the highest significant bit in the first byte. If a byte has all its bits already set, a new byte, initialized to zero, is appended to the end of the byte list. If the last byte is not fully used, its highest significant bits are set to zero. Example:

| Bits Added | BitEncoder After Adding Bits |
| ---------- | ---------------------------- |
| \[\]       |                              |
| 0          | \[00000000\]                 |
| 1          | \[00000010\]                 |
| 1          | \[00000110\]                 |
| 1,0,1      | \[00101110\]                 |
| 0,0,0      | \[00101110, 00000000\]       |
| 1,1,0      | \[00101110, 00000110\]       |

Send feedback
