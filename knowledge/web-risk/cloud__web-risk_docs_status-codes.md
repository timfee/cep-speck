# HTTP status codes

HTTP status codes the server can generate in response to HTTP requests:

- `200 OK`: Successful request.
- `400 Bad Request`: Invalid argument (invalid request payload).
- `403 Forbidden`: Permission denied (e.g. invalid API key).
- `429 Resource Exhausted`: Either out of resource quota or reaching rate limiting.
- `500 Internal Server Error`: Internal server error (retry your request).
- `503 Service Unavailable`: Unavailable.
- `504 Gateway Timeout`: Deadline exceeded (retry your request).

**Note:** Clients that receive an unsuccessful HTTP response (that is, any HTTP status code other than `200 OK`) must enter[back-off mode](https://cloud.google.com/web-risk/docs/request-frequency#back-off-mode).

Possible reasons for receiving HTTP status code `400 Bad Request`:

- [hashes.search](https://cloud.google.com/web-risk/docs/reference/rest/v1/hashes/search): Invalid hash.
- [threatLists.computeDiff](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff): Empty update request, or invalid configuration.
  Send feedback
