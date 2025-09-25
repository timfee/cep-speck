# Detect malicious URLs with Web Risk

## Before you begin

- Create a Google Cloud project. [Learn how to create a Google Cloud project](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating%5Fa%5Fproject).
- [Make sure that billing is enabled for your Google Cloud project](https://cloud.google.com/billing/docs/how-to/verify-billing-enabled#confirm%5Fbilling%5Fis%5Fenabled%5Fon%5Fa%5Fproject).

## Set up authentication and enable the Web Risk API

1. Sign in to your Google Cloud account. If you're new to Google Cloud, [ create an account](https://console.cloud.google.com/freetrial) to evaluate how our products perform in real-world scenarios. New customers also get $300 in free credits to run, test, and deploy workloads.
2. [Install](https://cloud.google.com/sdk/docs/install) the Google Cloud CLI.
3. If you're using an external identity provider (IdP), you must first[ sign in to the gcloud CLI with your federated identity](https://cloud.google.com/iam/docs/workforce-log-in-gcloud).
4. To [initialize](https://cloud.google.com/sdk/docs/initializing) the gcloud CLI, run the following command:  
   gcloud init
5. [Create or select a Google Cloud project](https://cloud.google.com/resource-manager/docs/creating-managing-projects).  
   **Note**: If you don't plan to keep the resources that you create in this procedure, create a project instead of selecting an existing project. After you finish these steps, you can delete the project, removing all resources associated with the project.
   - Create a Google Cloud project:  
     gcloud projects create PROJECT_ID  
     Replace `PROJECT_ID` with a name for the Google Cloud project you are creating.
   - Select the Google Cloud project that you created:  
     gcloud config set project PROJECT_ID  
     Replace `PROJECT_ID` with your Google Cloud project name.
6. [Make sure that billing is enabled for your Google Cloud project](https://cloud.google.com/billing/docs/how-to/verify-billing-enabled#confirm%5Fbilling%5Fis%5Fenabled%5Fon%5Fa%5Fproject).
7. Enable the Web Risk API:  
   gcloud services enable webrisk.googleapis.com
8. [Install](https://cloud.google.com/sdk/docs/install) the Google Cloud CLI.
9. If you're using an external identity provider (IdP), you must first[ sign in to the gcloud CLI with your federated identity](https://cloud.google.com/iam/docs/workforce-log-in-gcloud).
10. To [initialize](https://cloud.google.com/sdk/docs/initializing) the gcloud CLI, run the following command:  
    gcloud init
11. [Create or select a Google Cloud project](https://cloud.google.com/resource-manager/docs/creating-managing-projects).  
    **Note**: If you don't plan to keep the resources that you create in this procedure, create a project instead of selecting an existing project. After you finish these steps, you can delete the project, removing all resources associated with the project.

- Create a Google Cloud project:  
  gcloud projects create PROJECT_ID  
  Replace `PROJECT_ID` with a name for the Google Cloud project you are creating.
- Select the Google Cloud project that you created:  
  gcloud config set project PROJECT_ID  
  Replace `PROJECT_ID` with your Google Cloud project name.

12. [Make sure that billing is enabled for your Google Cloud project](https://cloud.google.com/billing/docs/how-to/verify-billing-enabled#confirm%5Fbilling%5Fis%5Fenabled%5Fon%5Fa%5Fproject).
13. Enable the Web Risk API:  
    gcloud services enable webrisk.googleapis.com

## Using the APIs

When you use the Web Risk APIs, make sure you're familiar with Web Risk's [Service Level Agreement](https://cloud.google.com/web-risk/sla) and [usage limits](https://cloud.google.com/web-risk/quotas).

To start using Web Risk, see these topics:

- [Using the Lookup API](https://cloud.google.com/web-risk/docs/lookup-api)
- [Using the Update API](https://cloud.google.com/web-risk/docs/update-api)

## Which API is right for me? Lookup or Update?

Web Risk provides two different APIs that you may integrate with. These APIs are the [Lookup API](https://cloud.google.com/web-risk/docs/lookup-api) and the [Update API](https://cloud.google.com/web-risk/docs/update-api). Both of these APIs provide the same information. That is, whether a URL has been identified as malicious. The easiest to use is the Lookup API. Using the Lookup API, you will query Web Risk for every URL you wish to check.

The Update API is more complex but has some desirable properties. Using the Update API, you will maintain a local database. This database may be checked to see if a URL is malicious. This database acts as a bloom filter. That is, there may be false positives (a URL is identified as malicious but isn't) but there should not be any false negatives (a URL is identified as not malicious, but is). Because of this, the Web Risk servers are rarely contacted, and are only contacted to confirm matches and disambiguate false positives. In most cases, when checking a URL using the Update API you won't need to contact the Web Risk servers at all. You are expected to contact Web Risk servers only when updating the local database and when confirming a URL is harmful.

In summary, use the Lookup API if you want to get set up quickly and easily. Use the Update API if you need lower latency URL checking.

## Choosing the Right Client Features

If you chose to use the Update API, you may not need to implement the entire specification. There are some features that were designed for widely distributed clients (like web browsers) that are over-optimizations in many enterprise cases.

There are some features that may be ignored for easier integration.

Here are the Web Risk integration solutions in order of complexity

1. Use the LookUp API
2. Basic Update API client
3. Update API client using diffs
4. Update API client using RICE compressed diffs

### Using the Lookup API

Using the Lookup API has the lowest complexity. Whenever there is a potentially suspicious URL, simply call the Lookup API with the URL to see a verdict. Canonicalization and formatting the URL is handled by the Web Risk server. This solution should be valid for most clients unless average latency exceeds requirements.

### Basic Update API client

The Update API requires the additional complexity of managing a local database and canonicalized URLs before queries.

In a typical client integration with Web Risk, a client will apply database diffs to remain up-to-date. The diff application logic may take some time to implement correctly, so in the simplest cases we recommend clients ignore diffs and request a full new database from Web Risk every cycle. This database will still be stored in memory for efficient querying. Requesting a full database reset is done by leaving the `versionToken` field empty in the[threatLists.computeDiff request](https://cloud.google.com/web-risk/docs/update-api#http%5Fget%5Frequest). This solution should be valid for clients unless bandwidth or database synchronization latency exceeds requirements.

### Use the Update API and request diff updates

This solution has the added complexity of applying the diff logic to the local database. For more information, see[Database Diffs](https://cloud.google.com/web-risk/docs/local-databases#full-updates). Using diffs will reduce bandwidth at the expense of complexity, compared to requesting a new database each cycle. A full database update may be on the order of a few megabytes. This solution should be sufficient for most enterprise clients.

### Use the Update API and request RICE encoded diff updates

This solution is the most efficient client integration possible. RICE encoding compresses DIFF sizes and further reduces update bandwidth. This solution is intended to be used by the most bandwidth constrained customers. An example where this may be relevant is if Web Risk queries are built into a phone App. The users of such an app would surely appreciate a lower bandwidth solution if they needed to update the database over phone data. For more information, see [Compression](https://cloud.google.com/web-risk/docs/compression).

Send feedback
