- [HTTP request](undefined/#body.HTTP%5FTEMPLATE)
- [Query parameters](undefined/#body.QUERY%5FPARAMETERS)
- [Request body](undefined/#body.request%5Fbody)
- [Response body](undefined/#body.response%5Fbody)
  - [JSON representation](undefined/#body.SearchUrisResponse.SCHEMA%5FREPRESENTATION)
- [Authorization Scopes](undefined/#body.aspect)
- [ThreatUri](undefined/#ThreatUri)
  - [JSON representation](undefined/#ThreatUri.SCHEMA%5FREPRESENTATION)

This method is used to check whether a URI is on a given threatList. Multiple threatLists may be searched in a single query. The response will list all requested threatLists the URI was found to match. If the URI is not found on any of the requested ThreatList an empty response will be returned.

### HTTP request

`GET https://webrisk.googleapis.com/v1/uris:search`

The URL uses [gRPC Transcoding](https://google.aip.dev/127) syntax.

### Query parameters

| Parameters      |                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| uri             | string Required. The URI to be checked for matches.                                                                                                                     |
| threatTypes\[\] | enum ([ThreatType](https://cloud.google.com/web-risk/docs/reference/rest/v1/ThreatType)) Required. The ThreatLists to search in. Multiple ThreatLists may be specified. |

### Request body

The request body must be empty.

### Response body

If successful, the response body contains data with the following structure:

| JSON representation                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------- |
| { "threat": { object ([ThreatUri](https://cloud.google.com/web-risk/docs/reference/rest/v1/uris/search#ThreatUri)) } } |

| Fields |                                                                                                                                                                             |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| threat | object ([ThreatUri](https://cloud.google.com/web-risk/docs/reference/rest/v1/uris/search#ThreatUri)) The threat list matches. This might be empty if the URI is on no list. |

### Authorization Scopes

Requires the following OAuth scope:

- `https://www.googleapis.com/auth/cloud-platform`

For more information, see the [Authentication Overview](https://cloud.google.com/docs/authentication/).

## ThreatUri

Contains threat information on a matching uri.

| JSON representation                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------- |
| { "threatTypes": \[ enum ([ThreatType](https://cloud.google.com/web-risk/docs/reference/rest/v1/ThreatType)) \], "expireTime": string } |

| Fields          |                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| threatTypes\[\] | enum ([ThreatType](https://cloud.google.com/web-risk/docs/reference/rest/v1/ThreatType)) The ThreatList this threat belongs to.                                                                                                                                                                                                                                                                                                                 |
| expireTime      | string ([Timestamp](https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#google.protobuf.Timestamp) format) The cache lifetime for the returned match. Clients must not cache this response past this timestamp to avoid false positives.A timestamp in RFC3339 UTC "Zulu" format, with nanosecond resolution and up to nine fractional digits. Examples: "2014-10-02T15:01:23Z" and "2014-10-02T15:01:23.045123456Z". |

Send feedback
