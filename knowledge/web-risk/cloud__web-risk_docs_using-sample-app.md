# Run the sample Web Risk app

Learn how to install the sample Web Risk Go app from GitHub and how to run the sample app to detect malicious URLs in a Go environment.

---

To follow step-by-step guidance for this task directly in the Google Cloud console, click **Guide me**:

[Guide me](https://console.cloud.google.com/freetrial?redirectPath=/?walkthrough%5Fid=https://cloud-dot-devsite-v2-prod.appspot.com/walkthroughs/web-risk/webrisk%5Fsample%5Fquickstart)

---

## Before you begin

1. Sign in to your Google Cloud account. If you're new to Google Cloud, [ create an account](https://console.cloud.google.com/freetrial) to evaluate how our products perform in real-world scenarios. New customers also get $300 in free credits to run, test, and deploy workloads.
2. In the Google Cloud console, on the project selector page, select or create a Google Cloud project.  
   **Note**: If you don't plan to keep the resources that you create in this procedure, create a project instead of selecting an existing project. After you finish these steps, you can delete the project, removing all resources associated with the project.  
   [Go to project selector](https://console.cloud.google.com/projectselector2/home/dashboard)
3. [Make sure that billing is enabled for your Google Cloud project](https://cloud.google.com/billing/docs/how-to/verify-billing-enabled#confirm%5Fbilling%5Fis%5Fenabled%5Fon%5Fa%5Fproject).
4. Enable the Web Risk API.  
   [Enable the API](https://console.cloud.google.com/flows/enableapi?apiid=webrisk.googleapis.com)
5. In the Google Cloud console, on the project selector page, select or create a Google Cloud project.  
   **Note**: If you don't plan to keep the resources that you create in this procedure, create a project instead of selecting an existing project. After you finish these steps, you can delete the project, removing all resources associated with the project.  
   [Go to project selector](https://console.cloud.google.com/projectselector2/home/dashboard)
6. [Make sure that billing is enabled for your Google Cloud project](https://cloud.google.com/billing/docs/how-to/verify-billing-enabled#confirm%5Fbilling%5Fis%5Fenabled%5Fon%5Fa%5Fproject).
7. Enable the Web Risk API.  
   [Enable the API](https://console.cloud.google.com/flows/enableapi?apiid=webrisk.googleapis.com)
8. Create a new API key for authentication:
   1. In the Google Cloud console navigation menu, click **APIs & Services \> Credentials**.
   2. On the **Credentials** page, click **addCreate credentials** and then select **API key**.
   3. In the **API key created** dialog, to copy the key, click content_copy **Copy key**. Close the dialog and secure the key that you copied for later use.
9. Set up your environment:
   1. In the Google Cloud console, click **Activate Cloud Shell** to open a terminal window.

   The Cloud Shell terminal can take several seconds to fully load.  
    2. Export the API key that you copied.  
   export APIKEY=API_KEY

## Install and run the sample Web Risk app

The sample Web Risk app has the following binaries to detect whether the URLs are malicious or safe:

- [**wrserver** server](https://github.com/google/webrisk/tree/master/cmd/wrserver): This binary runs the Web Risk API lookup proxy that lets you check URLs.
- [**wrlookup** command-line](https://github.com/google/webrisk/tree/master/cmd/wrlookup): This binary filters unsafe URLs piped through STDIN.

This quickstart document shows how to detect whether the URLs are malicious or safe by using the**`wrserver`** server and **`wrlookup`** command-line binaries.

### Check URLs using the `wrserver` server binary

1. In the Cloud Shell terminal, install `wrserver`:  
   go install github.com/google/webrisk/cmd/wrserver@latest
2. Run `wrserver` with your API key:  
   wrserver -apikey=$APIKEY  
   When you see the _Starting server at localhost:8080_ message, `wrserver` is started at `localhost:8080`.
3. To preview the application on the localhost, click **Web Preview** and then select **Preview on port 8080**.  
   Cloud Shell opens the preview URL (port 8080) on its proxy service in a new browser window. The preview URL browser window shows a **404 page not found** message.
4. In the preview URL window, check the following URLs. To check a URL, replace the query string after the preview URL of the local server with the URL you want to check in the following format: `PREVIEW_URL/r?url=URL_TO_BE_CHECKED`.  
    If the URL is unsafe, an interstitial warning page is shown as recommended by Web Risk. If the URL is safe, the client is automatically redirected to the target.  
   A fake malware URL:  
   http://testsafebrowsing.appspot.com/apiv4/ANY_PLATFORM/MALWARE/URL/  
   A safe URL:  
    http://www.google.com/
5. To stop the server, press `Control+C`.

You have successfully verified the URLs by using the `wrserver` server binary.

### Check URLs using the `wrlookup` command-line binary

1. In the Cloud Shell terminal, install the `wrlookup` command-line binary:  
   go install github.com/google/webrisk/cmd/wrlookup@latest
2. Check the URLs with your API key.  
    A fake malware URL:  
    echo "http://testsafebrowsing.appspot.com/apiv4/ANY_PLATFORM/MALWARE/URL/" | wrlookup -apikey=$APIKEY  
The following output is an abbreviated output for a malware URL:  
   ......  
   Unsafe URL: [MALWARE]  
A safe URL:  
 echo "http://www.google.com/" | wrlookup -apikey=$APIKEY  
    The following output is an abbreviated output for a safe URL:  
    ......  
    Safe URL: http://google.com

You have successfully verified the URLs by using the `wrlookup` command-line binary.

## Clean up

To avoid incurring charges to your Google Cloud account for the resources used on this page, follow these steps.

Keep the following things in mind when deleting a project:

- Deleting a project deletes all the resources in the project.
- You cannot reuse the custom project ID of a deleted project.

If you plan to explore multiple tutorials and quickstarts, reusing projects can help you avoid exceeding project quota limits.

To delete your project, do the following:

1. In the Google Cloud console navigation menu, click **IAM & Admin \> Settings**.  
   [Go to Settings](https://console.cloud.google.com/iam-admin/settings)
2. Confirm that the project name is the name of the project you want to delete.  
   If it isn't, choose the project you want to delete from the**Project selector**.
3. Click **Shut down**.
4. In the dialog, type the project ID, then click **Shut down** to delete the project.

## What's next

- Learn more about [Web Risk](https://cloud.google.com/web-risk/docs/overview).
- Learn more about the Web Risk app on the [Web Risk GitHub project](https://github.com/google/webrisk).

Send feedback
