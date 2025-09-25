# User warnings

If you use Web Risk to warn users about risks from particular webpages, the following guidelines apply.

These guidelines help protect both you and Google from misunderstandings by making it clear that the page is not known with 100% certainty to be an unsafe web resource, and that the warnings merely identify possible risk.

- In your user visible warning, you must not lead users to believe that the page in question is, without a doubt, an unsafe web resource. When you refer to the page being identified or the potential risks it may pose to users, you must qualify the warning using terms such as: suspected, potentially, possible, likely, may be.
- Your warning must enable the user to learn more by reviewing information at one of the following sites:
  - Social engineering (phishing and deceptive sites) warnings:[www.antiphishing.org](https://www.antiphishing.org)
  - Malware warnings: [Google Search Central](https://developers.google.com/search/docs/advanced/security/malware)
  - Unwanted software warnings:[Unwanted Software Policy](https://www.google.com/about/company/unwanted-software-policy.html)
- When you show warnings for pages identified as risky by the Web Risk Service, you must give attribution to Google by including the line "Advisory provided by Google," with a link to the [Web Risk Advisory](https://cloud.google.com/web-risk/docs/advisory). If your product also shows warnings based on other sources, you must not include the Google attribution in warnings derived from non-Google data.

### Suggested warning language

We encourage you to just copy this warning language in your product, or to modify it slightly to fit your product.

#### For social engineering warnings

**Warning: Deceptive site ahead.** Attackers on \[site URL\] may trick you into doing something dangerous like installing software or revealing your personal information (for example, passwords, phone numbers, or credit cards).

You can find out more about social engineering (phishing) at[Social Engineering (Phishing and Deceptive Sites)](https://support.google.com/webmasters/answer/6350487) or from[www.antiphishing.org](http://www.antiphishing.org).

#### For malware warnings

**Warning: Visiting this web site may harm your computer.** This page appears to contain malicious code that could be downloaded to your computer without your consent. You can learn more about harmful web content including viruses and other malicious code and how to protect your computer at[Google Search Central](https://developers.google.com/search/docs/advanced/security/malware).

#### For unwanted software warnings

**Warning: The site ahead may contain harmful programs.** Attackers might attempt to trick you into installing programs that harm your browsing experience (for example, by changing your homepage or showing extra ads on sites you visit). You can learn more about unwanted software at[Unwanted Software Policy](http://www.google.com/about/company/unwanted-software-policy.html).

#### For Android potentially harmful application (PHA) warnings

**Warning: The site ahead may contain malware.** Attackers might attempt to install dangerous apps on your device that steal or delete your information (for example, photos, passwords, messages, and credit cards).

### Age of data and usage

When retrieving data using Web Risk, clients must never use data older than what is specified by the service. Specifically, a warning can only be shown if the following is true:

- Lookup API: In the[uris.search HTTP GET response](https://cloud.google.com/web-risk/docs/lookup-api#http%5Fget%5Fresponse)a URL matches a threat entry and the cached response is still valid at the time a warning is shown.
- Update API: In the[hashes.search HTTP POST response](https://cloud.google.com/web-risk/docs/update-api#http%5Fget%5Fresponse-1)a URL matches a full-length hash and the cached response is still valid at the time a warning is shown.

**Warning:** Under no other circumstances may a warning be shown.

## User protection notice

Our Terms of Service require that if you indicate to users that your service provides protection against unsafe web resources then you must also inform them that the protection is not perfect. This notice must be visible to them before they enable the protection, and it must inform them that there is a chance of both false positives (safe sites flagged as risky) and false negatives (risky sites not flagged). We suggest using the following language:

Google works to provide the most accurate and up-to-date information about unsafe web resources. However, Google cannot guarantee that its information is comprehensive and error-free: some risky sites may not be identified, and some safe sites may be identified in error.

Send feedback
