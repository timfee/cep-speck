# Update Constraints

## Setting constraints

When updating local databases, as described in [Database Updates](https://cloud.google.com/web-risk/docs/local-databases#database-updates), clients can use the `maxUpdateEntries` and `maxDatabaseEntries` fields in the[hashes.search request](https://cloud.google.com/web-risk/docs/update-api#http%5Fget%5Frequest)to specify size constraints. Clients should set constraints only if they have memory or bandwidth limitations.

- Clients can specify a maximum update response size (`maxUpdateEntries`) in number of entries (1 entry = 1 addition or 1 removal).
- Clients can specify a maximum database size (`maxDatabaseEntries`) in number of entries (the vast majority of entries in the database are 4-byte hash prefixes so it's fair to assume that 1 entry ≈ 4 bytes).

## Bandwidth vs. storage

While clients can specify arbitrary sizes for the update response and database sizes, the Web Risk server only pre-generates a finite number of possible update response and database sizes.

- Clients should use the update response size (`maxUpdateEntries`) to limit bandwidth usage.
- Clients should use the database size (`maxDatabaseEntries`) to limit the amount of RAM or disk storage needed on the device.

Both of these limits have an effect on the size of the database that is being updated, and so they have an impact on the amount of protection provided to the user. This means that the larger the local database size, the better the protection.

## Guidance for setting constraints

Safe Browsing lists can gradually or suddenly change in size. Clients should set the `maxUpdateEntries` for list update requests, which limits the maximum list update response size and improves reliability when large updates cannot be processed.

In the absence of stricter requirements or requirements that are less strict, Google recommends using `maxUpdateEntries=16777216`. With the typical list entry size of 4 bytes per hash prefix, this equates to approximately 67 megabytes per list. Google recommends using the smaller limit`maxUpdateEntries=2097152` for mobile clients, because they are usually less powerful. At the typical list entry size of 4 bytes per hash prefix, this equates to approximately 8 megabytes per list.

Safe Browsing lists differ in size and growth rate. However, clients should set the same constraints for all lists, based on the maximum allowed memory or bandwidth usage for each list.

To improve reliability, Google recommends that clients implement telemetry for detecting memory or bandwidth overusage, as well as mechanisms to quickly deliver new constraints to clients.

## Client state

The Web Risk server never sends an update that leaves the client in an outdated state; clients will be fully up-to-date after every update request. For example, if a client currently has a database of 4096 entries but only wants to download at most 2048 deltas, the server may reset the client to a 2048 database if the client is really out-of-date.

Send feedback
