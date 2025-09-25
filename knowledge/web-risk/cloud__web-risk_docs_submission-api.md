# Using the Submission API

This document describes how to submit URLs that you suspect are unsafe to Safe Browsing for analysis, and asynchronously check the results of these submissions. Any URLs that are confirmed to violate the [Safe Browsing Policies](https://safebrowsing.google.com/#policies)are added to the Safe Browsing service.

## Before you begin

[Contact sales](https://cloud.google.com/contact) or your customer engineer in order to obtain access to this feature.

## Best Practices

### Read the [Safe Browsing Policies](https://safebrowsing.google.com/#policies)

The Web Risk Submission API validates that the submitted URLs render content violating Safe Browsing [policies](https://safebrowsing.google.com/#policies). API developers must ensure that the submitted URLs have clear evidence of violating these policies. The following examples show evidences of violation of policies:

- Social engineering content that mimics a legitimate online brand (brand name, logo, look and feel), system alerts, uses deceptive URLs, or requests users to enter sensitive credentials such as a username or password.
- A site that is hosting a known Malware executable.

API developers should not submit these types of URLs, as they most likely will not be added to Safe Browsing blocklists:

- Fake surveys, shopping sites, or other scams that do not demonstrate phishing (such as cryptocurrency scams).
- Spam containing gambling, violence, or adult content that is not phishing or malware.

## Submit URLs

To submit a URL, send an HTTP `POST` request to the [projects.uris.submit](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit)method.

- The Submission API supports one URL per request. To check multiple URLs, you need to send a separate request for each URL.
- The URL must be valid but it doesn't need to be canonicalized. For more information, see [RFC 2396](http://www.ietf.org/rfc/rfc2396.txt).
- The HTTP `POST` response returns a [long-running operation](https://cloud.google.com/web-risk/docs/reference/rpc/google.longrunning). For more information about how to retrieve the submission result and check the status of a submission, see [Long-running operations](https://cloud.google.com/web-risk/docs/long-running-operations).

## Example

HTTP method and URL:

POST https://webrisk.googleapis.com/v1/projects/project-id/uris:submit

Request JSON body:

{
"submission": {
"uri": "https://www.example.com/login.html"
}
}

To send your request, choose one of these options:

#### curl

**Note:** The following command assumes that you have logged in to the `gcloud` CLI with your user account by running[gcloud init](https://cloud.google.com/sdk/gcloud/reference/init) or[gcloud auth login](https://cloud.google.com/sdk/gcloud/reference/auth/login) , or by using [Cloud Shell](https://cloud.google.com/shell/docs), which automatically logs you into the `gcloud` CLI . You can check the currently active account by running[gcloud auth list](https://cloud.google.com/sdk/gcloud/reference/auth/list).

Save the request body in a file named `request.json`, and execute the following command:

curl -X POST \  
 -H "Authorization: Bearer $(gcloud auth print-access-token)" \  
 -H "Content-Type: application/json; charset=utf-8" \  
 -d @request.json \  
 "https://webrisk.googleapis.com/v1/projects/project-id/uris:submit"

#### PowerShell

**Note:** The following command assumes that you have logged in to the `gcloud` CLI with your user account by running[gcloud init](https://cloud.google.com/sdk/gcloud/reference/init) or[gcloud auth login](https://cloud.google.com/sdk/gcloud/reference/auth/login) . You can check the currently active account by running[gcloud auth list](https://cloud.google.com/sdk/gcloud/reference/auth/list).

Save the request body in a file named `request.json`, and execute the following command:

$cred = gcloud auth print-access-token  
$headers = @{ "Authorization" = "Bearer $cred" }

Invoke-WebRequest ` 
    -Method POST`  
 -Headers $headers ` 
    -ContentType: "application/json; charset=utf-8"`  
 -InFile request.json `  
 -Uri "https://webrisk.googleapis.com/v1/projects/project-id/uris:submit" | Select-Object -Expand Content

You should receive a JSON response similar to the following:

{
"name": "projects/project-number/operations/operation-id",
}

### Check the submission status

You can [check the status of the submission](https://cloud.google.com/web-risk/docs/long-running-operations#get)by using the `project-number` and `operation-id` values from the response.

`SUCCEEDED` indicates that the submitted URL was added to the Safe Browsing Blocklist.

`CLOSED` indicates that the submitted URL was not detected to violate the Safe Browsing Policies and was not added to the Safe Browsing Blocklist in the last 24 hours.

Send feedback
