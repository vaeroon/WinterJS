# WinterJS

[![Build Status](https://travis-ci.org/vaeroon/WinterJS.png)](https://travis-ci.org/vaeroon/WinterJS)

## What is WinterJS
WinterJS is a light weight (no frills, no B***S***), a bit opinionated, [IoC](http://en.wikipedia.org/wiki/Inversion_of_control) framework written in JavaScript.

## Need for WinterJS
The core (sole?) objective of WinterJS is to enable authoring of testable JavaScript apps/frameworks. This is achieved by providing a [DI](http://en.wikipedia.org/wiki/Dependency_injection) mechanism.

Hence, unlike some others, it is not coupled with RequireJS. The thought process is that it should be straight forward to author testable and reusable code using plain old objects/prototypes (POJSO?). WinterJS highly encourages this style of coding. This is in contrast to the typical abuse of closures for building "modular" code. 

This, however, is not to discount the merits of building modules. Using WinterJS, it is straightforward to build modules which are thin wrappers over POJSOs. So we get the merits of "modules" without having significant impact on testability or reusability.

***

[The examples might help to gain a better understanding. Please do take a look.](https://github.com/vaeroon/WinterJS/tree/master/examples)
