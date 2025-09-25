# Long-running Operations

The Submission API is asynchronous and returns a long-running operation. The operation may not be completed when the method returns a response.

## Get an operation status

The following shows how to poll an operation's status.

Call the `GET` method for the Operations type.

Before using any of the request data, make the following replacements:

- project-number: your Google Cloud project number
- operation-id: your operation ID

HTTP method and URL:

GET https://webrisk.googleapis.com/v1/projects/project-number/operations/operation-id

To send your request, choose one of these options:

#### curl

**Note:** The following command assumes that you have logged in to the `gcloud` CLI with your user account by running[gcloud init](https://cloud.google.com/sdk/gcloud/reference/init) or[gcloud auth login](https://cloud.google.com/sdk/gcloud/reference/auth/login) , or by using [Cloud Shell](https://cloud.google.com/shell/docs), which automatically logs you into the `gcloud` CLI . You can check the currently active account by running[gcloud auth list](https://cloud.google.com/sdk/gcloud/reference/auth/list).

Execute the following command:

curl -X GET \  
 -H "Authorization: Bearer $(gcloud auth print-access-token)" \  
 "https://webrisk.googleapis.com/v1/projects/project-number/operations/operation-id"

#### PowerShell

**Note:** The following command assumes that you have logged in to the `gcloud` CLI with your user account by running[gcloud init](https://cloud.google.com/sdk/gcloud/reference/init) or[gcloud auth login](https://cloud.google.com/sdk/gcloud/reference/auth/login) . You can check the currently active account by running[gcloud auth list](https://cloud.google.com/sdk/gcloud/reference/auth/list).

Execute the following command:

$cred = gcloud auth print-access-token  
$headers = @{ "Authorization" = "Bearer $cred" }

Invoke-WebRequest ` 
    -Method GET`  
 -Headers $headers `  
 -Uri "https://webrisk.googleapis.com/v1/projects/project-number/operations/operation-id" | Select-Object -Expand Content

You should receive a JSON response similar to the following:

{
"name": "projects/project-number/operations/operation-id",
"metadata": {
"@type": "type.googleapis.com/google.cloud.webrisk.v1.SubmitUriMetadata",
"state": "RUNNING"
}
"done": false,
...
}

When the operation is completed, one of the following values is returned for`state`:

- `SUCCEEDED`: indicates that the submitted URL was added to the Safe Browsing Blocklist.
- `CLOSED`: indicates that the submitted URL was not detected to violate the Safe Browsing Policies and was not added to the Safe Browsing Blocklist in the last 24 hours.
  Send feedback
