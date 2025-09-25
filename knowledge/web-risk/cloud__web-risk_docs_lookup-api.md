# Using the Lookup API

## Overview

The Lookup API lets your client applications check if a URL is included on any of the Web Risk lists.

## Checking URLs

To check if a URL is on a Web Risk list, send an HTTP `GET` request to the [uris.search](https://cloud.google.com/web-risk/docs/reference/rest/v1/uris/search)method:

- The Lookup API supports one URL per request. To check multiple URLs, you need to send a separate request for each URL.
- You can specify multiple [threat types](https://cloud.google.com/web-risk/docs/reference/rest/v1/ThreatType)in a single request by repeating the `threatTypes` field. For example:

```
&threatTypes=SOCIAL_ENGINEERING&threatTypes=MALWARE
```

- The URL must be valid (see [RFC 2396](http://www.ietf.org/rfc/rfc2396.txt)) but it doesn't need to be canonicalized.
- If you use the REST API, you must encode `GET` parameters, like the URI.
- The HTTP `GET` response returns the matching threat types, if any, along with the cache expiration.

## Example: uris.search

HTTP method and URL:

GET https://webrisk.googleapis.com/v1/uris:search?threatTypes=MALWARE&uri=http%3A%2F%2Ftestsafebrowsing.appspot.com%2Fs%2Fmalware.html&key=API_KEY

To send your request, choose one of these options:

#### curl

Execute the following command:

curl -X GET \  
 "https://webrisk.googleapis.com/v1/uris:search?threatTypes=MALWARE&uri=http%3A%2F%2Ftestsafebrowsing.appspot.com%2Fs%2Fmalware.html&key=API_KEY"

#### PowerShell

Execute the following command:

$headers = @{ }

Invoke-WebRequest ` 
    -Method GET`  
 -Headers $headers `  
 -Uri "https://webrisk.googleapis.com/v1/uris:search?threatTypes=MALWARE&uri=http%3A%2F%2Ftestsafebrowsing.appspot.com%2Fs%2Fmalware.html&key=API_KEY" | Select-Object -Expand Content

You should receive a JSON response similar to the following:

{
"threat": {
"threatTypes": [
"MALWARE"
],
"expireTime": "2019-07-17T15:01:23.045123456Z"
}
}

### Java

```

import com.google.cloud.webrisk.v1.WebRiskServiceClient;
import com.google.webrisk.v1.SearchUrisRequest;
import com.google.webrisk.v1.SearchUrisResponse;
import com.google.webrisk.v1.ThreatType;
import java.io.IOException;

public class SearchUri {

  public static void main(String[] args) throws IOException {
    // TODO(developer): Replace these variables before running the sample.
    // The URI to be checked for matches.
    String uri = "http://testsafebrowsing.appspot.com/s/malware.html";

    // The ThreatLists to search in. Multiple ThreatLists may be specified.
    ThreatType threatType = ThreatType.MALWARE;

    searchUri(uri, threatType);
  }

  // This method is used to check whether a URI is on a given threatList. Multiple threatLists may
  // be searched in a single query.
  // The response will list all requested threatLists the URI was found to match. If the URI is not
  // found on any of the requested ThreatList an empty response will be returned.
  public static void searchUri(String uri, ThreatType threatType) throws IOException {
    // Initialize client that will be used to send requests. This client only needs to be created
    // once, and can be reused for multiple requests. After completing all of your requests, call
    // the `webRiskServiceClient.close()` method on the client to safely
    // clean up any remaining background resources.
    try (WebRiskServiceClient webRiskServiceClient = WebRiskServiceClient.create()) {

      SearchUrisRequest searchUrisRequest =
          SearchUrisRequest.newBuilder()
              .addThreatTypes(threatType)
              .setUri(uri)
              .build();

      SearchUrisResponse searchUrisResponse = webRiskServiceClient.searchUris(searchUrisRequest);

      if (!searchUrisResponse.getThreat().getThreatTypesList().isEmpty()) {
        System.out.println("The URL has the following threat: ");
        System.out.println(searchUrisResponse);
      } else {
        System.out.println("The URL is safe!");
      }
    }
  }
}
```

### Python

```
from google.cloud import webrisk_v1
from google.cloud.webrisk_v1 import SearchUrisResponse


def search_uri(
    uri: str, threat_type: webrisk_v1.ThreatType.MALWARE
) -> SearchUrisResponse:
    """Checks whether a URI is on a given threatList.

    Multiple threatLists may be searched in a single query. The response will list all
    requested threatLists the URI was found to match. If the URI is not
    found on any of the requested ThreatList an empty response will be returned.

    Args:
        uri: The URI to be checked for matches
            Example: "http://testsafebrowsing.appspot.com/s/malware.html"
        threat_type: The ThreatLists to search in. Multiple ThreatLists may be specified.
            Example: threat_type = webrisk_v1.ThreatType.MALWARE

    Returns:
        SearchUrisResponse that contains a threat_type if the URI is present in the threatList.
    """
    webrisk_client = webrisk_v1.WebRiskServiceClient()

    request = webrisk_v1.SearchUrisRequest()
    request.threat_types = [threat_type]
    request.uri = uri

    response = webrisk_client.search_uris(request)
    if response.threat.threat_types:
        print(f"The URI has the following threat: {response}")
    else:
        print("The URL is safe!")
    return response


```

If no results match your request, you will get an empty JSON response of `{}`. This means that the URL you provided isn't on any threat lists.

**Cache durations**

The `expireTime` field indicates the timestamp at which the match should be considered expired. For details, see [Caching](https://cloud.google.com/web-risk/docs/caching).

## What's next?

Learn about [Using the Update API](https://cloud.google.com/web-risk/docs/update-api).

Send feedback
