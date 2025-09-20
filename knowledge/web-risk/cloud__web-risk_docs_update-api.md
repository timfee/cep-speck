# Using the Update API

**Note:** Web Risk maintains an [open-source client](https://github.com/google/webrisk)implementation of the Update API. For most use cases, this client works out-of- the-box. This client features an HTTP microserver, Dockerfile, and a command line lookup of URLs. This client can also be used as a reference implementation of the Update API.

## Overview

The Update API lets your client applications download hashed versions of the Web Risk lists for storage in a local or in-memory database. URLs can then be checked locally. When a match is found in the local database, the client sends a request to the Web Risk servers to verify whether the URL is included on the Web Risk lists.

## Updating the local database

To stay current, clients are required to periodically update the Web Risk lists in their local database. To save bandwidth, clients download the hash prefixes of URLs rather than the raw URLs. For example, if "www.badurl.com/" is on a Web Risk list, clients download the SHA256 hash prefix of that URL rather than the URL itself. In the majority of cases the hash prefixes are 4 bytes long, meaning that the average bandwidth cost of downloading a single list entry is 4 bytes before compression.

To update the Web Risk lists in the local database, send an HTTP`GET` request to the[threatLists.computeDiff](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff)method:

- The HTTP `GET` request includes the name of the list to be updated along with client constraints to account for memory and bandwidth limitations.
- The HTTP `GET` response returns either a full update or a partial update. The response _could_ also return a recommended wait time until the next compute diff operation.

## Example: threatLists.computeDiff

### HTTP GET request

In the following example, the diffs for the MALWARE Web Risk list are requested. For more details, see the[threatLists.computeDiff query parameters](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#query-parameters)and the explanations that follow the code example.

HTTP method and URL:

GET https://webrisk.googleapis.com/v1/threatLists:computeDiff?threatType=MALWARE&versionToken=Gg4IBBADIgYQgBAiAQEoAQ%3D%3D&constraints.maxDiffEntries=2048&constraints.maxDatabaseEntries=4096&constraints.supportedCompressions=RAW&key=API_KEY

To send your request, choose one of these options:

#### curl

Execute the following command:

curl -X GET \  
 "https://webrisk.googleapis.com/v1/threatLists:computeDiff?threatType=MALWARE&versionToken=Gg4IBBADIgYQgBAiAQEoAQ%3D%3D&constraints.maxDiffEntries=2048&constraints.maxDatabaseEntries=4096&constraints.supportedCompressions=RAW&key=API_KEY"

#### PowerShell

Execute the following command:

$headers = @{ }

Invoke-WebRequest ` 
    -Method GET`  
 -Headers $headers `  
 -Uri "https://webrisk.googleapis.com/v1/threatLists:computeDiff?threatType=MALWARE&versionToken=Gg4IBBADIgYQgBAiAQEoAQ%3D%3D&constraints.maxDiffEntries=2048&constraints.maxDatabaseEntries=4096&constraints.supportedCompressions=RAW&key=API_KEY" | Select-Object -Expand Content

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

### Java

```

import com.google.cloud.webrisk.v1.WebRiskServiceClient;
import com.google.protobuf.ByteString;
import com.google.webrisk.v1.CompressionType;
import com.google.webrisk.v1.ComputeThreatListDiffRequest;
import com.google.webrisk.v1.ComputeThreatListDiffRequest.Constraints;
import com.google.webrisk.v1.ComputeThreatListDiffResponse;
import com.google.webrisk.v1.ThreatType;
import java.io.IOException;

public class ComputeThreatListDiff {

  public static void main(String[] args) throws IOException {
    // TODO(developer): Replace these variables before running the sample.
    // The threat list to update. Only a single ThreatType should be specified per request.
    ThreatType threatType = ThreatType.MALWARE;

    // The current version token of the client for the requested list. If the client does not have
    // a version token (this is the first time calling ComputeThreatListDiff), this may be
    // left empty and a full database snapshot will be returned.
    ByteString versionToken = ByteString.EMPTY;

    // The maximum size in number of entries. The diff will not contain more entries
    // than this value. This should be a power of 2 between 2**10 and 2**20.
    // If zero, no diff size limit is set.
    int maxDiffEntries = 1024;

    // Sets the maximum number of entries that the client is willing to have in the local database.
    // This should be a power of 2 between 2**10 and 2**20. If zero, no database size limit is set.
    int maxDatabaseEntries = 1024;

    // The compression type supported by the client.
    CompressionType compressionType = CompressionType.RAW;

    computeThreatDiffList(threatType, versionToken, maxDiffEntries, maxDatabaseEntries,
        compressionType);
  }

  // Gets the most recent threat list diffs. These diffs should be applied to a local database of
  // hashes to keep it up-to-date.
  // If the local database is empty or excessively out-of-date,
  // a complete snapshot of the database will be returned. This Method only updates a
  // single ThreatList at a time. To update multiple ThreatList databases, this method needs to be
  // called once for each list.
  public static void computeThreatDiffList(ThreatType threatType, ByteString versionToken,
      int maxDiffEntries, int maxDatabaseEntries, CompressionType compressionType)
      throws IOException {
    // Initialize client that will be used to send requests. This client only needs to be created
    // once, and can be reused for multiple requests. After completing all of your requests, call
    // the `webRiskServiceClient.close()` method on the client to safely
    // clean up any remaining background resources.
    try (WebRiskServiceClient webRiskServiceClient = WebRiskServiceClient.create()) {

      Constraints constraints = Constraints.newBuilder()
          .setMaxDiffEntries(maxDiffEntries)
          .setMaxDatabaseEntries(maxDatabaseEntries)
          .addSupportedCompressions(compressionType)
          .build();

      ComputeThreatListDiffResponse response = webRiskServiceClient.computeThreatListDiff(
          ComputeThreatListDiffRequest.newBuilder()
              .setThreatType(threatType)
              .setVersionToken(versionToken)
              .setConstraints(constraints)
              .build());

      // The returned response contains the following information:
      // https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1#computethreatlistdiffresponse
      // Type of response: DIFF/ RESET/ RESPONSE_TYPE_UNSPECIFIED
      System.out.println(response.getResponseType());
      // List of entries to add and/or remove.
      // System.out.println(response.getAdditions());
      // System.out.println(response.getRemovals());

      // New version token to be used the next time when querying.
      System.out.println(response.getNewVersionToken());

      // Recommended next diff timestamp.
      System.out.println(response.getRecommendedNextDiff());

      System.out.println("Obtained threat list diff.");
    }
  }
}
```

### Python

```
from google.cloud import webrisk_v1
from google.cloud.webrisk_v1 import ComputeThreatListDiffResponse


def compute_threatlist_diff(
    threat_type: webrisk_v1.ThreatType,
    version_token: bytes,
    max_diff_entries: int,
    max_database_entries: int,
    compression_type: webrisk_v1.CompressionType,
) -> ComputeThreatListDiffResponse:
    """Gets the most recent threat list diffs.

    These diffs should be applied to a local database of hashes to keep it up-to-date.
    If the local database is empty or excessively out-of-date,
    a complete snapshot of the database will be returned. This Method only updates a
    single ThreatList at a time. To update multiple ThreatList databases, this method needs to be
    called once for each list.

    Args:
        threat_type: The threat list to update. Only a single ThreatType should be specified per request.
            threat_type = webrisk_v1.ThreatType.MALWARE

        version_token: The current version token of the client for the requested list. If the
            client does not have a version token (this is the first time calling ComputeThreatListDiff),
            this may be left empty and a full database snapshot will be returned.

        max_diff_entries: The maximum size in number of entries. The diff will not contain more entries
            than this value. This should be a power of 2 between 2**10 and 2**20.
            If zero, no diff size limit is set.
            max_diff_entries = 1024

        max_database_entries: Sets the maximum number of entries that the client is willing to have in the local database.
            This should be a power of 2 between 2**10 and 2**20. If zero, no database size limit is set.
            max_database_entries = 1024

        compression_type: The compression type supported by the client.
            compression_type = webrisk_v1.CompressionType.RAW

    Returns:
        The response which contains the diff between local and remote threat lists. In addition to the threat list,
        the response also contains the version token and the recommended time for next diff.
    """

    webrisk_client = webrisk_v1.WebRiskServiceClient()

    constraints = webrisk_v1.ComputeThreatListDiffRequest.Constraints()
    constraints.max_diff_entries = max_diff_entries
    constraints.max_database_entries = max_database_entries
    constraints.supported_compressions = [compression_type]

    request = webrisk_v1.ComputeThreatListDiffRequest()
    request.threat_type = threat_type
    request.version_token = version_token
    request.constraints = constraints

    response = webrisk_client.compute_threat_list_diff(request)

    # The returned response contains the following information:
    # https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1#computethreatlistdiffresponse
    # Type of response: DIFF/ RESET/ RESPONSE_TYPE_UNSPECIFIED
    print(response.response_type)
    # New version token to be used the next time when querying.
    print(response.new_version_token)
    # Recommended next diff timestamp.
    print(response.recommended_next_diff)

    return response


```

#### Web Risk lists

The `threatType` field identifies the Web Risk list. In the example, the diffs for the MALWARE Web Risk list are requested.

#### Version token

The `versionToken` field holds the current client state of the Web Risk list. Version Tokens are returned in the `newVersionToken` field of the[threatLists.computeDiff response](https://cloud.google.com/web-risk/docs/update-api#http%5Fget%5Fresponse). For initial updates, leave the `versionToken` field empty.

#### Size constraints

The `maxDiffEntries` field specifies the total number of updates that the client can manage (in the example, 2048). The `maxDatabaseEntries` field specifies the total number of entries the local database can manage (in the example, 4096). Clients should set size constraints to protect memory and bandwidth limitations and to safeguard against list growth. For more information, see [Update Constraints](https://cloud.google.com/web-risk/docs/update-constraints)).

#### Supported compressions

The `supportedCompressions` field lists the compression types the client supports. In the example, the client supports only raw, uncompressed data. Web Risk, however, supports additional compression types. For more information, see [Compression](https://cloud.google.com/web-risk/docs/compression).

### HTTP GET response

In this example, the response returns a partial update for the Web Risk list using the requested compression type.

#### Response body

The response body includes the diffs information (the response type, the additions and removals to be applied to the local database, the new version token, and a checksum).

**Note:** Web Risk does not provide an option to save or update the local database. If you want to make any additions or removals, you need to make those changes yourself.

In the example, the response also includes a recommended next diff time. For more details, see the[threatLists.computeDiff response body](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#response-body)and the explanations that follow the code example.

{
"responseType" : "DIFF",
"recommendedNextDiff": "2019-12-31T23:59:59.000000000Z",
"additions": {
"compressionType": "RAW",
"rawHashes": [{
"prefixSize": 4,
"rawHashes": "rnGLoQ=="
}]
},
"removals": {
"rawIndices": {
"indices": [0, 2, 4]
}
},
"newVersionToken": "ChAIBRADGAEiAzAwMSiAEDABEAFGpqhd",
"checksum": {
"sha256": "YSgoRtsRlgHDqDA3LAhM1gegEpEzs1TjzU33vqsR8iM="
},
"recommendedNextDiff": "2019-07-17T15:01:23.045123456Z"
}

#### Database diffs

The `responseType` field will indicate a partial (`DIFF`) or full update (`RESET`). In the example, partial diffs are returned, so the response includes both additions and removals. There could be multiple sets of additions, but only one set of removals. For more information, see[Database Diffs](https://cloud.google.com/web-risk/docs/local-databases#full-updates).

#### New version token

The `newVersionToken` field holds the new version token for the newly updated Web Risk list. Clients must save the new client state for subsequent update requests (the `versionToken` field in the[threatLists.computeDiff request](https://cloud.google.com/web-risk/docs/update-api#http%5Fget%5Frequest).

#### Checksums

The checksum lets clients verify that the local database has not suffered any corruption. If the checksum does not match, the client must clear the database and reissue an update with an empty `versionToken` field. However, clients in this situation must still follow the time intervals for updates. For more information, see [Request Frequency](https://cloud.google.com/web-risk/docs/request-frequency).

#### Recommended next diff

The `recommendedNextDiff` field indicates a timestamp until when the client should wait before sending another update request. Note that the recommended wait period may or may not be included in the response. For more details, see [Request Frequency](https://cloud.google.com/web-risk/docs/request-frequency).

## Checking URLs

To check if a URL is on a Web Risk list, the client must first compute the hash and hash prefix of the URL. For details, see[URLs and Hashing](https://cloud.google.com/web-risk/docs/urls-hashing). The client then queries the local database to determine if there is a match. If the hash prefix **is not present** in the local database, then the URL is considered safe (that is, not on the Web Risk lists).

If the hash prefix **is present** in the local database (a hash prefix collision), the client must send the hash prefix to the Web Risk servers for verification. The servers will return all full-length SHA 256 hashes that contain the given hash prefix. If one of those full-length hashes matches the full-length hash of the URL in question, then the URL is considered unsafe. If none of the full-length hashes match the full-length hash of the URL in question, then that URL is considered safe.

At no point does Google learn about the URLs you are examining. Google does learn the hash prefixes of URLs, but the hash prefixes don't provide much information about the actual URLs.

To check if a URL is on a Web Risk list, send an HTTP `GET` request to the [hashes.search](https://cloud.google.com/web-risk/docs/reference/rest/v1/hashes/search)method:

- The HTTP `GET` request includes the hash prefix of the URL to be checked.
- The HTTP `GET` response returns the matching full-length hashes along with the positive and negative expire times.

## Example: hashes.search

### HTTP GET request

In the following example, the names of two Web Risk lists and a hash prefix are sent for comparison and verification. For more details, see the[hashes.search query parameters](https://cloud.google.com/web-risk/docs/reference/rest/v1/hashes/search#query-parameters)and the explanations that follow the code example.

curl \
 -H "Content-Type: application/json" \
 "https://webrisk.googleapis.com/v1/hashes:search?key=YOUR_API_KEY&threatTypes=MALWARE&threatTypes=SOCIAL_ENGINEERING&hashPrefix=WwuJdQ%3D%3D"

### Java

```

import com.google.cloud.webrisk.v1.WebRiskServiceClient;
import com.google.protobuf.ByteString;
import com.google.webrisk.v1.SearchHashesRequest;
import com.google.webrisk.v1.SearchHashesResponse;
import com.google.webrisk.v1.SearchHashesResponse.ThreatHash;
import com.google.webrisk.v1.ThreatType;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

public class SearchHashes {

  public static void main(String[] args) throws IOException, NoSuchAlgorithmException {
    // TODO(developer): Replace these variables before running the sample.
    // A hash prefix, consisting of the most significant 4-32 bytes of a SHA256 hash.
    // For JSON requests, this field is base64-encoded. Note that if this parameter is provided
    // by a URI, it must be encoded using the web safe base64 variant (RFC 4648).
    String uri = "http://example.com";
    String encodedUri = Base64.getUrlEncoder().encodeToString(uri.getBytes(StandardCharsets.UTF_8));
    MessageDigest digest = MessageDigest.getInstance("SHA-256");
    byte[] encodedHashPrefix = digest.digest(encodedUri.getBytes(StandardCharsets.UTF_8));

    // The ThreatLists to search in. Multiple ThreatLists may be specified.
    // For the list on threat types, see: https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1#threattype
    List<ThreatType> threatTypes = Arrays.asList(ThreatType.MALWARE, ThreatType.SOCIAL_ENGINEERING);

    searchHash(ByteString.copyFrom(encodedHashPrefix), threatTypes);
  }

  // Gets the full hashes that match the requested hash prefix.
  // This is used after a hash prefix is looked up in a threatList and there is a match.
  // The client side threatList only holds partial hashes so the client must query this method
  // to determine if there is a full hash match of a threat.
  public static void searchHash(ByteString encodedHashPrefix, List<ThreatType> threatTypes)
      throws IOException {
    // Initialize client that will be used to send requests. This client only needs to be created
    // once, and can be reused for multiple requests. After completing all of your requests, call
    // the `webRiskServiceClient.close()` method on the client to safely
    // clean up any remaining background resources.
    try (WebRiskServiceClient webRiskServiceClient = WebRiskServiceClient.create()) {

      // Set the hashPrefix and the threat types to search in.
      SearchHashesResponse response = webRiskServiceClient.searchHashes(
          SearchHashesRequest.newBuilder()
              .setHashPrefix(encodedHashPrefix)
              .addAllThreatTypes(threatTypes)
              .build());

      // Get all the hashes that match the prefix. Cache the returned hashes until the time
      // specified in threatHash.getExpireTime()
      // For more information on response type, see: https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1#threathash
      for (ThreatHash threatHash : response.getThreatsList()) {
        System.out.println(threatHash.getHash());
      }
      System.out.println("Completed searching threat hashes.");
    }
  }
}
```

### Python

```
from google.cloud import webrisk_v1


def search_hashes(hash_prefix: bytes, threat_type: webrisk_v1.ThreatType) -> list:
    """Gets the full hashes that match the requested hash prefix.

    This is used after a hash prefix is looked up in a threatList and there is a match.
    The client side threatList only holds partial hashes so the client must query this method
    to determine if there is a full hash match of a threat.

    Args:
        hash_prefix: A hash prefix, consisting of the most significant 4-32 bytes of a SHA256 hash.
            For JSON requests, this field is base64-encoded. Note that if this parameter is provided
            by a URI, it must be encoded using the web safe base64 variant (RFC 4648).
            Example:
                uri = "http://example.com"
                sha256 = sha256()
                sha256.update(base64.urlsafe_b64encode(bytes(uri, "utf-8")))
                hex_string = sha256.digest()

        threat_type: The ThreatLists to search in. Multiple ThreatLists may be specified.
            For the list on threat types, see:
            https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1#threattype
            threat_type = [webrisk_v1.ThreatType.MALWARE, webrisk_v1.ThreatType.SOCIAL_ENGINEERING]

    Returns:
        A hash list that contain all hashes that matches the given hash prefix.
    """
    webrisk_client = webrisk_v1.WebRiskServiceClient()

    # Set the hashPrefix and the threat types to search in.
    request = webrisk_v1.SearchHashesRequest()
    request.hash_prefix = hash_prefix
    request.threat_types = [threat_type]

    response = webrisk_client.search_hashes(request)

    # Get all the hashes that match the prefix. Cache the returned hashes until the time
    # specified in threat_hash.expire_time
    # For more information on response type, see:
    # https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1#threathash
    hash_list = []
    for threat_hash in response.threats:
        hash_list.append(threat_hash.hash)
    return hash_list


```

#### Web Risk lists

The [threatTypes](https://cloud.google.com/web-risk/docs/reference/rest/v1/ThreatType) field identifies the Web Risk lists. In the example, two lists are identified: `MALWARE` and `SOCIAL_ENGINEERING`.

#### Threat hash prefixes

The `hashPrefix` field contains the hash prefix of the URL that you want to check. This field must contain the exact hash prefix that is present in the local database. For example, if the local hash prefix is 4 bytes long then the `hashPrefix` field must be 4 bytes long. If the local hash prefix was lengthened to 7 bytes then the `hashPrefix` field must be 7 bytes long.

### HTTP GET response

In the following example, the response returns the matching threats, containing the Web Risk lists they matched, along with the expire times.

#### Response body

The response body includes the match information (the list names and the full length hashes and the cache durations). For more details, see the[hashes.search response body](https://cloud.google.com/web-risk/docs/reference/rest/v1/hashes/search#response-body)and the explanations that follow the code example.

{
"threats": [{
"threatTypes": ["MALWARE"],
"hash": "WwuJdQx48jP-4lxr4y2Sj82AWoxUVcIRDSk1PC9Rf-4="
"expireTime": "2019-07-17T15:01:23.045123456Z"
}, {
"threatTypes": ["MALWARE", "SOCIAL_ENGINEERING"],
"hash": "WwuJdQxaCSH453-uytERC456gf45rFExcE23F7-hnfD="
"expireTime": "2019-07-17T15:01:23.045123456Z"
},
}],
"negativeExpireTime": "2019-07-17T15:01:23.045123456Z"
}

#### Matches

The `threats` field returns a matching full-length hashes for the hash prefix. The URLs corresponding to these hashes are considered unsafe. If no match is found for a hash prefix, nothing is returned; the URL corresponding to that hash prefix is considered safe.

#### Expire time

The `expireTime` and `negativeExpireTime` fields indicate until when the hashes must be considered either unsafe or safe respectively. For more details, see [Caching](https://cloud.google.com/web-risk/docs/caching).

Send feedback
