
!function(a,b,c) {
    this.message = a+b+c;
    this.greet = function() {
            alert(this.message);
    }
}.Inject({
    name: "someFunc"
    ,type: Inject.DEPENDENCY_TYPES.PROTO
    ,autowire: {
        constructorArgs: [{
            ref: "hello.message"
            ,name: "c"
        }]
    }
});
!function(){}.Inject({
    type: Inject.DEPENDENCY_TYPES.VALUE
    ,exports: ["hello.message"]
    ,value: ", World!"
});

