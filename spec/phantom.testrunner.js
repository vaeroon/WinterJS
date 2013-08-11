var page = require('webpage').create();
var url = 'spec/SpecRunner.html';


page.open(url, function (status) {
    console.log("Page loaded = ",status);
    if(status!=='success') phantom.exit(1);
    
    var specs = page.evaluate(function(){
        var a = [];
        var specs = jasmine.getEnv().currentRunner_.suites_[0].children_;
        Array.prototype.slice.call(specs).forEach(function(item) {
            console.log(item.description);
            a.push(item.description);
            if(item.results_.failedCount>0) item.results_.items_.map(function(x){
                if(!x.passed_) {
                    a.push(a.pop() + "  !!FAIL!!" + "\n" + x.trace.getStack());  //x.trace.getStack())
                }
            });
        });
        return a.join("\n\n");
    });
    
    console.log(specs+"\n");
    
    var exitCode = specs.indexOf("!!FAIL!!") > -1 ? 1 : 0;
    
    phantom.exit(exitCode);
});

