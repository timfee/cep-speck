- [HTTP request](undefined/#body.HTTP%5FTEMPLATE)
- [Path parameters](undefined/#body.PATH%5FPARAMETERS)
- [Request body](undefined/#body.request%5Fbody)
  - [JSON representation](undefined/#body.request%5Fbody.SCHEMA%5FREPRESENTATION)
- [Response body](undefined/#body.response%5Fbody)
- [Authorization Scopes](undefined/#body.aspect)
- [Submission](undefined/#Submission)
  - [JSON representation](undefined/#Submission.SCHEMA%5FREPRESENTATION)
- [ThreatInfo](undefined/#ThreatInfo)
  - [JSON representation](undefined/#ThreatInfo.SCHEMA%5FREPRESENTATION)
- [AbuseType](undefined/#AbuseType)
- [Confidence](undefined/#Confidence)
  - [JSON representation](undefined/#Confidence.SCHEMA%5FREPRESENTATION)
- [ConfidenceLevel](undefined/#ConfidenceLevel)
- [ThreatJustification](undefined/#ThreatJustification)
  - [JSON representation](undefined/#ThreatJustification.SCHEMA%5FREPRESENTATION)
- [JustificationLabel](undefined/#JustificationLabel)
- [ThreatDiscovery](undefined/#ThreatDiscovery)
  - [JSON representation](undefined/#ThreatDiscovery.SCHEMA%5FREPRESENTATION)
- [Platform](undefined/#Platform)

Submits a URI suspected of containing malicious content to be reviewed. Returns a google.longrunning.Operation which, once the review is complete, is updated with its result. You can use the [Pub/Sub API](https://cloud.google.com/pubsub) to receive notifications for the returned Operation. If the result verifies the existence of malicious content, the site will be added to the [Google's Social Engineering lists](https://support.google.com/webmasters/answer/6350487/) in order to protect users that could get exposed to this threat in the future. Only allowlisted projects can use this method during Early Access. Please reach out to Sales or your customer engineer to obtain access.

### HTTP request

`POST https://webrisk.googleapis.com/v1/{parent=projects/*}/uris:submit`

The URL uses [gRPC Transcoding](https://google.aip.dev/127) syntax.

### Path parameters

| Parameters |                                                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| parent     | string Required. The name of the project that is making the submission. This string is in the format "projects/{project_number}". |

### Request body

The request body contains data with the following structure:

| JSON representation                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| { "submission": { object ([Submission](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#Submission)) }, "threatInfo": { object ([ThreatInfo](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#ThreatInfo)) }, "threatDiscovery": { object ([ThreatDiscovery](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#ThreatDiscovery)) } } |

| Fields          |                                                                                                                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| submission      | object ([Submission](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#Submission)) Required. The submission that contains the URI to be scanned.                      |
| threatInfo      | object ([ThreatInfo](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#ThreatInfo)) Provides additional information about the submission.                              |
| threatDiscovery | object ([ThreatDiscovery](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#ThreatDiscovery)) Provides additional information about how the submission was discovered. |

### Response body

If successful, the response body contains an instance of `[Operation](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.operations#Operation)`.

### Authorization Scopes

Requires the following OAuth scope:

- `https://www.googleapis.com/auth/cloud-platform`

For more information, see the [Authentication Overview](https://cloud.google.com/docs/authentication/).

## Submission

Wraps a URI that might be displaying malicious content.

| JSON representation                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------- |
| { "uri": string, "threatTypes": \[ enum ([ThreatType](https://cloud.google.com/web-risk/docs/reference/rest/v1/ThreatType)) \] } |

| Fields          |                                                                                                                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| uri             | string Required. The URI that is being reported for malicious content to be analyzed.                                                                                                                                                         |
| threatTypes\[\] | enum ([ThreatType](https://cloud.google.com/web-risk/docs/reference/rest/v1/ThreatType)) Output only. ThreatTypes found to be associated with the submitted URI after reviewing it. This might be empty if the URI was not added to any list. |

## ThreatInfo

Context about the submission including the type of abuse found on the URI and supporting details.

| JSON representation                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| { "abuseType": enum ([AbuseType](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#AbuseType)), "threatConfidence": { object ([Confidence](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#Confidence)) }, "threatJustification": { object ([ThreatJustification](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#ThreatJustification)) } } |

| Fields              |                                                                                                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| abuseType           | enum ([AbuseType](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#AbuseType)) The type of abuse.                                         |
| threatConfidence    | object ([Confidence](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#Confidence)) Confidence that the URI is unsafe.                     |
| threatJustification | object ([ThreatJustification](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#ThreatJustification)) Context about why the URI is unsafe. |

## AbuseType

The abuse type found on the URI.

| Enums                  |                                      |
| ---------------------- | ------------------------------------ |
| ABUSE_TYPE_UNSPECIFIED | Default.                             |
| MALWARE                | The URI contains malware.            |
| SOCIAL_ENGINEERING     | The URI contains social engineering. |
| UNWANTED_SOFTWARE      | The URI contains unwanted software.  |

## Confidence

Confidence that a URI is unsafe.

| JSON representation                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| { // Union field value can be only one of the following: "score": number, "level": enum ([ConfidenceLevel](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#ConfidenceLevel)) // End of list of possible types for union field value. } |

| Fields                                                    |                                                                                                                                                            |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Union field value.value can be only one of the following: |                                                                                                                                                            |
| score                                                     | number A decimal representation of confidence in the range of 0 to 1 where 0 indicates no confidence and 1 indicates complete confidence.                  |
| level                                                     | enum ([ConfidenceLevel](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#ConfidenceLevel)) Enum representation of confidence. |

## ConfidenceLevel

Enum representation of confidence.

| Enums                        |                                                        |
| ---------------------------- | ------------------------------------------------------ |
| CONFIDENCE_LEVEL_UNSPECIFIED | Default.                                               |
| LOW                          | Less than 60% confidence that the URI is unsafe.       |
| MEDIUM                       | Between 60% and 80% confidence that the URI is unsafe. |
| HIGH                         | Greater than 80% confidence that the URI is unsafe.    |

## ThreatJustification

Context about why the URI is unsafe.

| JSON representation                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| { "labels": \[ enum ([JustificationLabel](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#JustificationLabel)) \], "comments": \[ string \] } |

| Fields       |                                                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| labels\[\]   | enum ([JustificationLabel](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#JustificationLabel)) Labels associated with this URI that explain how it was classified. |
| comments\[\] | string Free-form context on why this URI is unsafe.                                                                                                                                               |

## JustificationLabel

Labels that explain how the URI was classified.

| Enums                           |                                                                 |
| ------------------------------- | --------------------------------------------------------------- |
| JUSTIFICATION_LABEL_UNSPECIFIED | Default.                                                        |
| MANUAL_VERIFICATION             | The submitter manually verified that the submission is unsafe.  |
| USER_REPORT                     | The submitter received the submission from an end user.         |
| AUTOMATED_REPORT                | The submitter received the submission from an automated system. |

## ThreatDiscovery

Details about how the threat was discovered.

| JSON representation                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| { "platform": enum ([Platform](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#Platform)), "regionCodes": \[ string \] } |

| Fields          |                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| platform        | enum ([Platform](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#Platform)) Platform on which the threat was discovered. |
| regionCodes\[\] | string CLDR region code of the countries/regions the URI poses a threat ordered from most impact to least impact. Example: "US" for United States.     |

## Platform

Platform types.

| Enums                |                           |
| -------------------- | ------------------------- |
| PLATFORM_UNSPECIFIED | Default.                  |
| ANDROID              | General Android platform. |
| IOS                  | General iOS platform.     |
| MACOS                | General macOS platform.   |
| WINDOWS              | General Windows platform. |

Send feedback
