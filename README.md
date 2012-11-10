```javascript
 
prototypeDependencyDef = {
    DEPENDENCY_TYPE: DIfunction.DEPENDENCY_TYPES.PROTO
    ,def: {
        scope: ABC
        ,namedRef: "f"
    }
    ,constructorArgs: [
        {
            ref: "dep1"
        }
        ,{
            ref: "dep2"
        }
    ]
    ,exports: ["depx", "depy"]
    ,propertyDependencies: [
        {
            ref: "depfoo"
            ,name: "foo"
        }
    ]
    ,methodDependencies: {
        getAbc: ["depabc"]
    }
};

singletonDependencyDef = {
    DEPENDENCY_TYPE: DIfunction.DEPENDENCY_TYPES.SINGLETON
    ,def: {
        scope: ABC
        ,namedRef: "f"
        ,singleton: true (default false; singletons should be discouraged)
    }
    ,constructorArgs: [
        {
            ref: "dep1"
        }
        ,{
            ref: "dep2"
        }
    ]
    ,exports: ["depx", "depy"]
    ,propertyDependencies: [
        {
            ref: "depfoo"
            ,name: "foo"
        }
    ]
    ,methodDependencies: {
        getAbc: ["depabc"]
    }
};

factoryDependencyDef = {
    DEPENDENCY_TYPE: DIfunction.DEPENDENCY_TYPES.FACTORY
    ,def: {
        scope: ABC
        ,namedRef: "f"
        ,factory: {
            obj: FactoryReference
            ,methodName: "factoryMethodName"
        }
    }
    ,constructorArgs: [
        {
            ref: "dep1"
        }
        ,{
            ref: "dep2"
        }
    ]
    ,exports: ["depx", "depy"]
    ,propertyDependencies: [
        {
            ref: "depfoo"
            ,name: "foo"
        }
    ]
    ,methodDependencies: {
        getAbc: ["depabc"]
    }
};

valueDependencyDef = {
    DEPENDENCY_TYPE: DIfunction.DEPENDENCY_TYPES.VALUE
    ,def: "this can be anything like string/number/object/array/function"
}

```
