# Using the Evaluate API

**Preview**

This feature is subject to the "Pre-GA Offerings Terms" in the General Service Terms section of the [Service Specific Terms](https://cloud.google.com/terms/service-terms#1). Pre-GA features are available "as is" and might have limited support. For more information, see the[launch stage descriptions](https://cloud.google.com/products#product-launch-stages).

The page explains how to use the Evaluate API to let your client applications evaluate the maliciousness of a URL. This API returns a confidence score that indicates the maliciousness of a URL based on blocklists, machine learning models and heuristic rules. If you want a binary result instead of a confidence score, use the [Lookup API](https://cloud.google.com/web-risk/docs/lookup-api).

**Note:** Any URLs submitted to the Evaluate API may undergo additional processing, including crawls.

## Before you begin

[Contact our sales team](https://go.chronicle.security/webriskapi) or your customer engineer to obtain access to this feature.

## Evaluating URLs

To evaluate a URL, send an HTTP `POST` request to the [evaluateUri](https://cloud.google.com/web-risk/docs/reference/rest/v1eap1/TopLevel/evaluateUri)method. Understand the following considerations when evaluating URLs:

- The Evaluate API supports one URL per request. If you want to check multiple URLs, send a separate request for each URL.
- The URL must be valid and doesn't need to be canonicalized. For more information, see [RFC 2396](http://www.ietf.org/rfc/rfc2396.txt).
- The Evaluate API supports three threatTypes: SOCIAL_ENGINEERING, MALWARE and UNWANTED_SOFTWARE.
- Deprecated. The `allow_scan` field was used to determine whether Web Risk is allowed to scan the URL provided. This functionality can no longer be disabled in the Evaluate API. See the [Lookup](https://cloud.google.com/web-risk/docs/lookup-api) and [Update](https://cloud.google.com/web-risk/docs/update-api) APIs for crawl-free options.
- The HTTP `POST` response returns a confidence score for the specified threatType. The confidence score represents the confidence level indicating how risky the specified URL is.

### API request

Before using any of the request data, make the following replacements:

URL: a URL that needs to be evaluated.

HTTP method and URL:

POST https://webrisk.googleapis.com/v1eap1:evaluateUri?key=API_KEY

Request JSON body:

{
"uri": "URL",
"threatTypes": ["SOCIAL_ENGINEERING", "MALWARE", "UNWANTED_SOFTWARE"]
}

To send your request, choose one of these options:

#### curl

Save the request body in a file named `request.json`, and execute the following command:

curl -X POST \  
 -H "Content-Type: application/json; charset=utf-8" \  
 -d @request.json \  
 "https://webrisk.googleapis.com/v1eap1:evaluateUri?key=API_KEY"

#### PowerShell

Save the request body in a file named `request.json`, and execute the following command:

$headers = @{ }

Invoke-WebRequest ` 
    -Method POST`  
 -Headers $headers ` 
    -ContentType: "application/json; charset=utf-8"`  
 -InFile request.json `  
 -Uri "https://webrisk.googleapis.com/v1eap1:evaluateUri?key=API_KEY" | Select-Object -Expand Content

You should receive a JSON response similar to the following:

{
"scores": [
{
"threatType": "MALWARE",
"confidenceLevel": "EXTREMELY_HIGH"
},
{
"threatType": "SOCIAL_ENGINEERING",
"confidenceLevel": "SAFE"
},
{
"threatType": "UNWANTED_SOFTWARE",
"confidenceLevel": "SAFE"
}
]
}

Send feedback
