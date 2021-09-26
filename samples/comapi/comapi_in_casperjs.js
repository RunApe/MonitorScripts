/*  Run ComApi in CasperJS context
Demonstrating:
    - Requiring pre-installed modules
    - ComApi.GetToken and ComApi.SendGet with promises
*/

test.isTestPassed = function () {
  return true;
};

casper.then(function () {
  function print(message) {
    console.log(message);
  }

  try {
    Promise = require("q").Promise; //CasperJS doesn't have Promise and ComApi.promisify needs it
    var ComApi = require("runape-com");
    var FStore = require("runape-fstore");

	  FStore.initCrypto("some_password_used_for_crypto");
	
    function getTokenSuccess(tokenObj) {
      print("ComApi.getToken success.");
      var sendGet = ComApi.promisify(ComApi.sendGet);

      //Promisified sendGet doesn't need callbacks anymore
      sendGet("Webscape/GetSelections/" + test.monitor.id)
        .then(function (selections) {
          print("Monitor selection count: " + selections.length);
        }).catch(function (xhr) {
          print("GetSelections failed. Error: " + JSON.stringify(xhr));
        }).finally(function () {
          test.done();
        });
    }

    function getTokenError(xhr) {
      var msg = xhr.status === 401 ? ": Enter correct WebAPI Key (see Webscape settings)." : "";
      print("ComApi.getToken failed. " + xhr.statusText + msg);
      test.done();
    }

    var getToken = ComApi.promisify(ComApi.getToken);
    
    function getJWT(){ return JSON.parse(FStore.get()) }

    function initGetToken() {
      var getTokenArgs = {
        credentials: { a: "Your WebAPI Key (see Webscape settings)" },
        onSetStorage: FStore.set,
        onGetStorage: getJWT,
        onRenewExpired: initGetToken,
        isRenewForced: false,
      };

      //Promisified getToken doesn't need callbacks anymore
      getToken(getTokenArgs).then(getTokenSuccess).catch(getTokenError);
    }

    initGetToken();
  } catch (e) {
    console.log("Error " + e);
    throw e;
  }
}).run(function () {
  setTimeout(function () {
    console.log("Get monitor selections timeout.");
    test.done();
  }, 4000);
});
