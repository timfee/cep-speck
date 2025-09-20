- [HTTP request](undefined/#body.HTTP%5FTEMPLATE)
- [Query parameters](undefined/#body.QUERY%5FPARAMETERS)
- [Request body](undefined/#body.request%5Fbody)
- [Response body](undefined/#body.response%5Fbody)
  - [JSON representation](undefined/#body.ComputeThreatListDiffResponse.SCHEMA%5FREPRESENTATION)
- [Authorization Scopes](undefined/#body.aspect)
- [Constraints](undefined/#Constraints)
  - [JSON representation](undefined/#Constraints.SCHEMA%5FREPRESENTATION)
- [CompressionType](undefined/#CompressionType)
- [ResponseType](undefined/#ResponseType)
- [ThreatEntryAdditions](undefined/#ThreatEntryAdditions)
  - [JSON representation](undefined/#ThreatEntryAdditions.SCHEMA%5FREPRESENTATION)
- [RawHashes](undefined/#RawHashes)
  - [JSON representation](undefined/#RawHashes.SCHEMA%5FREPRESENTATION)
- [RiceDeltaEncoding](undefined/#RiceDeltaEncoding)
  - [JSON representation](undefined/#RiceDeltaEncoding.SCHEMA%5FREPRESENTATION)
- [ThreatEntryRemovals](undefined/#ThreatEntryRemovals)
  - [JSON representation](undefined/#ThreatEntryRemovals.SCHEMA%5FREPRESENTATION)
- [RawIndices](undefined/#RawIndices)
  - [JSON representation](undefined/#RawIndices.SCHEMA%5FREPRESENTATION)
- [Checksum](undefined/#Checksum)
  - [JSON representation](undefined/#Checksum.SCHEMA%5FREPRESENTATION)

Gets the most recent threat list diffs. These diffs should be applied to a local database of hashes to keep it up-to-date. If the local database is empty or excessively out-of-date, a complete snapshot of the database will be returned. This Method only updates a single ThreatList at a time. To update multiple ThreatList databases, this method needs to be called once for each list.

### HTTP request

`GET https://webrisk.googleapis.com/v1/threatLists:computeDiff`

The URL uses [gRPC Transcoding](https://google.aip.dev/127) syntax.

### Query parameters

| Parameters   |                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| threatType   | enum ([ThreatType](https://cloud.google.com/web-risk/docs/reference/rest/v1/ThreatType)) Required. The threat list to update. Only a single ThreatType should be specified per request. If you want to handle multiple ThreatTypes, you must make one request per ThreatType.                                                                                                                                            |
| versionToken | string ([bytes](https://developers.google.com/discovery/v1/type-format) format) The current version token of the client for the requested list (the client version that was received from the last successful diff). If the client does not have a version token (this is the first time calling threatLists.computeDiff), this may be left empty and a full database snapshot will be returned.A base64-encoded string. |
| constraints  | object ([Constraints](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#Constraints)) Required. The constraints associated with this request.                                                                                                                                                                                                                                             |

### Request body

The request body must be empty.

### Response body

If successful, the response body contains data with the following structure:

| JSON representation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| { "responseType": enum ([ResponseType](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#ResponseType)), "additions": { object ([ThreatEntryAdditions](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#ThreatEntryAdditions)) }, "removals": { object ([ThreatEntryRemovals](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#ThreatEntryRemovals)) }, "newVersionToken": string, "checksum": { object ([Checksum](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#Checksum)) }, "recommendedNextDiff": string } |

| Fields              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| responseType        | enum ([ResponseType](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#ResponseType)) The type of response. This may indicate that an action must be taken by the client when the response is received.                                                                                                                                                                                                                                                                                                                                   |
| additions           | object ([ThreatEntryAdditions](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#ThreatEntryAdditions)) A set of entries to add to a local threat type's list.                                                                                                                                                                                                                                                                                                                                                                            |
| removals            | object ([ThreatEntryRemovals](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#ThreatEntryRemovals)) A set of entries to remove from a local threat type's list. This field may be empty.                                                                                                                                                                                                                                                                                                                                                |
| newVersionToken     | string ([bytes](https://developers.google.com/discovery/v1/type-format) format) The new opaque client version token. This should be retained by the client and passed into the next call of threatLists.computeDiff as 'versionToken'. A separate version token should be stored and used for each threatList.A base64-encoded string.                                                                                                                                                                                                                                   |
| checksum            | object ([Checksum](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#Checksum)) The expected SHA256 hash of the client state; that is, of the sorted list of all hashes present in the database after applying the provided diff. If the client state doesn't match the expected state, the client must discard this diff and retry later.                                                                                                                                                                                                |
| recommendedNextDiff | string ([Timestamp](https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#google.protobuf.Timestamp) format) The soonest the client should wait before issuing any diff request. Querying sooner is unlikely to produce a meaningful diff. Waiting longer is acceptable considering the use case. If this field is not set clients may update as soon as they want.A timestamp in RFC3339 UTC "Zulu" format, with nanosecond resolution and up to nine fractional digits. Examples: "2014-10-02T15:01:23Z" and "2014-10-02T15:01:23.045123456Z". |

### Authorization Scopes

Requires the following OAuth scope:

- `https://www.googleapis.com/auth/cloud-platform`

For more information, see the [Authentication Overview](https://cloud.google.com/docs/authentication/).

## Constraints

The constraints for this diff.

| JSON representation                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| { "maxDiffEntries": integer, "maxDatabaseEntries": integer, "supportedCompressions": \[ enum ([CompressionType](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#CompressionType)) \] } |

| Fields                    |                                                                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| maxDiffEntries            | integer The maximum size in number of entries. The diff will not contain more entries than this value. This should be a power of 2 between 2\*\*10 and 2\*\*20\. If zero, no diff size limit is set.   |
| maxDatabaseEntries        | integer Sets the maximum number of entries that the client is willing to have in the local database. This should be a power of 2 between 2\*\*10 and 2\*\*20\. If zero, no database size limit is set. |
| supportedCompressions\[\] | enum ([CompressionType](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#CompressionType)) The compression types supported by the client.                              |

## CompressionType

The ways in which threat entry sets can be compressed.

| Enums                        |                           |
| ---------------------------- | ------------------------- |
| COMPRESSION_TYPE_UNSPECIFIED | Unknown.                  |
| RAW                          | Raw, uncompressed data.   |
| RICE                         | Rice-Golomb encoded data. |

## ResponseType

The type of response sent to the client.

| Enums                     |                                                                                                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RESPONSE_TYPE_UNSPECIFIED | Unknown.                                                                                                                                                                    |
| DIFF                      | Partial updates are applied to the client's existing local database.                                                                                                        |
| RESET                     | Full updates resets the client's entire local database. This means that either the client had no state, was seriously out-of-date, or the client is believed to be corrupt. |

## ThreatEntryAdditions

Contains the set of entries to add to a local database. May contain a combination of compressed and raw data in a single response.

| JSON representation                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| { "rawHashes": \[ { object ([RawHashes](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#RawHashes)) } \], "riceHashes": { object ([RiceDeltaEncoding](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#RiceDeltaEncoding)) } } |

| Fields        |                                                                                                                                                                                                                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| rawHashes\[\] | object ([RawHashes](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#RawHashes)) The raw SHA256-formatted entries. Repeated to allow returning sets of hashes with different prefix sizes.                                                                                                           |
| riceHashes    | object ([RiceDeltaEncoding](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#RiceDeltaEncoding)) The encoded 4-byte prefixes of SHA256-formatted entries, using a Golomb-Rice encoding. The hashes are converted to uint32, sorted in ascending order, then delta encoded and stored as encodedData. |

## RawHashes

The uncompressed threat entries in hash format. Hashes can be anywhere from 4 to 32 bytes in size. A large majority are 4 bytes, but some hashes are lengthened if they collide with the hash of a popular URI.

Used for sending ThreatEntryAdditons to clients that do not support compression, or when sending non-4-byte hashes to clients that do support compression.

| JSON representation                            |
| ---------------------------------------------- |
| { "prefixSize": integer, "rawHashes": string } |

| Fields     |                                                                                                                                                                                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| prefixSize | integer The number of bytes for each prefix encoded below. This field can be anywhere from 4 (shortest prefix) to 32 (full SHA256 hash). In practice this is almost always 4, except in exceptional circumstances.                                                |
| rawHashes  | string ([bytes](https://developers.google.com/discovery/v1/type-format) format) The hashes, in binary format, concatenated into one long string. Hashes are sorted in lexicographic order. For JSON API users, hashes are base64-encoded.A base64-encoded string. |

## RiceDeltaEncoding

The Rice-Golomb encoded data. Used for sending compressed 4-byte hashes or compressed removal indices.

| JSON representation                                                                              |
| ------------------------------------------------------------------------------------------------ |
| { "firstValue": string, "riceParameter": integer, "entryCount": integer, "encodedData": string } |

| Fields        |                                                                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| firstValue    | string ([int64](https://developers.google.com/discovery/v1/type-format) format) The offset of the first entry in the encoded data, or, if only a single integer was encoded, that single integer's value. If the field is empty or missing, assume zero. |
| riceParameter | integer The Golomb-Rice parameter, which is a number between 2 and 28\. This field is missing (that is, zero) if numEntries is zero.                                                                                                                     |
| entryCount    | integer The number of entries that are delta encoded in the encoded data. If only a single integer was encoded, this will be zero and the single value will be stored in firstValue.                                                                     |
| encodedData   | string ([bytes](https://developers.google.com/discovery/v1/type-format) format) The encoded deltas that are encoded using the Golomb-Rice coder.A base64-encoded string.                                                                                 |

## ThreatEntryRemovals

Contains the set of entries to remove from a local database.

| JSON representation                                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| { "rawIndices": { object ([RawIndices](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#RawIndices)) }, "riceIndices": { object ([RiceDeltaEncoding](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#RiceDeltaEncoding)) } } |

| Fields      |                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| rawIndices  | object ([RawIndices](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#RawIndices)) The raw removal indices for a local list.                                                                                                                                                                                                                    |
| riceIndices | object ([RiceDeltaEncoding](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff#RiceDeltaEncoding)) The encoded local, lexicographically-sorted list indices, using a Golomb-Rice encoding. Used for sending compressed removal indices. The removal indices (uint32) are sorted in ascending order, then delta encoded and stored as encodedData. |

## RawIndices

A set of raw indices to remove from a local list.

| JSON representation          |
| ---------------------------- |
| { "indices": \[ integer \] } |

| Fields      |                                                                           |
| ----------- | ------------------------------------------------------------------------- |
| indices\[\] | integer The indices to remove from a lexicographically-sorted local list. |

## Checksum

The expected state of a client's local database.

| JSON representation  |
| -------------------- |
| { "sha256": string } |

| Fields |                                                                                                                                                                                                                 |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sha256 | string ([bytes](https://developers.google.com/discovery/v1/type-format) format) The SHA256 hash of the client state; that is, of the sorted list of all hashes present in the database.A base64-encoded string. |

Send feedback
