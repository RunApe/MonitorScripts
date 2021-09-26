/*  Run ComApi in NodeJS context (Puppeteer is not used here)
Demonstrating:
  - Requiring modules from your folders
  - Using FStore module for encrypted token storage
  - ComApi.GetToken and ComApi.SendGet with callbacks
*/

(async () => {
  function print(message) { console.log(message); }

  try {
    var ComApi = require("/Scripts/node_modules/runape-com");
    var FStore = require("/Scripts/node_modules/runape-fstore");
    
    FStore.initCrypto("some_password_used_for_crypto");
    
    function getTokenSuccess(tokenObj) {
      print("ComApi.getToken success.");

      function onGetSuccess(selections) {
        print("Monitor selection count: " + selections.length);
        test.done();
      }

      function onGetError(xhr) {
        print("GetSelections failed. Error: " + JSON.stringify(xhr));
        test.done();
      }

      ComApi.sendGet("Webscape/GetSelections/" +  test.monitor.id, onGetSuccess, onGetError);
    }

    function getTokenError(xhr) {
      var msg = xhr.status === 401 ? ": Enter correct WebAPI Key (see Webscape settings)." : "";
      print("ComApi.getToken failed. " + xhr.statusText + msg);
      test.done();
    }

    function initGetToken() {
      var getTokenArgs = {
        credentials: { a: "Your WebAPI Key (see Webscape settings)" },
        onSetStorage: FStore.set,
        onGetStorage: FStore.get,
        onRenewExpired: initGetToken,
        isRenewForced: false,
      };

      ComApi.getToken(getTokenArgs, getTokenSuccess, getTokenError);
    }

    initGetToken();
    test.successes.push("OK");
  } catch (e) {
    print("Error in page: " + e);
    throw e;
  }
})();