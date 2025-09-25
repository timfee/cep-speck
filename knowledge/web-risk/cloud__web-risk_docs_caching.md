# Caching

This document applies to the following methods:

- [Lookup API](https://cloud.google.com/web-risk/docs/lookup-api):[uris.search](https://cloud.google.com/web-risk/docs/lookup-api#example-urissearch)
- [Update API](https://cloud.google.com/web-risk/docs/update-api):[hashes.search](https://cloud.google.com/web-risk/docs/update-api#example-hashessearch)

## About caching

To reduce client bandwidth usage and to protect Google from traffic spikes, clients of both the Lookup API and the Update API are required to create and maintain a local cache of threat data. The Lookup API uses the cache to reduce the number of `uris.search` requests that clients send to Google. For the Update API, the cache is used to reduce the number of`hashes.search` requests that clients send to Google. The caching protocol for each API is outlined below.

## Lookup API

Clients of the Lookup API should cache each returned `ThreatUrl` item until the the time defined in the `expireTime` field. Clients then need to consult the cache before making a subsequent `uris.search` request to the server. If the cache entry for a previously returned `ThreatUrl` has not yet expired, the client should assume the item is still unsafe. Caching `ThreatUrl` items may reduce the number of API requests made by the client.

## Update API

To reduce the overall number of `hashes.search` requests sent to Google using the Update API, clients are required to maintain a local cache. The API establishes two types of caching, positive and negative.

### Positive caching

To prevent clients from repeatedly asking about the state of a particular**unsafe** full hash, each returned `ThreatHash` contains a positive cache time (defined by the `expireTime` field). The full hash can be considered unsafe until this time.

### Negative caching

To prevent clients from repeatedly asking about the state of a particular**safe** full hash, the response defines a negative cache duration for the requested prefix (defined by the `negativeExpireTime` field). All full hashes with the requested prefix are to be considered safe for the requested threat types until this time, except for those returned by the server as unsafe. This caching is particularly important as it prevents traffic overload that could be caused by a hash prefix collision with a safe URL that receives a lot of traffic.

### Consulting the cache

When the client wants to check the state of a URL, it first computes its full hash. If the full hash's prefix is present in the local database, the client should then consult its cache before making a `hashes.search` request to the server.

First, clients should check for a positive cache hit. If there exists an unexpired positive cache entry for the full hash of interest, it should be considered unsafe. If the positive cache entry expired, the client must send a`hashes.search` request for the associated local prefix. Per the protocol, if the server returns the full hash, it is considered unsafe; otherwise, it's considered safe.

If there are no positive cache entries for the full hash, the client should check for a negative cache hit. If there exists an unexpired negative cache entry for the associated local prefix, the full hash is considered safe. If the negative cache entry expired, or it doesn't exist, the client must send a`hashes.search` request for the associated local prefix and interpret the response as normal.

### Updating the cache

The client cache should be updated whenever a `hashes.search` response is received. A positive cache entry should be created or updated for the full hash per the`expireTime` field. The hash prefix's negative cache duration should also be created or updated per the response's `negativeExpireTime` field.

If a subsequent `hashes.search` request does not return a full hash that is currently positively cached, the client is not required to remove the positive cache entry. This is not cause for concern in practice, since positive cache durations are typically short (a few minutes) to allow for quick correction of false positives.

### Example scenario

In the following example, assume h(url) is the hash prefix of the URL and H(url) is the full-length hash of the URL. That is, h(url) = SHA256(url).substr(4), H(url) = SHA256(url).

Assume a client with an empty cache visits example.com/ and sees that h(example.com/) is in the local database. The client requests the full-length hashes for hash prefix h(example.com/) and receives back the full-length hash H(example.com/) together with a positive cache expire time of 5 minutes from now and a negative cache expire time of 1 hour from now.

The positive cache duration of 5 minutes tells the client how long the full-length hash H(example.com/) must be considered unsafe without sending another `hashes.search` request. After 5 minutes the client must issue another`hashes.search` request for that prefix h(example.com/) if the client visits example.com/ again. The client should reset the hash prefix's negative cache expire time per the new response.

The negative cache duration of 1 hour tells the client how long all the other full-length hashes besides H(example.com/) that share the same prefix of h(example.com/) must be considered safe. For the duration of 1 hour, every URL such that h(URL) = h(example.com/) must be considered safe, and therefore not result in a `hashes.search` request (assuming that H(URL) != H(example.com/)).

If the `fullHashes` response contains zero matches and a negative cache expire time is set, then the client must not issue any `hashes.search` requests for any of the requested prefixes for the given negative cache time.

If the `hashes.search` response contains one or more matches, a negative cache expire time is still set for the entire response. In that case, the cache expire time of a single full hash indicates how long that the client must assume the particular full-length hash is unsafe. After the `ThreatHash` cache duration elapses, the client must refresh the full-length hash by issuing a `hashes.search` request for that hash prefix if the requested URL matches the existing full-length hash in the cache. In that case the negative cache duration does not apply. The response's negative cache duration only applies to full-length hashes that were not present in the `hashes.search` response. For full-length hashes that are not present in the response, the client must refrain from issuing any `hashes.search`requests until the negative cache duration is elapsed.

Send feedback
