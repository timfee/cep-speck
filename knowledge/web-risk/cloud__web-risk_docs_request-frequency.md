# Request Frequency

## Update requests

To prevent server overload and to benefit from optimal protection, the Update API imposes time intervals for how often a client can send requests to the Web Risk server to perform URL checks ([hashes.search](https://cloud.google.com/web-risk/docs/update-api#example-hashessearch)) or to update the local database ([threatLists.computeDiff](https://cloud.google.com/web-risk/docs/update-api#example-threatlistsComputediff)).

The initial request for data must happen at a random interval between 0 and 1 minutes after the client starts or wakes up. Subsequent requests can happen only after the[minimum wait duration](https://cloud.google.com/web-risk/docs/request-frequency#minimum%5Fwait%5Fduration)or[back-off mode](https://cloud.google.com/web-risk/docs/request-frequency#back%5Foff%5Fmode)time limit has been observed.

## Minimum wait duration

Both the[hashes.search response](https://cloud.google.com/web-risk/docs/update-api#http%5Fpost%5Fresponse%5F2)and[threatLists.computeDiff response](https://cloud.google.com/web-risk/docs/update-api#http%5Fpost%5Fresponse)have a `minimumWaitDuration` field that clients must obey.

If the `minimumWaitDuration` field **is not set** in the response, clients can update as frequently as they want and send as many`threatListUpdates` or `fullHashes` requests as they want.

If the `minimumWaitDuration` field **is set** in the response, clients cannot update more frequently than the length of the wait duration. For example, if a `fullHashes` response contains a minimum wait duration of 1 hour, the client must not send send any `fullHashes` requests until that hour passes, even if the user is visiting a URL whose hash prefix matches the local database. (Note that clients can update less frequently than the minimum wait duration but this may negatively affect protection.)

## Back-off mode

For the recommended backoff procedure, read our[Service Level Agreement](https://cloud.google.com/web-risk/sla).

Send feedback
