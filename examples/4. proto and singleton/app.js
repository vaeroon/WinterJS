
!function() {
    return {
        greet: function() {
            alert(this.messageHub.getMessage());
        }
    };
}.Inject({
    name: "MyNamespace.SomeComponent"
    ,type: Inject.DEPENDENCY_TYPES.PROTO
    ,autowire: {
        properties: [{
            messageHub: "hello.message"   //Hey! I would like to get some "hello.message" stuff injected as message.
        }]
    }
});


!function() {
    this.getMessage = function(){
        return this.i18n.get("hi");
    };
}.Inject({
    name: "MyNamespace.MessageHub"
    ,type: Inject.DEPENDENCY_TYPES.PROTO
    ,exports: ["hello.message"]
    ,value: "Hello, World!"
    ,autowire: {
        properties: [{
            i18n: "i18n"
        }]
    }
});


!function() {
    return {
        get: function(s) {
            return "..:"+s+":..";
        }
    };
}.Inject({
    name: "MyNamespace.Service.Internationalization"
    ,type: Inject.DEPENDENCY_TYPES.SINGLETON
    ,exports: ["i18n"]
    ,value: "Hello, World!"
});

