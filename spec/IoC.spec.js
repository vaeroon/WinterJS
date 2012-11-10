describe("suite of DIfunction specs:- ", function() {
    
    beforeEach(function () {
       DIfunction.providers={}; 
    });
    
    it("proxies the constructor but does not register when there are no exports", function() {
        var f = function(){};
        spyOn(DIfunction, "registerDependencyProvider");
        spyOn(DIfunction, "createProxyConstructor");
        f.DIfunction({
            def : {
                scope: {}
                ,namedRef: 'f'
            }
        });
        expect(DIfunction.createProxyConstructor.callCount).toBe(1);
        expect(DIfunction.registerDependencyProvider).not.toHaveBeenCalled();
    });
    
    it("proxies and registers the constructor when there is atleast one export", function() {
        var f = function(){};
        spyOn(DIfunction, "registerDependencyProvider");
        spyOn(DIfunction, "createProxyConstructor");
        f.DIfunction({
            def : {
                scope: {}
                ,namedRef: 'f'
            }
            ,exports : ["blah"]
        });
        expect(DIfunction.createProxyConstructor.callCount).toBe(1);
        expect(DIfunction.registerDependencyProvider.callCount).toBe(1);
    });
    
    it("adds entries in the registry for all export entries", function() {
        var obj = {
            exports: ["abc", "def"]
        };
        DIfunction.registerDependencyProvider(obj);
        expect(DIfunction.providers.abc).toBe(obj);
        expect(DIfunction.providers.def).toBe(obj);
    });
    
    it("creates a proxy constructor function, and, the dependencies are injected when it is invoked", function() {
        var cntxt = {};
        var f = function(x,y){
            this.x=x;
            this.y=y;
        };
        spyOn(DIfunction, "injectPropertyDependencies");
        spyOn(DIfunction, "injectMethodDependencies");
        var obj = {
            propertyDependencies : {
                "a": "b"
            }
            ,methodDependencies: {
                "c": "d"
            }
        };
        var proxyfunc = DIfunction.createProxyConstructor(f, obj);
        expect(typeof proxyfunc).toBe("function");
        cntxt = proxyfunc.call(cntxt, 10, 20);
        expect(cntxt.x).toBe(10);
        expect(cntxt.y).toBe(20);
        expect(DIfunction.injectPropertyDependencies).toHaveBeenCalledWith(cntxt, obj.propertyDependencies);
        expect(DIfunction.injectMethodDependencies).toHaveBeenCalledWith(cntxt, obj.methodDependencies);
    });
    
    it("iterates through the specified property dependencies and invokes injectPropertyDependency for each", function() {
        spyOn(DIfunction, "injectPropertyDependency");
        
        DIfunction.injectPropertyDependencies("blah", {});
        expect(DIfunction.injectPropertyDependency).not.toHaveBeenCalled();
        
        DIfunction.injectPropertyDependencies(null, {});
        expect(DIfunction.injectPropertyDependency).not.toHaveBeenCalled();
        
        DIfunction.injectPropertyDependencies({}, "blah");
        expect(DIfunction.injectPropertyDependency).not.toHaveBeenCalled();
        
        DIfunction.injectPropertyDependencies({}, null);
        expect(DIfunction.injectPropertyDependency).not.toHaveBeenCalled();
        
        var obj={}, deps=[{name:'a', ref:"b"}, {name:'c', ref:"d"}];
        DIfunction.injectPropertyDependencies(obj, deps);
        expect(DIfunction.injectPropertyDependency.callCount).toBe(2);
        
        var args = DIfunction.injectPropertyDependency.argsForCall[0];
        expect(args.length).toBe(3);
        expect(args[0]).toBe(obj);
        expect(args[1]).toBe("a");
        expect(args[2]).toBe("b");
        
        args = DIfunction.injectPropertyDependency.argsForCall[1];
        expect(args.length).toBe(3);
        expect(args[0]).toBe(obj);
        expect(args[1]).toBe("c");
        expect(args[2]).toBe("d");
    });
    
    it("injects dependency instance against specified object's property", function() {
        spyOn(DIfunction, "getDependencyInstance");
        var obj={}, dep={};
        
        DIfunction.injectPropertyDependency(obj, "x", "abc");
        expect(DIfunction.getDependencyInstance).not.toHaveBeenCalled();
        
        DIfunction.providers.abc=dep;
        DIfunction.injectPropertyDependency(obj, "x", "abc");
        expect(DIfunction.getDependencyInstance).toHaveBeenCalledWith(dep);
    });
    
    it("looks up the dependency provider map", function() {
        DIfunction.providers.abc="dep";
        expect(typeof DIfunction.lookupDependencyProvider("foo")).toBe("undefined");
        expect(DIfunction.lookupDependencyProvider("abc")).toBe("dep");
    });
    
    it("creates a proxy of the specified method, and, the dependencies are injected as parameters when it is invoked", function() {
        var obj = {
            foo: function(hi, x) {
                obj.name=x.getName();
            }
        };
        var namefunc = function() {
            return {
                getName: function() {return "abc";}
            };
        }
        spyOn(DIfunction, "getDependencyInstance").andReturn(new namefunc());
        DIfunction.createProxyMethodForInjectingDependencies(obj, "foo", ["nameprovider"]);
        obj.foo("hello");
        expect(obj.name).toBe("abc");
        
    });
    
    it("iterates through the specified method dependencies and invokes createProxyMethod for each", function() {
        var deps = {
            getOne: ["o", "n", "e"]
            ,getTwo: ["t", "w", "o"]
        };
        var obj = {
            getOne: function() {}
            ,getTwo: function(){}
        }
        spyOn(DIfunction, "createProxyMethodForInjectingDependencies");
        DIfunction.injectMethodDependencies(obj, deps);
        expect(DIfunction.createProxyMethodForInjectingDependencies.callCount).toBe(2);
        expect(DIfunction.createProxyMethodForInjectingDependencies.calls[0].args[0]).toBe(obj);
        expect(DIfunction.createProxyMethodForInjectingDependencies.calls[0].args[1]).toBe("getOne");
        expect(DIfunction.createProxyMethodForInjectingDependencies.calls[0].args[2][0]).toBe("o");
        expect(DIfunction.createProxyMethodForInjectingDependencies.calls[0].args[2][1]).toBe("n");
        expect(DIfunction.createProxyMethodForInjectingDependencies.calls[0].args[2][2]).toBe("e");
        expect(DIfunction.createProxyMethodForInjectingDependencies.calls[1].args[0]).toBe(obj);
        expect(DIfunction.createProxyMethodForInjectingDependencies.calls[1].args[1]).toBe("getTwo");
        expect(DIfunction.createProxyMethodForInjectingDependencies.calls[1].args[2][0]).toBe("t");
        expect(DIfunction.createProxyMethodForInjectingDependencies.calls[1].args[2][1]).toBe("w");
        expect(DIfunction.createProxyMethodForInjectingDependencies.calls[1].args[2][2]).toBe("o");
    });
    
    it("does not resolve further and directly returns the value specified for a value type dependency", function() {
        var valueDependencyDef = {
            DEPENDENCY_TYPE: DIfunction.DEPENDENCY_TYPES.VALUE
            ,def: "this can be anything like string/number/object/array/function"
        };
        var obj = DIfunction.getDependencyInstance(valueDependencyDef);
        expect(obj).toBe(valueDependencyDef.def);
    });
    
    it("returns null for a specified dependency when scope[namedref] is not a function", function() {
        var dependencyDef = {
            DEPENDENCY_TYPE: DIfunction.DEPENDENCY_TYPES.PROTO
            ,def: {
                scope:window
                ,namedRef: "somethingUndefined"
            }
        };
        var obj = DIfunction.getDependencyInstance(dependencyDef);
        expect(obj).toBe(null);
        
        dependencyDef.DEPENDENCY_TYPE = DIfunction.DEPENDENCY_TYPES.SINGLETON;
        var obj = DIfunction.getDependencyInstance(dependencyDef);
        expect(obj).toBe(null);
        
        dependencyDef.DEPENDENCY_TYPE = DIfunction.DEPENDENCY_TYPES.FACTORY;
        var obj = DIfunction.getDependencyInstance(dependencyDef);
        expect(obj).toBe(null);
    });
    
    it("delegates to appropriate method depending on dependency type", function() {
        var x = jasmine.createSpyObj("x", ["foo"]);
        var o1 = {}, o2 = {}, o3 = {};
        //x.foo.andReturn(o1);
        var dependencyDef = {
            DEPENDENCY_TYPE: DIfunction.DEPENDENCY_TYPES.PROTO
            ,def: {
                scope:x
                ,namedRef: "foo"
            }
        };
        spyOn(DIfunction, "DIconstruct").andReturn(o1);
        spyOn(DIfunction, "getSingletonInstance").andReturn(o2);
        spyOn(DIfunction, "getDependencyInstanceFromFactory").andReturn(o3);
        
        var obj = DIfunction.getDependencyInstance(dependencyDef);
        expect(obj).toBe(o1);
        expect(DIfunction.DIconstruct.callCount).toBe(1);
        expect(DIfunction.getSingletonInstance.callCount).toBe(0);
        expect(DIfunction.getDependencyInstanceFromFactory.callCount).toBe(0);
        
        DIfunction.DIconstruct.reset();
        DIfunction.getSingletonInstance.reset();
        DIfunction.getDependencyInstanceFromFactory.reset();
        
        dependencyDef.DEPENDENCY_TYPE = DIfunction.DEPENDENCY_TYPES.SINGLETON;
        var obj = DIfunction.getDependencyInstance(dependencyDef);
        expect(obj).toBe(o2);
        expect(DIfunction.DIconstruct.callCount).toBe(0);
        expect(DIfunction.getSingletonInstance.callCount).toBe(1);
        expect(DIfunction.getDependencyInstanceFromFactory.callCount).toBe(0);
        
        DIfunction.DIconstruct.reset();
        DIfunction.getSingletonInstance.reset();
        DIfunction.getDependencyInstanceFromFactory.reset();
        
        dependencyDef.DEPENDENCY_TYPE = DIfunction.DEPENDENCY_TYPES.FACTORY;
        var obj = DIfunction.getDependencyInstance(dependencyDef);
        expect(obj).toBe(o3);
        expect(DIfunction.DIconstruct.callCount).toBe(0);
        expect(DIfunction.getSingletonInstance.callCount).toBe(0);
        expect(DIfunction.getDependencyInstanceFromFactory.callCount).toBe(1);
    });
    
    xit("returns an instance for a specified dependency", function() {
        
    });
    
    xit("returns an instance for a specified dependency", function() {
        
    });
    
    xit("", function() {
        
    });
    
    xit("", function() {
        
    });
    
    xit("", function() {
        
    });
    
    xit("", function() {
        
    });
    
    xit("", function() {
        
    });
    
    xit("", function() {
        
    });
    
});
