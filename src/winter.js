
Inject = function(spec) {
    if(typeof spec.name != 'string') {
        throw 'invalid invocation';
    };
    var ctor = this, providers = Inject.providers;
    if(typeof spec.exports != 'undefined') {
        Inject.registerDependencyProvider(spec);
    }
    //spec.def.scope[spec.def.namedRef] = 
    Inject.defineNamespacedFunction(spec.name, Inject.createProxyConstructor(ctor, spec));
}

Inject.providers={};

Inject.lookupDependencyProvider = function(dependencyName) {
    return Inject.providers[dependencyName]
}

Inject.registerDependencyProvider = function(spec) {
    for(var i=0, len=spec.exports.length, item; item=spec.exports[i], i<len; i++) {
        if(typeof item == 'string' && item.length>0) {
            Inject.providers[item] = spec;
        }
    }
}

Inject.createProxyConstructor = function(ctor, spec) {
    return function() {
        //var targetObj = Inject.createObjectFromRealConstructor(ctor, spec)
        var arr = Array.prototype.slice.call(arguments, 0), numMissingArgs = arr.length - ctor.length;
        var args = Inject.getConstructorArgDependencies(spec.autowire.constructorArgs);
        while(numMissingArgs > 0) {
            arr.push(args[args.length-numMissingArgs]);
            --numMissingArgs;
        }
        var targetObj = {};
        targetObj = ctor.apply(targetObj, arr);
        Inject.injectPropertyDependencies(targetObj, spec.autowire.properties);
        Inject.injectMethodDependencies(targetObj, spec.autowire.methods);
        return targetObj;
    };
}

Inject.createObjectFromRealConstructor = function(ctor, spec) {
    var arr = Array.prototype.slice.call(arguments, 0), numMissingArgs = arr.length - ctor.length;
    var args = Inject.getConstructorArgDependencies(spec.autowire.constructorArgs);
    while(numMissingArgs > 0) {
        arr.push(args[args.length-numMissingArgs]);
        --numMissingArgs;
    }
    var targetObj = {};
    ctor.apply(targetObj, arr);
    return targetObj;
}

Inject.createProxyMethodForInjectingDependencies = function(targetObj, methodName, dependencies) {
    var targetMethod = targetObj[methodName];
    targetObj[methodName] = function() {
        for(var i=0, dependencyInstances=[], len=dependencies.length; i<len; i++) {
            dependencyInstances.push(Inject.getDependencyInstance(dependencies[i]));
        }
        var arr = Array.prototype.slice.call(arguments, 0);
        targetMethod.apply(this,arr.concat(dependencyInstances));
    };
}

Inject.injectMethodDependencies = function(targetObj, dependencySpec) {
    for(var methodName in dependencySpec) {
        if(!dependencySpec.hasOwnProperty(methodName)) {
            continue;
        }
        var dependencies = dependencySpec[methodName];
        Inject.createProxyMethodForInjectingDependencies(targetObj, methodName, dependencies)
    }
}

Inject.injectPropertyDependencies = function(targetObj, dependencies) {
    if(typeof targetObj !='object' || targetObj===null || typeof dependencies !='object' || dependencies===null) return;
    for(var i=0, len=dependencies.length; i<len; i++) {
        Inject.injectPropertyDependency(targetObj, dependencies[i].name, dependencies[i].ref);
    }
}

Inject.injectPropertyDependency = function(targetObj, propertyName, dependencyName) {
    if(typeof Inject.providers[dependencyName] != 'undefined') {
        targetObj[propertyName] = Inject.getDependencyInstance(Inject.providers[dependencyName]);
    }
}

Inject.singletons={};

Inject.DEPENDENCY_TYPES = {
    VALUE: -1
    ,PROTO: 0
    ,SINGLETON: 1
    ,FACTORY: 2
}

Inject.getDependencyInstance = function(dependencyDef) {
    var dependencyInstance = null;
    //var def = dependencyDef.def;
    if(dependencyDef.type===Inject.DEPENDENCY_TYPES.VALUE) {
        return dependencyDef.value;
    }
    /*if(typeof def.scope != 'object' || def.scope==null || typeof def.namedRef != 'string' || def.namedRef.length < 1 || typeof def.scope[def.namedRef] != 'function') {
        return dependencyInstance;
    }*/
    switch(dependencyDef.type) {
        case Inject.DEPENDENCY_TYPES.FACTORY: 
            dependencyInstance = Inject.getDependencyInstanceFromFactory(dependencyDef);
            break;
        case Inject.DEPENDENCY_TYPES.SINGLETON: 
            dependencyInstance = Inject.getSingletonInstance(dependencyDef);
            break;
        case Inject.DEPENDENCY_TYPES.PROTO:
            dependencyInstance = Inject.DIconstruct(dependencyDef);
    }
    return dependencyInstance;
}

Inject.getDependencyInstanceFromFactory = function(dependencyDef) {
    if(typeof def.factory == 'object' && def.factory != null 
        && typeof def.factory.obj == 'object' && def.factory.obj != null 
        && typeof def.factory.methodName == 'string' && def.factory.methodName.length > 0) {
        //return Inject.DIconstruct(dependencyDef);
        var args=[], ctorArgs = dependencyDef.autowire.constructorArgs;
        var args = Inject.getConstructorArgDependencies(dependencyDef.autowire.constructorArgs);
        /*if(typeof ctorArgs=='object' && ctorArgs.length>0) {
            for(var i=0, len=ctorArgs.length; i<len; i++) {
                args.push(Inject.getDependencyInstance(ctorArgs[i].ref));
            }
        }*/
        return def.factory.obj[def.factory.methodName].apply(def.factory.obj, args);
    }
    return null;
}

Inject.getConstructorArgDependencies = function(ctorArgs) {
    var args=[];
    if(typeof ctorArgs=='object' && ctorArgs.length>0) {
        for(var i=0, len=ctorArgs.length; i<len; i++) {
            args.push(Inject.getDependencyInstance(ctorArgs[i].ref));
        }
    }
    return args;
}

Inject.getSingletonInstance = function(dependencyDef) {
    var provides = dependencyDef.exports;
    if(typeof Inject.singletons[provides[0]] == 'object') {
        return Inject.singletons[provides[0]];
    }
    var dependencyInstance = Inject.DIconstruct(dependencyDef);
    for(var i=0, len=provides.length; i<len; i++) {
        Inject.singletons[provides[i]] = dependencyInstance;
    }
}

Inject.DIconstruct = function(dependencyDef) {
    var arr = Inject.getNamespacedFunction(dependencyDef.name), scope=arr[0], func=arr[1];
    return scope[func].call({});
}

Inject.defineNamespacedFunction = function(dotSeparatedNamespaceString, func) {
    var arr = dotSeparatedNamespaceString.split(".");
    if(arr.length<1) return;
    var ref = arr.pop();
    var parent = window;
    for(var i=0, len=arr.length; i<len; i++) {
        if(!parent[arr[i]]) parent[arr[i]] = {};
        parent = arr[i];
    }
    parent[ref] = func;
}

Inject.getNamespacedFunction = function(dotSeparatedNamespaceString) {
    var arr = dotSeparatedNamespaceString.split(".");
    if(arr.length<1) throw 'invalid invocation';
    var func = arr.pop();
    var parent = window;
    for(var i=0, len=arr.length; i<len; i++) {
        if(!parent[arr[i]]) throw 'invalid invocation';
        parent = arr[i];
    }
    return [parent, func];
}

Object.prototype.Inject = Inject;

//Inject=undefined;
