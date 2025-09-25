- [HTTP request](undefined/#body.HTTP%5FTEMPLATE)
- [Query parameters](undefined/#body.QUERY%5FPARAMETERS)
- [Request body](undefined/#body.request%5Fbody)
- [Response body](undefined/#body.response%5Fbody)
  - [JSON representation](undefined/#body.SearchHashesResponse.SCHEMA%5FREPRESENTATION)
- [Authorization Scopes](undefined/#body.aspect)
- [ThreatHash](undefined/#ThreatHash)
  - [JSON representation](undefined/#ThreatHash.SCHEMA%5FREPRESENTATION)

Gets the full hashes that match the requested hash prefix. This is used after a hash prefix is looked up in a threatList and there is a match. The client side threatList only holds partial hashes so the client must query this method to determine if there is a full hash match of a threat.

### HTTP request

`GET https://webrisk.googleapis.com/v1/hashes:search`

The URL uses [gRPC Transcoding](https://google.aip.dev/127) syntax.

### Query parameters

| Parameters      |                                                                                                                                                                                                                                                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hashPrefix      | string ([bytes](https://developers.google.com/discovery/v1/type-format) format) A hash prefix, consisting of the most significant 4-32 bytes of a SHA256 hash. For JSON requests, this field is base64-encoded. Note that if this parameter is provided by a URI, it must be encoded using the web safe base64 variant (RFC 4648).A base64-encoded string. |
| threatTypes\[\] | enum ([ThreatType](https://cloud.google.com/web-risk/docs/reference/rest/v1/ThreatType)) Required. The ThreatLists to search in. Multiple ThreatLists may be specified.                                                                                                                                                                                    |

### Request body

The request body must be empty.

### Response body

If successful, the response body contains data with the following structure:

| JSON representation                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| { "threats": \[ { object ([ThreatHash](https://cloud.google.com/web-risk/docs/reference/rest/v1/hashes/search#ThreatHash)) } \], "negativeExpireTime": string } |

| Fields             |                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| threats\[\]        | object ([ThreatHash](https://cloud.google.com/web-risk/docs/reference/rest/v1/hashes/search#ThreatHash)) The full hashes that matched the requested prefixes. The hash will be populated in the key.                                                                                                                                                                                                               |
| negativeExpireTime | string ([Timestamp](https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#google.protobuf.Timestamp) format) For requested entities that did not match the threat list, how long to cache the response until.A timestamp in RFC3339 UTC "Zulu" format, with nanosecond resolution and up to nine fractional digits. Examples: "2014-10-02T15:01:23Z" and "2014-10-02T15:01:23.045123456Z". |

### Authorization Scopes

Requires the following OAuth scope:

- `https://www.googleapis.com/auth/cloud-platform`

For more information, see the [Authentication Overview](https://cloud.google.com/docs/authentication/).

## ThreatHash

Contains threat information on a matching hash.

| JSON representation                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| { "threatTypes": \[ enum ([ThreatType](https://cloud.google.com/web-risk/docs/reference/rest/v1/ThreatType)) \], "hash": string, "expireTime": string } |

| Fields          |                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| threatTypes\[\] | enum ([ThreatType](https://cloud.google.com/web-risk/docs/reference/rest/v1/ThreatType)) The ThreatList this threat belongs to. This must contain at least one entry.                                                                                                                                                                                                                                                                           |
| hash            | string ([bytes](https://developers.google.com/discovery/v1/type-format) format) A 32 byte SHA256 hash. This field is in binary format. For JSON requests, hashes are base64-encoded.A base64-encoded string.                                                                                                                                                                                                                                    |
| expireTime      | string ([Timestamp](https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#google.protobuf.Timestamp) format) The cache lifetime for the returned match. Clients must not cache this response past this timestamp to avoid false positives.A timestamp in RFC3339 UTC "Zulu" format, with nanosecond resolution and up to nine fractional digits. Examples: "2014-10-02T15:01:23Z" and "2014-10-02T15:01:23.045123456Z". |

Send feedback
