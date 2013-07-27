
!function() {
    return {                    //this is my target object where we demo DI
        greet: function() {
            alert(this.message);      //notice that this object does NOT have o1.foo()
        }
    };
}.Inject({
    name: "someFunc"
    ,type: Inject.DEPENDENCY_TYPES.PROTO
    ,autowire: {
        properties: [{
            ref: "hello.message"
            ,name: "message"      //Hey! I would like to get some "foo.provider" stuff injected as o1.
        }]
    }
});
!function() {
    //return "Hello, World!";
}.Inject({          //The order in which ctors register does NOT matter :)
    name: "getHello"
    ,type: Inject.DEPENDENCY_TYPES.VALUE
    ,exports: ["hello.message"]
    ,value: "Hello, World!"
});

