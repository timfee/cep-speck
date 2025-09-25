# Best practices for using the Submission API

This document describes the recommended implementation for the Submission API.

## Improve detection with `ThreatInfo` and `ThreatDiscovery`

We recommend using [ThreatInfo](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#threatinfo) and [ThreatDiscovery](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit#threatdiscovery) fields to provide additional information about submissions, which has the potential to improve detection and increase the chances of a submission being blocked.

- Use `ThreatInfo` fields to provide more information about why the URI is being submitted.
- Use `ThreatDiscovery` fields to provide more information about how the threat was found.

### Example

An attacker launches a credential phishing site targeting clients of a bank based in Italy. Targeted clients begin receiving deceptive text messages from that attacker with a link to a fake login page. The bank receives reports from clients that received the texts, launches an investigation, and confirms that the site is phishing for credentials. To protect their clients, the bank submits the phishing site to Web Risk with the following request body:

```
{
  "submission": {
    "uri": "http://example.com/login.html"
  },
  "threatDiscovery": {
    "platform": "ANDROID",
    "regionCodes": "IT"
  },
  "threatInfo": {
    "abuseType": "SOCIAL_ENGINEERING",
    "threatJustification": {
      "labels": ["USER_REPORT", "MANUAL_VERIFICATION"],
      "comments": "Site is impersonating a bank and phishing for login credentials"
    },
    "threatConfidence": {
      "level": "HIGH"
    }
  }
}

```

When the bank checks the status of the submission with the operation name returned by the Submission API, the status is `SUCCEEDED`, indicating that the submitted URL was added to the Safe Browsing blocklist.

## What's next

- View the API reference for `ThreatInfo` and `ThreatDiscovery` ([RPC](https://cloud.google.com/web-risk/docs/reference/rpc/google.cloud.webrisk.v1#submiturirequest), [Rest](https://cloud.google.com/web-risk/docs/reference/rest/v1/projects.uris/submit))
  Send feedback
