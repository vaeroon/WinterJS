
!function(a,b,c) {
    this.message = a+b+c;                    //this is my target object where we demo DI
    this.greet = function() {
            alert(this.message);      //notice that this object does NOT have o1.foo()
    }
}.Inject({
    name: "someFunc"
    ,type: Inject.DEPENDENCY_TYPES.PROTO
    ,autowire: {
        constructorArgs: [{
            ref: "hello.message"
            ,name: "c"      //Hey! I would like to get some "foo.provider" stuff injected as o1.
        }]
    }
});
!function(){}.Inject({          //The order in which ctors register does NOT matter :)
    type: Inject.DEPENDENCY_TYPES.VALUE
    ,exports: ["hello.message"]
    ,value: ", World!"
});

