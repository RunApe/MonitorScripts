/* The script takes the MonitorID from the triggering monitor. It then fetches the SelectionID and the file paths that are used for sending the changes as Image or HTML URL. */
try {
    var ComApi = require("/Scripts/node_modules/runape-com");
    var FStore = require("/Scripts/node_modules/runape-fstore");

    function print(message) { console.log(message); }

    function getTokenSuccess(tokenObj) {
        print("ComApi.getToken success. " + tokenObj);

        function onGetError(xhr) {
            print("Error: " + JSON.stringify(xhr));
            test.done();
        }

        var mid = test.monitor.trigger.sources[0].id; //See https://github.com/RunApe/MonitorScripts

        var sendGet = ComApi.promisify(ComApi.sendGet);
        sendGet("Webscape/GetSelections/" + mid).then(function (selections) {
            print("Success GetSelections: " + JSON.stringify(selections));
            var sid = selections[0].ID;
            var contentRequest = { "QueryPath": { MonitorID: mid, SelectionID: sid }, QueryType: "Last" };

            var sendPost = ComApi.promisify(ComApi.sendPost);
            sendPost(contentRequest, "Webscape/GetContent/").then(function (resp) {
                print("Success GetContent: " + JSON.stringify(resp));
                (async () => {
                    const page = await getPage();
                    await page.setRequestInterception(true);

                    var docUrl = resp.Content.FilesPath + resp.Content.FileNames.ImageLarge; //or FileNames.HtmlChange

                    page.once("request", interceptedRequest => {
                        var data = {
                            "urls": "tgram://2031091626:AAE5LjtUvzIMaBudC1iIcUZ1742xtTvDIYk/-1001557657624/",
                            "title": "Change occurred in " + test.monitor.trigger.sources[0].name,
                            "body": docUrl
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

                })();
            }).catch(onGetError);
        }).catch(onGetError);
    }

    FStore.initCrypto("password");

    function initGetToken() {
        var getTokenArgs = {
            credentials: { a: "RcpWLWOWZ1jrdw" },
            onSetStorage: FStore.set,
            onGetStorage: FStore.get,
            onRenewExpired: initGetToken,
            isRenewForced: false,
        };

        var getToken = ComApi.promisify(ComApi.getToken);
        getToken(getTokenArgs).then(getTokenSuccess).catch(function (xhr) {
            var msg = xhr.status === 401 ? ": Enter correct WebAPI Key (see Webscape settings)." : "";
            print("ComApi.getToken failed. " + xhr.statusText + msg);
            test.done();
        });
    }

    initGetToken();
} catch (e) {
    console.log(e);
    throw e;
}