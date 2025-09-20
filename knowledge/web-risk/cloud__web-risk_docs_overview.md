# Overview of Web Risk

Web Risk is a new enterprise security product that lets your client applications check URLs against Google's constantly updated lists of unsafe web resources. Examples of unsafe web resources are social engineering sites, like phishing and deceptive sites, and sites that host malware or unwanted software. Any URL found on this list is considered unsafe. Google works to provide the most accurate and up-to-date information about unsafe web resources. However, Google cannot guarantee that its information is comprehensive and error-free: some risky sites may not be identified, and some safe sites may be classified in error.

To determine if a URL is on any of the lists, clients can use either the Lookup API or the Update API .

**Note:** The information returned by the Web Risk must not be redistributed.

## Lookup API

The Lookup API lets your client applications send URLs to the Web Risk server to check their status. This API is simple and easy to use, because it avoids the complexities of the Update API.

### Advantages

- **Simple URL checks**: You send an HTTP GET request with the actual URL, and the server responds with the state of the URL (safe or unsafe).

### Drawbacks

- **Privacy**: URLs aren't hashed, so the server knows which URLs you look up.
- **Response time**: Every lookup request is processed by the server. We don't provide guarantees on lookup response time.

If you aren't too concerned about the privacy of the queried URLs, and you can tolerate the latency induced by a network request, consider using the Lookup API because it's easier to use.

## Update API

The Update API lets your client applications download and store hashed versions of the unsafe lists in a local database, and check them locally. Only if a match is found in the local database does the client need to send a request to the Web Risk servers to verify whether the URL is included on the unsafe lists. This API is more complex to implement than the Lookup API, but enables local lookups in most cases so it's faster.

### Advantages

- **Privacy**: You exchange data with the server infrequently (only after a local hash prefix match) and using hashed URLs, so the server never knows the actual URLs queried by the clients.
- **Response time**: You maintain a local database that contains copies of the Web Risk lists; they do not need to query the server every time they want to check a URL.

### Drawbacks

- **Implementation**: You need to set up a local database and then download, and periodically update, the local copies of the Web Risk lists (stored as variable-length SHA256 hashes).
- **Complex URL checks**: You need to know how to canonicalize URLs, create suffix/prefix expressions, and compute SHA256 hashes for comparison with the local copies of the Web Risk lists and the Web Risk lists stored on the server.

If you are concerned about the privacy of the queried URLs or the latency induced by a network request, use the Update API.

## What's next

- Learn how to [set up Web Risk](https://cloud.google.com/web-risk/docs/quickstart).
  Send feedback
