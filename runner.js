var tests = require('./test-config');
var phantomcss = require('phantomcss');
var util = require('util');

phantomcss.init({
	screenshotRoot: './screenshots',
	failedComparisonsRoot: './failures',
	mismatchTolerance: 0.1,
	libraryRoot: './node_modules/phantomcss'
});

function log() {
	var args = arguments;
	return function log() {
		console.log(util.format.apply(util, args));
	};
}

casper.start().each(tests, function testScenario(casper, test) {
	this.then(function setViewport() {
		this.viewport.apply(this, test.viewport);
	});
	this.then(log('Opening %s on viewport %j', test.url, test.viewport));
	this.thenOpen(test.url, function checkStatusAndWait(res) {
		if (res.status !== 200) {
			this.die('Expected 200 status code, got ' + res.status);
		}
		this.wait(5000);
	});
	this.then(log('Capturing screenshot'));
	this.then(function captureScreenshot(){
		phantomcss.screenshot(test.selector, test.name);
	});
});

casper.then(function diffScreenshots() {
	phantomcss.compareAll();
});

casper.then(function () {
	// This has to be a separate 'then' because compareAll calls 'then' and it
	// needs to happen before this
	this.test.done();
});

casper.run();