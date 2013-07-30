
!function(a,b,c) {
    this.greet = function(a,b,c) {
            alert(a+b+c);
    }
}.Inject({
    name: "someFunc"
    ,type: Inject.DEPENDENCY_TYPES.PROTO
    ,autowire: {
        methods: {
            greet: ["hello.message"]
        }
    }
});
!function(){}.Inject({
    type: Inject.DEPENDENCY_TYPES.VALUE
    ,exports: ["hello.message"]
    ,value: ", World!"
});

