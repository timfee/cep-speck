- [HTTP request](undefined/#body.HTTP%5FTEMPLATE)
- [Request body](undefined/#body.request%5Fbody)
  - [JSON representation](undefined/#body.request%5Fbody.SCHEMA%5FREPRESENTATION)
- [Response body](undefined/#body.response%5Fbody)
  - [JSON representation](undefined/#body.EvaluateUriResponse.SCHEMA%5FREPRESENTATION)
- [Authorization Scopes](undefined/#body.aspect)
- [ThreatType](undefined/#ThreatType)
- [Score](undefined/#Score)
  - [JSON representation](undefined/#Score.SCHEMA%5FREPRESENTATION)
- [ConfidenceLevel](undefined/#ConfidenceLevel)

Evaluates the maliciousness of the URI according to the given threat types based on blocklists, machine learning models and heuristic rules. Multiple threat types can be searched in a single query. The response lists a confidence level for all requested threat types representing the maliciousness of the URI.

### HTTP request

`POST https://webrisk.googleapis.com/v1eap1:evaluateUri`

The URL uses [gRPC Transcoding](https://google.aip.dev/127) syntax.

### Request body

The request body contains data with the following structure:

| JSON representation                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| { "uri": string, "threatTypes": \[ enum ([ThreatType](https://cloud.google.com/web-risk/docs/reference/rest/v1eap1/TopLevel/evaluateUri#ThreatType)) \], "allowScan": boolean } |

| Fields          |                                                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| uri             | string Required. The URI to be evaluated.                                                                                                                         |
| threatTypes\[\] | enum ([ThreatType](https://cloud.google.com/web-risk/docs/reference/rest/v1eap1/TopLevel/evaluateUri#ThreatType)) Required. The threat types to evaluate against. |
| allowScan       | boolean Whether the caller would like to allow this method to scan the provided URI.                                                                              |

### Response body

If successful, the response body contains data with the following structure:

Response type for requests to evaluate URIs.

| JSON representation                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------- |
| { "scores": \[ { object ([Score](https://cloud.google.com/web-risk/docs/reference/rest/v1eap1/TopLevel/evaluateUri#Score)) } \] } |

| Fields     |                                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| scores\[\] | object ([Score](https://cloud.google.com/web-risk/docs/reference/rest/v1eap1/TopLevel/evaluateUri#Score)) Evaluation scores per threat type given. |

### Authorization Scopes

Requires the following OAuth scope:

- `https://www.googleapis.com/auth/cloud-platform`

For more information, see the [Authentication Overview](https://cloud.google.com/docs/authentication/).

## ThreatType

The type of threat.

| Enums                   |                                                                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| THREAT_TYPE_UNSPECIFIED | Default type that indicates this enum hasn't been specified. This is not a valid ThreatType, one of the other types must be specified instead. |
| SOCIAL_ENGINEERING      | Social engineering targeting any platform.                                                                                                     |
| MALWARE                 | Malware targeting any platform.                                                                                                                |
| UNWANTED_SOFTWARE       | Unwanted software targeting any platform.                                                                                                      |

## Score

Score of a URI, represented as a ConfidenceLevel for every threat type given.

| JSON representation                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| { "threatType": enum ([ThreatType](https://cloud.google.com/web-risk/docs/reference/rest/v1eap1/TopLevel/evaluateUri#ThreatType)), "confidenceLevel": enum ([ConfidenceLevel](https://cloud.google.com/web-risk/docs/reference/rest/v1eap1/TopLevel/evaluateUri#ConfidenceLevel)) } |

| Fields          |                                                                                                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| threatType      | enum ([ThreatType](https://cloud.google.com/web-risk/docs/reference/rest/v1eap1/TopLevel/evaluateUri#ThreatType)) Threat type associated with this score.                        |
| confidenceLevel | enum ([ConfidenceLevel](https://cloud.google.com/web-risk/docs/reference/rest/v1eap1/TopLevel/evaluateUri#ConfidenceLevel)) Confidence level according to the given threat type. |

## ConfidenceLevel

Confidence level in how risky a URI is predicted to be.

| Enums                        |                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CONFIDENCE_LEVEL_UNSPECIFIED | Default type that indicates this enum hasn't been specified. This is not a valid ConfidenceLevel, another type must be specified instead.                                                                                                                                                                                                                                                       |
| SAFE                         | URIs that are considered as safe. In most cases, there is no need to classify or recheck their confidence levels again in the near future.                                                                                                                                                                                                                                                      |
| LOW                          | Low confidence that the URI given is risky for this threat type.                                                                                                                                                                                                                                                                                                                                |
| MEDIUM                       | Medium confidence that the URI given is risky for this threat type. The URI is considered as mildly suspicious (i.e., 1000x time more likely to be malicious than a typical random URI). This confidence level is not recommended for direct enforcements. It is useful for finding suspicious leads and/or triggering further classifications.                                                 |
| HIGH                         | High (>10%) confidence that the URI given is risky for this threat type. This confidence level is not recommended for direct enforcements. You can combine this confidence level with your own suspicious signals for enforcements after evaluation and verification.                                                                                                                           |
| HIGHER                       | Higher (>90%) confidence that the URI given is risky for this threat type (with no egregious false positives). You can use this confidence level for your own enforcements after evaluation and verification. When compared to EXTREMELY_HIGH and VERY_HIGH, this increases the coverage (up to 90% more in some cases) of malicious URIs but with a small amount of potential false positives. |
| VERY_HIGH                    | Very high (>99%) confidence that the URI given is risky for this threat type (with no egregious false positives). This level is recommended for blocking malicious URIs from your platforms after evaluation and verification.                                                                                                                                                                  |
| EXTREMELY_HIGH               | Extremely high confidence that the URI given is risky for this threat type. You can use this confidence level for your own enforcements. For example, blocking malicious URIs from your platforms.                                                                                                                                                                                              |

Send feedback
