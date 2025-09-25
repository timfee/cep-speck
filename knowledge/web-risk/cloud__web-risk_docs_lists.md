# Web Risk Lists

This document applies to the following methods:

- [Lookup API](https://cloud.google.com/web-risk/docs/lookup-api):[uris.search](https://cloud.google.com/web-risk/docs/lookup-api#example-urissearch)
- [Update API](https://cloud.google.com/web-risk/docs/update-api):[hashes.search](https://cloud.google.com/web-risk/docs/update-api#example-hashessearch)
- [Update API](https://cloud.google.com/web-risk/docs/update-api):[threatLists:computeDiff](https://cloud.google.com/web-risk/docs/update-api#example-threatlistscomputeDiff)

## About the lists

The Web Risk lists also referred to as **threat lists** or simply **lists** are Google's constantly updated lists of unsafe web resources. Examples of unsafe web resources are social engineering sites like phishing and deceptive sites, and sites that host malware or unwanted software.

## Threat types

Each Web Risk list is named (identified) using a[threatType](https://cloud.google.com/web-risk/docs/reference/rest/v1/ThreatType).

## List contents

Currently, all Web Risk lists consist of variable length SHA 256 hashes between 4 and 32 bytes. These hashes are based on the suffix/prefix expressions of the URLs associated with unsafe web resources. Note that the URLs themselves are not stored in the Web Risk lists. For more information, see[URLs and Hashing](https://cloud.google.com/web-risk/docs/urls-hashing).

When using the Lookup API to check URLs, the client sends the actual URL in the request and the Web Risk server converts the URL to a hash before performing the check. For additional details, see [Checking URLs](https://cloud.google.com/web-risk/docs/lookup-api#checking-urls) for the Lookup API.

When using the Update API to check URLs, the client must convert the URL to a hash and then send the hash prefix in the request to perform the URL check. See [Checking URLs](https://cloud.google.com/web-risk/docs/update-api#checking-urls) for more information about checking URLs with the Update API.

Send feedback
