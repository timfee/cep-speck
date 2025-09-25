## Service: webrisk.googleapis.com

The Service name `webrisk.googleapis.com` is needed to create RPC client stubs.

## `[google.cloud.webrisk.v1.WebRiskService](https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1#google.cloud.webrisk.v1.WebRiskService)`

| Methods                                                                                                                                                            |                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [ComputeThreatListDiff](https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1#google.cloud.webrisk.v1.WebRiskService.ComputeThreatListDiff) | Gets the most recent threat list diffs.                                 |
| [SearchHashes](https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1#google.cloud.webrisk.v1.WebRiskService.SearchHashes)                   | Gets the full hashes that match the requested hash prefix.              |
| [SearchUris](https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1#google.cloud.webrisk.v1.WebRiskService.SearchUris)                       | This method is used to check whether a URI is on a given threatList.    |
| [SubmitUri](https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1#google.cloud.webrisk.v1.WebRiskService.SubmitUri)                         | Submits a URI suspected of containing malicious content to be reviewed. |

## `[google.cloud.webrisk.v1beta1.WebRiskServiceV1Beta1](https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1beta1#google.cloud.webrisk.v1beta1.WebRiskServiceV1Beta1)`

| Methods                                                                                                                                                                             |                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [ComputeThreatListDiff](https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1beta1#google.cloud.webrisk.v1beta1.WebRiskServiceV1Beta1.ComputeThreatListDiff) | Gets the most recent threat list diffs.                              |
| [SearchHashes](https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1beta1#google.cloud.webrisk.v1beta1.WebRiskServiceV1Beta1.SearchHashes)                   | Gets the full hashes that match the requested hash prefix.           |
| [SearchUris](https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1beta1#google.cloud.webrisk.v1beta1.WebRiskServiceV1Beta1.SearchUris)                       | This method is used to check whether a URI is on a given threatList. |

## `[google.cloud.webrisk.v1eap1.WebRiskServiceV1EAP1](https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1eap1#google.cloud.webrisk.v1eap1.WebRiskServiceV1EAP1)`

| Methods                                                                                                                                                      |                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [EvaluateUri](https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1eap1#google.cloud.webrisk.v1eap1.WebRiskServiceV1EAP1.EvaluateUri) | Evaluates the maliciousness of the URI according to the given threat types based on blocklists, machine learning models and heuristic rules. |

## `[google.longrunning.Operations](https://cloud.google.com/web-risk/docs/reference/rpc/google.longrunning#google.longrunning.Operations)`

| Methods                                                                                                                                  |                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [CancelOperation](https://cloud.google.com/web-risk/docs/reference/rpc/google.longrunning#google.longrunning.Operations.CancelOperation) | Starts asynchronous cancellation on a long-running operation.                                                                |
| [DeleteOperation](https://cloud.google.com/web-risk/docs/reference/rpc/google.longrunning#google.longrunning.Operations.DeleteOperation) | Deletes a long-running operation.                                                                                            |
| [GetOperation](https://cloud.google.com/web-risk/docs/reference/rpc/google.longrunning#google.longrunning.Operations.GetOperation)       | Gets the latest state of a long-running operation.                                                                           |
| [ListOperations](https://cloud.google.com/web-risk/docs/reference/rpc/google.longrunning#google.longrunning.Operations.ListOperations)   | Lists operations that match the specified filter in the request.                                                             |
| [WaitOperation](https://cloud.google.com/web-risk/docs/reference/rpc/google.longrunning#google.longrunning.Operations.WaitOperation)     | Waits until the specified long-running operation is done or reaches at most a specified timeout, returning the latest state. |

Send feedback
