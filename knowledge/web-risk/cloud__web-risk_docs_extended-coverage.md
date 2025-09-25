# Using the Extended Coverage list

This document explains how to use Web Risk's Extended Coverage list to improve the coverage of malicious urls with a small amount (<10%) of potential false positives. It applies to the following methods:

- [Lookup API](https://cloud.google.com/web-risk/docs/lookup-api):[uris.search](https://cloud.google.com/web-risk/docs/lookup-api#example-urissearch)
- [Update API](https://cloud.google.com/web-risk/docs/update-api):[hashes.search](https://cloud.google.com/web-risk/docs/update-api#example-hashessearch)
- [Update API](https://cloud.google.com/web-risk/docs/update-api):[threatLists:computeDiff](https://cloud.google.com/web-risk/docs/update-api#example-threatlistscomputeDiff)

## Improve detection with the Social Engineering Extended Coverage list

You can query the Update and Lookup APIs with the Extended Coverage list as you query with Web Risk's Malware, Social Engineering, or Unwanted Software lists. When you query, include the type SOCIAL_ENGINEERING_EXTENDED_COVERAGE in your `threatTypes`. When you use the Extended Coverage list for Social Engineering, it provides improved coverage of phishing and deceptive sites by up to 90% in some cases.

When a match to the Extended Coverage list is found, consider that these URLs are categorized with a slightly lower confidence than the other list types, and therefore have a slightly higher chance of being a false positive.

**Note:** These URL matches might not trigger a red warning screen if visited in Chrome, Firefox, Safari or other SafeBrowsing compliant browsers.

## Examples

This section lists a few examples of how to use the Extended Coverage list.

### Using Extended Coverage list with uris.search

HTTP method and URL:

GET https://webrisk.googleapis.com/v1/uris:search?threatTypes=SOCIAL_ENGINEERING_EXTENDED_COVERAGE&uri=http%3A%2F%2Ftestsafebrowsing.appspot.com%2Fs%2Fsocial_engineering_extended_coverage.html&key=API_KEY

To send your request, choose one of these options:

#### curl

Execute the following command:

curl -X GET \  
 "https://webrisk.googleapis.com/v1/uris:search?threatTypes=SOCIAL_ENGINEERING_EXTENDED_COVERAGE&uri=http%3A%2F%2Ftestsafebrowsing.appspot.com%2Fs%2Fsocial_engineering_extended_coverage.html&key=API_KEY"

#### PowerShell

Execute the following command:

$headers = @{ }

Invoke-WebRequest ` 
    -Method GET`  
 -Headers $headers `  
 -Uri "https://webrisk.googleapis.com/v1/uris:search?threatTypes=SOCIAL_ENGINEERING_EXTENDED_COVERAGE&uri=http%3A%2F%2Ftestsafebrowsing.appspot.com%2Fs%2Fsocial_engineering_extended_coverage.html&key=API_KEY" | Select-Object -Expand Content

You should receive a JSON response similar to the following:

{
"threat": {
"threatTypes": [
"SOCIAL_ENGINEERING_EXTENDED_COVERAGE"
],
"expireTime": "2019-07-17T15:01:23.045123456Z"
}
}

### Using Extended Coverage list with threatLists.computeDiff

HTTP method and URL:

GET https://webrisk.googleapis.com/v1/threatLists:computeDiff?threatType=SOCIAL_ENGINEERING_EXTENDED_COVERAGE&versionToken=Gg4IBBADIgYQgBAiAQEoAQ%3D%3D&constraints.maxDiffEntries=2048&constraints.maxDatabaseEntries=4096&constraints.supportedCompressions=RAW&key=API_KEY

To send your request, choose one of these options:

#### curl

Execute the following command:

curl -X GET \  
 "https://webrisk.googleapis.com/v1/threatLists:computeDiff?threatType=SOCIAL_ENGINEERING_EXTENDED_COVERAGE&versionToken=Gg4IBBADIgYQgBAiAQEoAQ%3D%3D&constraints.maxDiffEntries=2048&constraints.maxDatabaseEntries=4096&constraints.supportedCompressions=RAW&key=API_KEY"

#### PowerShell

Execute the following command:

$headers = @{ }

Invoke-WebRequest ` 
    -Method GET`  
 -Headers $headers `  
 -Uri "https://webrisk.googleapis.com/v1/threatLists:computeDiff?threatType=SOCIAL_ENGINEERING_EXTENDED_COVERAGE&versionToken=Gg4IBBADIgYQgBAiAQEoAQ%3D%3D&constraints.maxDiffEntries=2048&constraints.maxDatabaseEntries=4096&constraints.supportedCompressions=RAW&key=API_KEY" | Select-Object -Expand Content

You should receive a JSON response similar to the following:

{
"recommendedNextDiff": "2020-01-08T19:41:45.436722194Z",
"responseType": "RESET",
"additions": {
"rawHashes": [
{
"prefixSize": 4,
"rawHashes": "AArQMQAMoUgAPn8lAE..."
}
]
},
"newVersionToken": "ChAIARAGGAEiAzAwMSiAEDABEPDyBhoCGAlTcIVL",
"checksum": {
"sha256": "wy6jh0+MAg/V/+VdErFhZIpOW+L8ulrVwhlV61XkROI="
}
}

### Using Extended Coverage list with hashes.search

HTTP method and URL:

GET https://webrisk.googleapis.com/v1/hashes:search?threatTypes=SOCIAL_ENGINEERING_EXTENDED_COVERAGE&hashPrefix=WwuJdQ%3D%3D&key=API_KEY

To send your request, choose one of these options:

#### curl

Execute the following command:

curl -X GET \  
 "https://webrisk.googleapis.com/v1/hashes:search?threatTypes=SOCIAL_ENGINEERING_EXTENDED_COVERAGE&hashPrefix=WwuJdQ%3D%3D&key=API_KEY"

#### PowerShell

Execute the following command:

$headers = @{ }

Invoke-WebRequest ` 
    -Method GET`  
 -Headers $headers `  
 -Uri "https://webrisk.googleapis.com/v1/hashes:search?threatTypes=SOCIAL_ENGINEERING_EXTENDED_COVERAGE&hashPrefix=WwuJdQ%3D%3D&key=API_KEY" | Select-Object -Expand Content

You should receive a JSON response similar to the following:

{
"threats": [{
"threatTypes": ["SOCIAL_ENGINEERING_EXTENDED_COVERAGE"],
"hash": "WwuJdQxaCSH453-uytERC456gf45rFExcE23F7-hnfD="
"expireTime": "2019-07-17T15:01:23.045123456Z"
},
}],
"negativeExpireTime": "2019-07-17T15:01:23.045123456Z"
}
}

Send feedback
