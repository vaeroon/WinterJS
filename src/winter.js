
DIfunction = function(spec) {
    if(typeof spec.def != 'object' || typeof spec.def.scope != 'object' || typeof spec.def.namedRef != 'string') {
        throw 'invalid invocation';
    };
    var ctor = this, providers = DIfunction.providers;
    if(typeof spec.exports != 'undefined') {
        DIfunction.registerDependencyProvider(spec);
    }
    spec.def.scope[spec.def.namedRef] = DIfunction.createProxyConstructor(ctor, spec);
}

DIfunction.providers={};

DIfunction.lookupDependencyProvider = function(dependencyName) {
    return DIfunction.providers[dependencyName]
}

DIfunction.registerDependencyProvider = function(spec) {
    for(var i=0, len=spec.exports.length, item; item=spec.exports[i], i<len; i++) {
        if(typeof item == 'string' && item.length>0) {
            DIfunction.providers[item] = spec;
        }
    }
}

DIfunction.createProxyConstructor = function(ctor, spec) {
    return function() {
        var arr = Array.prototype.slice.call(arguments, 0), numMissingArgs = arr.length - ctor.length;
        var args = DIfunction.getConstructorArgDependencies(spec.constructorArgs);
        while(numMissingArgs > 0) {
            arr.push(args[args.length-numMissingArgs]);
            --numMissingArgs;
        }
        var targetObj = {};
        ctor.apply(targetObj, arr);
        DIfunction.injectPropertyDependencies(targetObj, spec.propertyDependencies);
        DIfunction.injectMethodDependencies(targetObj, spec.methodDependencies);
        return targetObj;
    };
}

DIfunction.createProxyMethodForInjectingDependencies = function(targetObj, methodName, dependencies) {
    var targetMethod = targetObj[methodName];
    targetObj[methodName] = function() {
        for(var i=0, dependencyInstances=[], len=dependencies.length; i<len; i++) {
            dependencyInstances.push(DIfunction.getDependencyInstance(dependencies[i]));
        }
        var arr = Array.prototype.slice.call(arguments, 0);
        targetMethod.apply(this,arr.concat(dependencyInstances));
    };
}

DIfunction.injectMethodDependencies = function(targetObj, dependencySpec) {
    for(var methodName in dependencySpec) {
        if(!dependencySpec.hasOwnProperty(methodName)) {
            continue;
        }
        var dependencies = dependencySpec[methodName];
        DIfunction.createProxyMethodForInjectingDependencies(targetObj, methodName, dependencies)
    }
}

DIfunction.injectPropertyDependencies = function(targetObj, dependencies) {
    if(typeof targetObj !='object' || targetObj===null || typeof dependencies !='object' || dependencies===null) return;
    for(var i=0, len=dependencies.length; i<len; i++) {
        DIfunction.injectPropertyDependency(targetObj, dependencies[i].name, dependencies[i].ref);
    }
}

DIfunction.injectPropertyDependency = function(targetObj, propertyName, dependencyName) {
    if(typeof DIfunction.providers[dependencyName] != 'undefined') {
        targetObj[propertyName] = DIfunction.getDependencyInstance(DIfunction.providers[dependencyName]);
    }
}

DIfunction.singletons={};

DIfunction.DEPENDENCY_TYPES = {
    VALUE: -1
    ,PROTO: 0
    ,SINGLETON: 1
    ,FACTORY: 2
}

DIfunction.getDependencyInstance = function(dependencyDef) {
    var dependencyInstance = null;
    var def = dependencyDef.def;
    if(dependencyDef.DEPENDENCY_TYPE===DIfunction.DEPENDENCY_TYPES.VALUE) {
        return def;
    }
    if(typeof def.scope != 'object' || def.scope==null || typeof def.namedRef != 'string' || def.namedRef.length < 1 || typeof def.scope[def.namedRef] != 'function') {
        return dependencyInstance;
    }
    switch(dependencyDef.DEPENDENCY_TYPE) {
        case DIfunction.DEPENDENCY_TYPES.FACTORY: 
            dependencyInstance = DIfunction.getDependencyInstanceFromFactory(dependencyDef);
            break;
        case DIfunction.DEPENDENCY_TYPES.SINGLETON: 
            dependencyInstance = DIfunction.getSingletonInstance(dependencyDef);
            break;
        case DIfunction.DEPENDENCY_TYPES.PROTO:
            dependencyInstance = DIfunction.DIconstruct(dependencyDef);
    }
    return dependencyInstance;
    
}

DIfunction.getDependencyInstanceFromFactory = function(dependencyDef) {
    if(typeof def.factory == 'object' && def.factory != null 
        && typeof def.factory.obj == 'object' && def.factory.obj != null 
        && typeof def.factory.methodName == 'string' && def.factory.methodName.length > 0) {
        //return DIfunction.DIconstruct(dependencyDef);
        var args=[], ctorArgs = dependencyDef.constructorArgs;
        var args = DIfunction.getConstructorArgDependencies(dependencyDef.constructorArgs);
        /*if(typeof ctorArgs=='object' && ctorArgs.length>0) {
            for(var i=0, len=ctorArgs.length; i<len; i++) {
                args.push(DIfunction.getDependencyInstance(ctorArgs[i].ref));
            }
        }*/
        return def.factory.obj[def.factory.methodName].apply(def.factory.obj, args);
    }
    return null;
}

DIfunction.getConstructorArgDependencies = function(ctorArgs) {
    var args=[];
    if(typeof ctorArgs=='object' && ctorArgs.length>0) {
        for(var i=0, len=ctorArgs.length; i<len; i++) {
            args.push(DIfunction.getDependencyInstance(ctorArgs[i].ref));
        }
    }
    return args;
}

DIfunction.getSingletonInstance = function(dependencyDef) {
    var provides = dependencyDef.exports;
    if(typeof DIfunction.singletons[provides[0]] == 'object') {
        return DIfunction.singletons[provides[0]];
    }
    var dependencyInstance = DIfunction.DIconstruct(dependencyDef);
    for(var i=0, len=provides.length; i<len; i++) {
        DIfunction.singletons[provides[i]] = dependencyInstance;
    }
}

DIfunction.DIconstruct = function(dependencyDef) {
    return new dependencyDef.def.scope[dependencyDef.def.namedRef]();
}

Object.prototype.DIfunction = DIfunction;

