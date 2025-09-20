- [REST Resource: v1eap1](undefined/#v1eap1)
- [REST Resource: v1beta1.hashes](undefined/#v1beta1.hashes)
- [REST Resource: v1beta1.threatLists](undefined/#v1beta1.threatLists)
- [REST Resource: v1beta1.uris](undefined/#v1beta1.uris)
- [REST Resource: v1.hashes](undefined/#v1.hashes)
- [REST Resource: v1.projects.operations](undefined/#v1.projects.operations)
- [REST Resource: v1.projects.uris](undefined/#v1.projects.uris)
- [REST Resource: v1.threatLists](undefined/#v1.threatLists)
- [REST Resource: v1.uris](undefined/#v1.uris)

## Service: webrisk.googleapis.com

To call this service, we recommend that you use the Google-provided [client libraries](https://cloud.google.com/apis/docs/client-libraries-explained). If your application needs to use your own libraries to call this service, use the following information when you make the API requests.

### Discovery document

A [Discovery Document](https://developers.google.com/discovery/v1/reference/apis) is a machine-readable specification for describing and consuming REST APIs. It is used to build client libraries, IDE plugins, and other tools that interact with Google APIs. One service may provide multiple discovery documents. This service provides the following discovery documents:

- <https://webrisk.googleapis.com/$discovery/rest?version=v1>
- <https://webrisk.googleapis.com/$discovery/rest?version=v1eap1>
- <https://webrisk.googleapis.com/$discovery/rest?version=v1beta1>

### Service endpoint

A [service endpoint](https://cloud.google.com/apis/design/glossary#api%5Fservice%5Fendpoint) is a base URL that specifies the network address of an API service. One service might have multiple service endpoints. This service has the following service endpoint and all URIs below are relative to this service endpoint:

- `https://webrisk.googleapis.com`

## REST Resource: [v1eap1](https://cloud.google.com/web-risk/docs/reference/rest/v1eap1/TopLevel)

| Methods                                                                                          |                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [evaluateUri](https://cloud.google.com/web-risk/docs/reference/rest/v1eap1/TopLevel/evaluateUri) | POST /v1eap1:evaluateUri Evaluates the maliciousness of the URI according to the given threat types based on blocklists, machine learning models and heuristic rules. |

## REST Resource: [v1beta1.hashes](https://cloud.google.com/web-risk/docs/reference/rest/v1beta1/hashes)

| Methods                                                                               |                                                                                       |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [search](https://cloud.google.com/web-risk/docs/reference/rest/v1beta1/hashes/search) | GET /v1beta1/hashes:search Gets the full hashes that match the requested hash prefix. |

## REST Resource: [v1beta1.threatLists](https://cloud.google.com/web-risk/docs/reference/rest/v1beta1/threatLists)

| Methods                                                                                              |                                                                              |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [computeDiff](https://cloud.google.com/web-risk/docs/reference/rest/v1beta1/threatLists/computeDiff) | GET /v1beta1/threatLists:computeDiff Gets the most recent threat list diffs. |

## REST Resource: [v1beta1.uris](https://cloud.google.com/web-risk/docs/reference/rest/v1beta1/uris)

| Methods                                                                             |                                                                                               |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [search](https://cloud.google.com/web-risk/docs/reference/rest/v1beta1/uris/search) | GET /v1beta1/uris:search This method is used to check whether a URI is on a given threatList. |

## REST Resource: [v1.hashes](https://cloud.google.com/web-risk/docs/reference/rest/v1/hashes)

| Methods                                                                          |                                                                                  |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [search](https://cloud.google.com/web-risk/docs/reference/rest/v1/hashes/search) | GET /v1/hashes:search Gets the full hashes that match the requested hash prefix. |

## REST Resource: [v1.projects.operations](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.operations)

| Methods                                                                                       |                                                                                                                |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [cancel](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.operations/cancel) | POST /v1/{name=projects/\*/operations/\*}:cancel Starts asynchronous cancellation on a long-running operation. |
| [delete](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.operations/delete) | DELETE /v1/{name=projects/\*/operations/\*} Deletes a long-running operation.                                  |
| [get](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.operations/get)       | GET /v1/{name=projects/\*/operations/\*} Gets the latest state of a long-running operation.                    |
| [list](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.operations/list)     | GET /v1/{name=projects/\*}/operations Lists operations that match the specified filter in the request.         |

## REST Resource: [v1.projects.uris](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris)

| Methods                                                                                 |                                                                                                                   |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [submit](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit) | POST /v1/{parent=projects/\*}/uris:submit Submits a URI suspected of containing malicious content to be reviewed. |

## REST Resource: [v1.threatLists](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists)

| Methods                                                                                         |                                                                         |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [computeDiff](https://cloud.google.com/web-risk/docs/reference/rest/v1/threatLists/computeDiff) | GET /v1/threatLists:computeDiff Gets the most recent threat list diffs. |

## REST Resource: [v1.uris](https://cloud.google.com/web-risk/docs/reference/rest/v1/uris)

| Methods                                                                        |                                                                                          |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| [search](https://cloud.google.com/web-risk/docs/reference/rest/v1/uris/search) | GET /v1/uris:search This method is used to check whether a URI is on a given threatList. |

Send feedback
