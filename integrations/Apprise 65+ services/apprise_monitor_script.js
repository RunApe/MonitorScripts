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