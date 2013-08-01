var page = require('webpage').create();
var url = 'spec/SpecRunner.html';
page.open(url, function (status) {
    console.log("Page loaded = ",status);
    phantom.exit();
});

