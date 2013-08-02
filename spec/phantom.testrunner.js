var page = require('webpage').create();
var url = 'spec/SpecRunner.html';

function getResult() {
    console.log("hello "+window.name);
    var specs = jasmine.getEnv().currentRunner_.suites_[0].children_;
    specs.map(function(item) {
        console.log(item.description);
        if(item.failedCount>0) item.Items_.map(function(x){
            if(!x.passed_) {
                console.log(x.trace.getStack());
            }
        })
    });
    if(specs.failedCount>0) phantom.exit( +specs.failedCount );
}


page.onConsoleMessage = function(msg) {
    console.log('CONSOLE: ' + msg);
};


page.open(url, function (status) {
    console.log("Page loaded = ",status);
    if(status!=='success') phantom.exit(1);
    
    var specs = page.evaluate(function(){
        var a = [];
        var specs = jasmine.getEnv().currentRunner_.suites_[0].children_; alert(Array.prototype.slice.call(specs).toString())
        Array.prototype.slice.call(specs).forEach(function(item) {
            console.log(item, item.description, item.results_);
            a.push(item.description);
            if(item.results_.failedCount>0) item.results_.items_.map(function(x){
                if(!x.passed_) {
                    debugger;a.push(a.pop() + "  !!FAIL!!");  //x.trace.getStack())
                }
            })
        });
        return a.join("\n\n");
    });
    
    console.log(specs);
    
    console.log(specs.indexOf("!!FAIL!!"));
    
    var exitCode = specs.indexOf("!!FAIL!!") > -1 ? 1 : 0;
    
    phantom.exit(exitCode);
});

