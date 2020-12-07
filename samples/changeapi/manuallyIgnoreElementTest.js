casper.test.isTestPassed = function() {	return true; };

casper.start('START_URL_PLACEHOLDER').then(function(){
	this.capture("./lib/ManuallyIgnoreElementTest.png");

	var exception = this.evaluate(function() {
		try {
			var ignoreClock = document.getElementById("ID_OF_IGNORED_ELEMENT");
			ignoreClock.classList.add("mon_ignored");
		} catch (e) {
			return JSON.stringify(e);
		}

		return "";
	});

	casper.test.assert(!!exception, "Exception in evaluate: " + exception);

	//console.log("Hello"); //written to /logs/
}).run(function() {
	test.done();
});