
## Apprise

In order to send messages to 65+ services via Apprise you need to create a new Integration Monitor with the Puppeteer script below `(apprise_monitor_script_simple.js)`. You also need to change the `urls` value in the script depending on which services you need. Detailed description of how the `urls` look like for different services is found on https://github.com/caronc/apprise/wiki.

In the Schedule Trigger of the Integration Monitor select the monitor whose changes you want to be notified about and set the trigger criteria to "Any monitor" & "Finished running without errors". Disable the Schedule.

![img](https://github.com/RunApe/MediaFiles/raw/master/Git/triggeringMonitor.jpg)


**Note:** The simple script will send: a message with title "Changes occurred" and the name of the Monitor in the message body.
**Note:** Use the `apprise_monitor_script_advanced.js` if you need to send the changes as Image or HTML URL in the message body.
**Note:** The Integration Monitor (with the script) needs be enabled in order to get triggered.

```javascript
(async () => {
    try {
        const page = await this.getPage();
        await page.setRequestInterception(true);

        page.once("request", interceptedRequest => {
            var data = {
                            "urls": "tgram://2031091626:AAE5LjtUvzIMaBudC1iIcUZ1742xtTvDIYk/-1001557657624/",
                            "title": "Change occurred",
                            "body": test.monitor.trigger.sources[0].name //See https://github.com/RunApe/MonitorScripts,
                        };

            interceptedRequest.continue({
                method: "POST",
                postData: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            });
        });

        const response = await page.goto("http://localhost:8000/notify/");

        console.log({
            url: response.url(),
            statusCode: response.status(),
            body: await response.text()
        });
        test.successes.push("OK");
        test.done();
    } catch (e) {
        console.log(e);
        throw e;
    }
})();
```