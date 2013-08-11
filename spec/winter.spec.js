describe("suite of Inject specs:- ", function() {
    
    beforeEach(function () {
       Inject.providers={}; 
    });
    
    it("expects either name to be present in definition or the definition type to be 'value'", function() {
        var f = function(){};
        spyOn(Inject, "registerDependencyProvider");
        spyOn(Inject, "createProxyConstructor");
        spyOn(Inject, "defineNamespacedFunction");
        f.Inject({
            type : Inject.DEPENDENCY_TYPES.VALUE
        });
        expect(Inject.defineNamespacedFunction).not.toHaveBeenCalled();
        expect(Inject.createProxyConstructor.callCount).toBe(0);
        expect(Inject.registerDependencyProvider).not.toHaveBeenCalled();
        
        f.Inject({
            name : 'obj.foo'
        });
        expect(Inject.defineNamespacedFunction.callCount).toBe(1);
        expect(Inject.createProxyConstructor.callCount).toBe(1);
        expect(Inject.registerDependencyProvider).not.toHaveBeenCalled();
    });
    
    it("proxies the constructor but does not register when there are no exports", function() {
        var f = function(){};
        spyOn(Inject, "registerDependencyProvider");
        spyOn(Inject, "createProxyConstructor");
        f.Inject({
            name : 'MyObj.f'
        });
        expect(Inject.createProxyConstructor.callCount).toBe(1);
        expect(Inject.registerDependencyProvider).not.toHaveBeenCalled();
    });
    
    it("proxies and registers the constructor when there is atleast one export", function() {
        var f = function(){};
        spyOn(Inject, "registerDependencyProvider");
        spyOn(Inject, "createProxyConstructor");
        f.Inject({
            name : 'MyObj.f'
            ,exports : ["blah"]
        });
        expect(Inject.createProxyConstructor.callCount).toBe(1);
        expect(Inject.registerDependencyProvider.callCount).toBe(1);
    });
    
    it("adds entries in the registry for all export entries", function() {
        var obj = {
            exports: ["abc", "def"]
        };
        Inject.registerDependencyProvider(obj);
        expect(Inject.providers.abc).toBe(obj);
        expect(Inject.providers.def).toBe(obj);
    });
    
    it("creates a proxy constructor function, and, the dependencies are injected when it is invoked", function() {
        var f = function(x,y){
            this.x=x;
            this.y=y;
        };
        var dependencyDef = {
            name : 'MyObj.f'
            ,autowire: {
                properties : {
                    "a": "b"
                }
                ,methods: {
                    "c": "d"
                }
                ,constructorArgs: ["e","f"]
            }
        };
        
        spyOn(Inject, "injectPropertyDependencies");
        spyOn(Inject, "injectMethodDependencies");
        spyOn(Inject, "createProxyConstructor").andCallThrough();
        
        f.Inject(dependencyDef);
        !function() {}.Inject({          //The order in which ctors register does NOT matter :)
            type: Inject.DEPENDENCY_TYPES.VALUE
            ,exports: ["e"]
            ,value: 10
        });
        !function() {}.Inject({          //The order in which ctors register does NOT matter :)
            type: Inject.DEPENDENCY_TYPES.VALUE
            ,exports: ["f"]
            ,value: 20
        });

        var cntxt = new MyObj.f();
        expect(cntxt.x).toBe(10);
        expect(cntxt.y).toBe(20);
        expect(Inject.createProxyConstructor).toHaveBeenCalledWith(f, dependencyDef);
        expect(Inject.injectPropertyDependencies).toHaveBeenCalledWith(cntxt, dependencyDef.autowire.properties);
        expect(Inject.injectMethodDependencies).toHaveBeenCalledWith(cntxt, dependencyDef.autowire.methods);
    });
    
    it("iterates through the specified property dependencies and invokes injectPropertyDependency for each", function() {
        spyOn(Inject, "injectPropertyDependency");
        
        Inject.injectPropertyDependencies("blah", {});
        expect(Inject.injectPropertyDependency).not.toHaveBeenCalled();
        
        Inject.injectPropertyDependencies(null, {});
        expect(Inject.injectPropertyDependency).not.toHaveBeenCalled();
        
        Inject.injectPropertyDependencies({}, "blah");
        expect(Inject.injectPropertyDependency).not.toHaveBeenCalled();
        
        Inject.injectPropertyDependencies({}, null);
        expect(Inject.injectPropertyDependency).not.toHaveBeenCalled();
        
        var obj={}, deps=[{a:"b"}, {c:"d"}];
        Inject.injectPropertyDependencies(obj, deps);
        expect(Inject.injectPropertyDependency.callCount).toBe(2);
        
        var args = Inject.injectPropertyDependency.argsForCall[0];
        expect(args.length).toBe(3);
        expect(args[0]).toBe(obj);
        expect(args[1]).toBe("a");
        expect(args[2]).toBe("b");
        
        args = Inject.injectPropertyDependency.argsForCall[1];
        expect(args.length).toBe(3);
        expect(args[0]).toBe(obj);
        expect(args[1]).toBe("c");
        expect(args[2]).toBe("d");
    });
    
    it("injects dependency instance against specified object's property", function() {
        spyOn(Inject, "getDependencyInstance");
        var obj={}, dep={};
        
        Inject.injectPropertyDependency(obj, "x", "abc");
        expect(Inject.getDependencyInstance).not.toHaveBeenCalled();
        
        Inject.providers.abc=dep;
        Inject.injectPropertyDependency(obj, "x", "abc");
        expect(Inject.getDependencyInstance).toHaveBeenCalledWith(dep);
    });
    
    it("looks up the dependency provider map", function() {
        Inject.providers.abc="dep";
        expect(typeof Inject.lookupDependencyProvider("foo")).toBe("undefined");
        expect(Inject.lookupDependencyProvider("abc")).toBe("dep");
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
        spyOn(Inject, "getDependencyInstance").andReturn(new namefunc());
        Inject.createProxyMethodForInjectingDependencies(obj, "foo", ["nameprovider"]);
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
        spyOn(Inject, "createProxyMethodForInjectingDependencies");
        Inject.injectMethodDependencies(obj, deps);
        expect(Inject.createProxyMethodForInjectingDependencies.callCount).toBe(2);
        expect(Inject.createProxyMethodForInjectingDependencies.calls[0].args[0]).toBe(obj);
        expect(Inject.createProxyMethodForInjectingDependencies.calls[0].args[1]).toBe("getOne");
        expect(Inject.createProxyMethodForInjectingDependencies.calls[0].args[2][0]).toBe("o");
        expect(Inject.createProxyMethodForInjectingDependencies.calls[0].args[2][1]).toBe("n");
        expect(Inject.createProxyMethodForInjectingDependencies.calls[0].args[2][2]).toBe("e");
        expect(Inject.createProxyMethodForInjectingDependencies.calls[1].args[0]).toBe(obj);
        expect(Inject.createProxyMethodForInjectingDependencies.calls[1].args[1]).toBe("getTwo");
        expect(Inject.createProxyMethodForInjectingDependencies.calls[1].args[2][0]).toBe("t");
        expect(Inject.createProxyMethodForInjectingDependencies.calls[1].args[2][1]).toBe("w");
        expect(Inject.createProxyMethodForInjectingDependencies.calls[1].args[2][2]).toBe("o");
    });
    
    it("does not resolve further and directly returns the value specified for a value type dependency", function() {
        var valueDependencyDef = {
            type: Inject.DEPENDENCY_TYPES.VALUE
            ,value: "this can be anything like string/number/object/array/function"
        };
        var obj = Inject.getDependencyInstance(valueDependencyDef);
        expect(obj).toBe(valueDependencyDef.value);
    });
    
    it("returns null for a specified dependency when scope[namedref] is not a function", function() {
        var dependencyDef = {
            type: Inject.DEPENDENCY_TYPES.PROTO
            ,name: "somethingUndefined"
        };
        var obj = Inject.getDependencyInstance(dependencyDef);
        expect(obj).toBe(null);
        
        dependencyDef.type = Inject.DEPENDENCY_TYPES.SINGLETON;
        var obj = Inject.getDependencyInstance(dependencyDef);
        expect(obj).toBe(null);
        
        dependencyDef.type = Inject.DEPENDENCY_TYPES.FACTORY;
        var obj = Inject.getDependencyInstance(dependencyDef);
        expect(obj).toBe(null);
    });
    
    it("delegates to appropriate method depending on dependency type", function() {
        var x = jasmine.createSpyObj("x", ["foo"]);
        var o1 = {}, o2 = {}, o3 = {};
        //x.foo.andReturn(o1);
        var dependencyDef = {
            type: Inject.DEPENDENCY_TYPES.PROTO
            ,name: 'x.foo'
        };
        spyOn(Inject, "DIconstruct").andReturn(o1);
        spyOn(Inject, "getSingletonInstance").andReturn(o2);
        spyOn(Inject, "getDependencyInstanceFromFactory").andReturn(o3);
        
        var obj = Inject.getDependencyInstance(dependencyDef);
        expect(obj).toBe(o1);
        expect(Inject.DIconstruct.callCount).toBe(1);
        expect(Inject.getSingletonInstance.callCount).toBe(0);
        expect(Inject.getDependencyInstanceFromFactory.callCount).toBe(0);
        
        Inject.DIconstruct.reset();
        Inject.getSingletonInstance.reset();
        Inject.getDependencyInstanceFromFactory.reset();
        
        dependencyDef.type = Inject.DEPENDENCY_TYPES.SINGLETON;
        var obj = Inject.getDependencyInstance(dependencyDef);
        expect(obj).toBe(o2);
        expect(Inject.DIconstruct.callCount).toBe(0);
        expect(Inject.getSingletonInstance.callCount).toBe(1);
        expect(Inject.getDependencyInstanceFromFactory.callCount).toBe(0);
        
        Inject.DIconstruct.reset();
        Inject.getSingletonInstance.reset();
        Inject.getDependencyInstanceFromFactory.reset();
        
        dependencyDef.type = Inject.DEPENDENCY_TYPES.FACTORY;
        var obj = Inject.getDependencyInstance(dependencyDef);
        expect(obj).toBe(o3);
        expect(Inject.DIconstruct.callCount).toBe(0);
        expect(Inject.getSingletonInstance.callCount).toBe(0);
        expect(Inject.getDependencyInstanceFromFactory.callCount).toBe(1);
    });
    
    it("gets an instance from a factory", function() {
        var obj1 = {
            nameOfFunction: function() {
                return "Hello, World!";
            }
        };
        spyOn(obj1, "nameOfFunction").andCallThrough();
        var someObj={"aaa":"bbb"}, args = [someObj];
        spyOn(Inject, "getConstructorArgDependencies").andCallFake(function(){
            return args;
        });
        var dependencyDef = {
            factory: {
                obj: obj1
                ,methodName: "nameOfFunction"
            }
        };
        var ret = Inject.getDependencyInstanceFromFactory(dependencyDef);
        expect(Inject.getConstructorArgDependencies).toHaveBeenCalled();
        expect(obj1.nameOfFunction.callCount).toBe(1);
        expect(obj1.nameOfFunction).toHaveBeenCalledWith(someObj);
        expect(ret).toBe("Hello, World!");
    });
    
    it("gets constructor arg dependencies", function() {
        var dep1="abc", dep2="def", def1={name:"abc"}, def2={name:"def"}, obj1={val:10}, obj2={val:20};
        spyOn(Inject, "lookupDependencyProvider").andCallFake(function(name){
            switch(name) {
                case dep1: return def1;
                case dep2: return def2;
            }
        });
        spyOn(Inject, "getDependencyInstance").andCallFake(function(def){
            switch(true) {
                case (def==def1): return obj1;
                case (def==def2): return obj2;
            }
        });
        var arr = Inject.getConstructorArgDependencies([dep1,dep2]);
        expect(arr[0]).toBe(obj1);
        expect(arr[1]).toBe(obj2);
    });
    
    it("gets a singleton instance", function() {
        var def = {name: "foo"}, abc={};
        expect(Inject.getSingletonInstance(def)).toBe(null);
        
        def.exports=[];
        expect(Inject.getSingletonInstance(def)).toBe(null);
        
        def.exports=["abc", "def"];
        spyOn(Inject, "DIconstruct").andReturn(abc);
        
        expect(Inject.getSingletonInstance(def)).toBe(abc);
        expect(Inject.DIconstruct).toHaveBeenCalledWith(def);
        expect(Inject.singletons.abc).toBe(abc);
        
        Inject.DIconstruct.reset();
        Inject.singletons.abc=abc
        expect(Inject.getSingletonInstance(def)).toBe(abc);
        expect(Inject.DIconstruct).not.toHaveBeenCalled();
        
        Inject.singletons={};
    });
    
    it("invokes proxy constructor and returns the object instantiated", function() {
        var obj1 = {
            nameOfFunction: function() {
                return "Hello, World!";
            }
        };
        var def = {
            name: "obj1"
        }
        spyOn(Inject, "getNamespacedFunction").andReturn([obj1, "nameOfFunction"]);
        
        expect(Inject.DIconstruct(def)).toBe("Hello, World!");
        expect(Inject.getNamespacedFunction.callCount).toBe(1);
        
        Inject.getNamespacedFunction.reset();
        Inject.getNamespacedFunction.andReturn([{}, "undefinedFunc"]);
        expect(Inject.DIconstruct(def)).toBe(null);
        expect(Inject.getNamespacedFunction.callCount).toBe(1);
    });
    
    it("creates a namespaced function", function() {
        var f=function(){};
        Inject.defineNamespacedFunction("A.B.C.foo", f);
        expect(window.A.B.C.foo).toBe(f);
    });
    
    it("gets a namespaced function", function() {
        window.obj1 = {
            obj2 : {
                nameOfFunction: function(){}
            }
        }
        var arr = Inject.getNamespacedFunction("obj1.obj2.nameOfFunction");
        expect(arr[0]).toBe(window.obj1.obj2);
        expect(arr[1]).toBe("nameOfFunction");
        window.obj1 = undefined;
    });
});
