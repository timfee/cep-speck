# Local Databases

This document applies to the following method:[Update API](https://cloud.google.com/web-risk/docs/update-api).

## Database setup

Clients using the Update API are required to set up a local database and to perform an initial download of the Web Risk lists they want to work with. See the[Full updates](https://cloud.google.com/web-risk/docs/local-databases#full-updates) section below for more information on how to perform the initial fetch.

## Database updates

To ensure protection against the latest threats, clients are strongly encouraged to regularly update their local Web Risk lists using the[threatLists.computeDiff](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff)method.

The `threatLists.computeDiff` request specifies the list to be updated. If clients have memory or bandwidth limitations, they can also use the request to set update constraints (see[Update Constraints](https://cloud.google.com/web-risk/docs/update-constraints)).

The `threatLists.computeDiff response` returns either a full update or partial update for each list, as explained below.

### Full updates

Full updates are returned when the client leaves the `versionToken` field in the[threatLists.computeDiff request](https://cloud.google.com/web-risk/docs/update-api#http%5Fget%5Frequest)empty or when the server determines a full update is required. For full updates, only [additions](https://cloud.google.com/web-risk/docs/local-databases#additions) are returned. The client is expected to _clear the local database_ before applying the updates and performing the[validation check](https://cloud.google.com/web-risk/docs/local-databases#validation-checks).

#### Empty state

Full updates are returned when the client sends the initial request for a list. In this case, the `versionToken` field in the request is left empty (because there is no value to provide) and the `newVersionToken` field in the response returns the initial state for the local list. Full updates are also returned when the client purposely leaves the `versionToken` field empty on subsequent requests. This will force a full update and return a new state in the`newVersionToken` field of the response.

#### Server decision

Occasionally, the Web Risk server returns a full update when only a partial update was requested by the client. This can happen when the client initially downloads a small version of the list and then updates to a larger version of the list; the server will simply return a full update with the entire list. This can also happen if the client hasn't downloaded data in a long time and requests a partial update; again, the server will simply return a full update with the entire list.

### Partial updates

Partial updates are returned when the client supplies a value for the`versionToken` field in the[threatLists.computeDiff request](https://cloud.google.com/web-risk/docs/update-api#http%5Fget%5Frequest)(the exception, as noted above, is when the server determines a full update is required). For partial updates, both[additions](https://cloud.google.com/web-risk/docs/local-databases#additions) and[removals](https://cloud.google.com/web-risk/docs/local-databases#removals) are returned. The client updates the lists in the local database (applying the removals before the additions) and then performs the[validation check](https://cloud.google.com/web-risk/docs/local-databases#validation-checks).

### Additions

Additions are SHA256 hash prefixes that should be added to the local database. Most hash prefixes are 4 bytes long but some hash prefixes could have any length between 4 and 32 bytes. Therefore, multiple sets of additions could be returned; for example, one containing the 4-byte prefixes and one containing 5-byte prefixes.

If the client supports compression, the response can be compressed using Rice compression. However, only 4-byte hash prefixes get compressed. Longer hash prefixes are always sent in uncompressed, raw format. For more details, see[Compression](https://cloud.google.com/web-risk/docs/compression).

### Removals

Removals are zero-based indices in the lexicographically-sorted client database pointing at entries that should be removed from the local database. Only one set of removals will be returned.

If the client supports compression, "rice hashes" and "rice indices" are returned. If compression is not supported, "raw hashes" and "raw indices" are returned. For more details, see Compression/web-risk/docs/compression).

## Validation checks

When the[threatLists.computeDiff response](https://cloud.google.com/web-risk/docs/update-api#http%5Fget%5Fresponse)is returned; with either a full update or a partial update; the client is expected to perform a validation check.

The client first updates the lists in the local database (applying the removals before the additions). The client then computes the SHA256 hash of the (lexicographically sorted) local list and compares it to the checksum returned in the response. If the two values are equal, the Web Risk list is considered "correct."

If the two values are not equal, the Web Risk list is considered "corrupt." The client must clear the list from the database and reissue a second update with the `versionToken` field set to the empty string; this will force a full update and return a brand new list and state.

Send feedback
