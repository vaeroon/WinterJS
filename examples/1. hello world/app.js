
!function() {
    return {                    //this is my target object where we demo DI
        greet: function() {
            alert(this.message);
        }
    };
}.Inject({
    name: "someFunc"
    ,autowire: {
        properties: [{
            message: "hello.message"   //Hey! I would like to get some "hello.message" stuff injected as message.
        }]
    }
});
!function() {}.Inject({          //The order in which ctors register does NOT matter :)
    type: Inject.DEPENDENCY_TYPES.VALUE
    ,exports: ["hello.message"]
    ,value: "Hello, World!"
});

