var page = require('webpage').create();
//var url = 'THIS_IS_THE_URL_MARKER';
var url = 'http://localhost:7890/capture';
page.open(url, function (status) {
    //Page is loaded!
    console.log("frames=",window.frames.length);
    console.log("jstestdriver", window.frames[1].jstestdriver);
});

