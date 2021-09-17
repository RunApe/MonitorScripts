**Monitor scripts**
==================================================

RunApe users are allowed to execute custom [CasperJS](http://casperjs.org/) or [NodeJS/Puppeteer](https://pptr.dev/) scripts that can perform any operations whether they affect the monitor's webpage used for change detection or not.

The CasperJS and Puppeteer frameworks provide a variety of tools used for testing webpages. They help to navigate around webpages, click elements, and so on. RunApe enables you to build your own tools and libraries that can be reused via your [private files](https://runape.com/Support/Help?page=files) :blue_book: by all of your monitors. The scripts and the files you store on RunApe must follow RunApe's [Terms and conditions](https://runape.com/Terms).

Scripts can be either written from scratch in a monitor's code editor or they can be generated using the [Scriber browser extension](https://runape.com/Support/Help?page=scriber_browser_extension) :blue_book: that records your browser actions into a replayable script.

![Monitor script](https://github.com/RunApe/MediaFiles/raw/master/Git/monitor_script_screen.png) 


See [Monitor script](https://runape.com/Support/Help?page=monitor_script) :blue_book: for more information.


## Scripting basics

### Script input data

The `test.monitor` is an input to the script that holds basic context properties of the running monitor. The other monitor properties need to be retrieved via the [RunApe API](https://runape.com/Support/Help?page=api). 

```javascript
{
  id: "mid",
  name: "Vacations",
  url: "https://vacations.com/index.html",
  display: { "useragent": "BrowserUA", "language": "en-US", "width": 2744, "height": 1378 },
  selections: [{"id": "sid","name": "Terrific"}],
  trigger: {
    type: "Monitors",
    message: "Run triggered by 'Monitor1', 'Monitor2' after they finished running without errors.",
    sources: [{"id":"mid1", "name":"Monitor1"},
              {"id":"mid2", "name":"Monitor2"}]
  }
}
```

The `trigger.type` can be `Manual`, `Schedule` or `Monitors`.<br>
The `trigger.sources` is a list of monitor IDs and names when `trigger.type` is `Monitors`. The `trigger.sources` is `null` for types `Manual` and `Schedule`.

### Script execution

The examples below show valid scripts that were recorded with the [Scriber browser extension](https://runape.com/Support/Help?page=scriber_browser_extension) :blue_book: for CasperJS and Puppeteer. The [runape.com/empty](https://runape.com/empty.html) webpage was loaded and one mouse click was recorded. Assertions and logs (console output) are saved to `/Monitors/monitorName/_logs/yyyymmdd_hhmmss.log` files for each script execution.

#### CasperJS

```javascript
test.isTestPassed = function () { return true; };	//Override to always pass
casper.options.viewportSize = {width: 600, height: 800};	//Set the view port
casper.page.customHeaders = { 'Accept-Language': 'en-US' };	//Set custom headers
casper.start('https://runape.com/empty.html/');			//Open the webpage.
casper.then(function () {
    //A dictionary of element's redundant CSS Selectors. See Note below.
    casper.selectors["##xren"] = ["body","#body > div","BODY > DIV"];
    casper.waitForSelector("##sxren",		//Wait for the element to appear by trying all CSS selectors.
      function success() {			//Enter success function if element exists.
          test.assertExists("##xren");		//Assert the element, log to xx.log, increase test.successes.
          this.click("##xren");			//Click the element.
          console.log("Clicked"); 		//Log that the element was clicked to xx.log.
      },
      function fail() {				//Enter fail function if element does not exist.
          test.assertExists("##sxren"); 	//Assert the element, log to xx.log, increase test.failures.
    });
});
casper.run(function() { test.done(); });	//Execute the defined test and finish it when done.
```
***Note:** The `casper.selectors` is RunApe's extension similar to Selection's [CSS Selectors](https://runape.com/Support/Help?page=css_selectors). It's a dictionary that holds redundant CSS Selectors of a webpage element. The redundant selectors increase the chance of finding the element on a webpage in case the element position (i.a.) changes. The dictionary key can be any string but must start with `##`. To use only one CSS selector, remove `casper.selectors["##xren"]` and exchange `##xren` for `body` everywhere in the example.*

####  Puppeteer

```javascript
(async () => {						//Enclose in async if there is await
  test.isTestPassed = function () { return true; };	//Override to always pass
  const page = await getPage();				//Open browser and get a page (getPage always returns the same page)
  const navigationPromise = page.waitForNavigation();	//Set a shorthand for waiting until page has loaded
  await page.setViewport({ width:1350, height:2122 }); //Set the view port
  await page.goto('https://runape.com/empty.html/');	//Open the webpage
  await navigationPromise;				//Wait for the page to load
  await page.waitForSelector('body'); //body; #body > div; HTML > BODY > DIV. //Wait for the element to appear. See Note below.
  await page.click('body');				//Click the element
  test.successes.push("The success message");		//Add a success message and increase count of successfull assertions
  //test.failures.push("The fail message");		//Add a fail message and increase count of failed assertions
  test.done();						//Finish the test.
})();
```

***Note:** Three redundant CSS selectors to an element are appended as comments by Scriber. Puppeteer has not yet been extended to support redundant selectors like CasperJS does (see CasperJS script example above).*

### Test PASS Condition

The `test.isTestPassed` function allows you to optionally decide how many test assertions need to succeed or fail so that the monitor either stops with an error `900 - Test failed` or continues its normal execution. The arrays `test.successes, test.failures` hold the assertion information.

```javascript
/* The default implementation that you can override */
test.isTestPassed = function () { 
    return test.successes.length > 0 && test.failures.length == 0; 
}
```

### Results

 Any eventual exception or code error that your monitor script produce stop the monitor with an error `901 - Monitor script error`.

#### Successful script execution always:

1. Logs the test output to `/Monitors/MonitorName/_logs/yyyymmdd_hhmmss.log` file.
2. If the Monitor Script property [Compare Page](https://runape.com/Support/Help?page=monitor_script#compare_page) :blue_book: is enabled, continues the version comparison of a webpage that the script loaded last and potentially modified with the previous content version.
3. Stores a new content version and sends an [Alert Email](https://runape.com/Support/Help?page=alert_emails) if any selection filters were applied.


#### Failed script execution always:

1. Logs the test output and error to `/Monitors/MonitorName/_logs/yyyymmdd_hhmmss.log` file.
2. Sets the monitor error code to 900 or 901 or any other monitor internal error. See [Error examples](https://runape.com/Support/Help?page=error_examples) for more information.
3. Reschedules the monitor according to the [Error correction schema](https://runape.com/Support/Help?page=error_correction_schema).
4. Sends the error alert email. You can exclude Alert Emails for certain error codes in [Site Settings](https://runape.com/Support/Help?page=site_settings)

## Tricks, Tips and Links

* You need to add `test.done()` to all places in the code where your test is finished, whether it be at the end of asynchronous callbacks or at the end of synchronous code. Omitting the `test.done()` halts the test until it times out.

* Your code should always be enclosed in a `try-catch` clause so you can handle the error case and output a proper message with console.log. To fail the test either push to the `test.failures` array or rethrow the exception. 
  ```javascript
  try{ ... }
  catch (e) {
    myErrorHandling(e);
    console.log("Error occured: " + e);
    throw e;
  }
  ```

* If the [Compare Page](https://runape.com/Support/Help?page=monitor_script#compare_page) :blue_book: property is enabled in a monitor script then you need to ensure that the last HTML before your script finishes has the elements expected by the monitor selection's [CSS Selectors](https://runape.com/Support/Help?page=css_selectors) :blue_book:. If the page comparison that runs after the monitor script does not find the expected element it will stop the monitor with error *913 - All selections are in error* due to selection's *904 - Selection not found error*.

* The `casper.evaluate` does not stop if an exception was thrown but will just continue. You need to have a `try catch` and check the result. Puppeteer stops with an evaluate exception.

  ```javascript
  var result = casper.evaluate(function(username, password) {
    var evalResult;
    try{
        document.querySelector('#username').value = username;
        document.querySelector('#password').value = password;
        document.querySelector('#submit').click();
        evalResult = "OK";
    }
    catch(e){
        evalResult = e.message;
    }

    return evalResult;
  }, 'Bazoonga', 'baz00nga');

  if(result != "OK"){
      console.log("Cannot log in. Error occured: " + result);
      test.failures.push(result);
  }
  ```

* In CasperJS you can [attach a page event listener](https://casperjs.readthedocs.io/en/1.1-beta2/events-filters.html#page-error) to track errors inside of a page. Puppeteer does this with [custom events](https://stackoverflow.com/questions/47107465/puppeteer-how-to-listen-to-object-events) that attach to window's `onerror`. 

  ```javascript
  casper.on("page.error", function (message, trace) {
    console.log("Page error: " + message);
    for (var i = 0; i < trace.length; i++) {
      console.log("   " + trace[i].file + " (line " + trace[i].line + ")");
    }
  });
  ```