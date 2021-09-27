/* The script takes the MonitorID from the triggering monitor. It then fetches the SelectionID and the file paths that are used for sending the photo and the document. */
(async () => {
    try {
        // replace the value below with the Telegram token you receive from @BotFather
        const botToken = '2031091626:AAE5LjtUvzIMaBudC1iIcUZ1742xtTvDIYk';
        // replace the value below with the ChatID of your channel
        var chatId = "-1001557657624";

        var fs = require('fs');
        var TelegramBot = require('/Scripts/node_modules/telegrambot');
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
            sendGet("Webscape/GetSelections/" + mid).then(function (selections){
                print("Success GetSelections: " + JSON.stringify(selections));
                var sid = selections[0].ID;
                var contentRequest = { "QueryPath": { MonitorID: mid, SelectionID: sid }, QueryType: "Last" };

                var sendPost = ComApi.promisify(ComApi.sendPost);
                sendPost(contentRequest, "Webscape/GetContent/").then(function(){
                    print("Success GetContent: " + JSON.stringify(resp));

                    var api = new TelegramBot(botToken);
    
                    function handleTelegramResponse(err, message) {
                        if (err) throw err;
                        console.log(message);
                        test.successes.push("OK");
                        test.done();
                    }
    
                    /* Send message */
                    var mName = test.monitor.trigger.sources[0].name;
                    api.sendMessage({ chat_id: chatId, text: 'Changes detected by monitor ' + mName }, handleTelegramResponse);
                    

                    /* Send last changes as image */
                    var imageUrl = resp.Content.FilesPath +  resp.Content.FileNames.ImageLarge;
                    //imageUrl = 'https://runape.com/List/s4YTAQU8IPFZPA/Monitors/cjseval/ingenious/2021/9/26/19.28.37/Large_FxEP6DxkUQXyCA.jpg?k=732791023'
                    api.sendPhoto({ chat_id: chatId, photo: imageUrl }, handleTelegramResponse);
    
    
                    /* Send last changes as HTML document */
                    var docFilePath = resp.Content.FilesPath +  resp.Content.FileNames.HtmlChange;
                    var start = docFilePath.indexOf("/Monitors");
                    var end   = docFilePath.indexOf("?k=");
                    docFilePath = docFilePath.substr(start, end-start);
                    //docFilePath = '/Monitors/2-runape-com---empty/charming/2021/9/27/12.53.05/Change_chq1cP8iiLwSzA.html';
                    api.sendDocument({ chat_id: chatId, document: fs.createReadStream(docFilePath) }, handleTelegramResponse);
                    
                }).catch(onGetError);
            }).catch(onGetError);
        }

        FStore.initCrypto("password");

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
    } catch (e) {
        console.log(e);
        throw e;
    }
})();