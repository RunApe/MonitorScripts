/*  Run ComApi in CasperJS webpage context
Demonstrating:
    - Passing arguments (monitorId) from CasperJS to webpage context
    - Injecting scripts to webpage with casper.page.injectScript or this.page.includeJs
    - CasperJS waitFor loop until a condition is met.
*/

test.isTestPassed = function () {
  return true;
};

casper.start("https://runape.com/empty.html").then(function () {
    this.page.injectScript("./Scripts/node_modules/runape-com/comapi.js"); //via fs from your folder
    //this.page.includeJs("https://runape.com/scripts/releasebin/comapi.js"); //via URL

    function isComApiLoaded() {
      return this.page.evaluate(function () {
        return typeof ComApi == "object";
      });
    }

    function getMonitorSelections() {
      console.log("ComApi loaded. Now GetSelections.");

      var evalError = this.page.evaluate(function (monitorId) {
        function print(message) {
          console.log(message);
          document.getElementById("result").innerHTML += "<br>" + message;
        }

        try {
          var sKey = "Token"; //localStorage key can be anything.
          //delete localStorage[sKey]; //Don't have to delete previous token. If a token is expired, it will be automatically renewed.

          function getMyToken() {
            if (!localStorage[sKey]) localStorage[sKey] = "{}";

            return JSON.parse(localStorage[sKey]);
          }

          function setMyToken(tokenObj) {
            localStorage[sKey] = JSON.stringify(tokenObj);
          }

          function getTokenSuccess(tokenObj) {
            print("ComApi.getToken success.");

            function onGetSuccess(selections) {
              print("Monitor selection count: " + selections.length);
            }

            function onGetError(xhr) {
              print("GetSelections failed. Error: " + JSON.stringify(xhr));
            }

            ComApi.sendGet(
              "Webscape/GetSelections/" + monitorId,
              onGetSuccess,
              onGetError
            );
          }

          function getTokenError(xhr) {
            var msg = xhr.status === 401 ? ": Enter correct WebAPI Key (see Webscape settings)." : "";
            print("ComApi.getToken failed. " + xhr.statusText + msg);
          }

          function initGetToken() {
            var getTokenArgs = {
              credentials: { a: "Your WebAPI Key (see Webscape settings)" },
              onGetStorage: getMyToken,
              onSetStorage: setMyToken,
              onRenewExpired: initGetToken,
              isRenewForced: false
            };

            ComApi.getToken(getTokenArgs, getTokenSuccess, getTokenError);
          }

          initGetToken();
        } catch (error) {
          print("Error in page: " + error);
          return error.toString();
        }
      }, this.test.monitor.id);

      if (!!evalError) {
        console.log("Error in page: " + evalError);
      }
    }

    casper.waitFor(isComApiLoaded, getMonitorSelections, function () {
        console.log("ComApi not loaded in 3sec.");
    }, 3000);

    //Wait until GetSelections is done and the selections count is written to html#result.
    function isSelectionLoaded() {
      return this.page.evaluate(function () {
        var result = document.getElementById("result").innerHTML;
        return result.indexOf("Monitor selection count: ") !== -1;
      });
    }

    casper.waitFor(isSelectionLoaded, 
      function () {
        console.log("Test Success");
      }, function () {
        console.log("Test Fail - Timeout");
    }, 5000);
}).run(function () {
    test.done();
});
