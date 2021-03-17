---
title: I've decided to write a programming language
date_published: 2021-3-16
tags:
    - programming-languages
    - imp
---

I've decided it's time to write a programming language.

I'm extremely interested in the field of programming languages and how their differences lend themselves in different ways to solving problems. First, with the input of my peers, I settled on a handful of core goals for the project.

## Core Goals
**Fast Iteration** - implement a REPL and a rapid compile/test loop\
**Familiar Syntax** - a C-style syntax with curly brackets (but no semicolons of course)\
**Module System** - a 
**First-class Functions** - functions may be passed around like object instances or any primitive type\
**Type System** - statically typed with type inference\
**Integrated Event Loop** - a la JavaScript\
**Write Less Code** - minimize surface area of programs implemented using this language\

_Note: performance is explicity not a goal, nor is competition with existing languages_

## First Steps
I've begun work on the parser using the [ANTLR](https://www.antlr.org/) parser generator. Currently I'm testing the grammar using the [ANTLR IntelliJ Plugin](https://plugins.jetbrains.com/plugin/7358-antlr-v4). I'd like to say I have the general syntax and semantics of the language reasonably finalized.

## Syntax
I've linked the current (as of March 2021) `.g4` [parser](ImpParser.g4) and [lexer](ImpLexer.g4) specification files.

The syntax of language features like classes has not _quite_ settled yet but here's what a simple temperature conversion calculator program[^1] would look like:
```
function kelvinToCelcius(k float) float {
    return k - 273.15
}

function kelvinToRankine(k float) float {
    return k * 1.8
}

function kelvinToFahrenheit(k float) float {
    val rankine = kelvinToRankine(k)
    val fahrenheit = rankine - 459.67
    return fahrenheit
}

val input = read()
val k = new Float(input)

log("K", input)
log("C", kelvinToCelcius(k))
log("R", kelvinToRankine(k))
log("F", kelvinToFahrenheit(k))
```



## Semantics
**immutability** - all entities immutable by default. Mutability supported using the `mut` keyword.\
**scope** - all entities scope inwards, no scope hoisting.\
**ordering** - all entities defined in the same scope are accessible by any line in that scope.\
**identifiers** - primitives, objects, functions, classes, enums, interfaces, function type signatures etc can all be referred to by an identifier at compile time.\
**first-class entities** - any entity which supports all operations available to an entity. This includes entities accessible at runtime, including variables, functions and objects.\
**second-class entities** - any entity which does not support all operations available to an entity. This includes function signatures, class definitions and packages/modules. These entities are eliminated at compile time.\
**closures** - exist.


## Things I haven't decided yet
As a work in progress with no (completed) compiler thus far, many important decisions still have to be made.
- **garbage collection/ownership model** - there will be some sort of memory management but that's up in the air as of now.
- **parallelism** - concurrency is a core language construct in the event loop system but I'm not set on any parallelism model as of yet.
- **compile target** - turrently deciding between implementing the reference backend for the JVM or for WebAssembly.
- **implementation language** - ANTLR spits out Java code by default but it supports many other languages as well. I may consider using a different language to write the compiler if I choose WebAssembly as the compile target. If the JVM is chosen as the primary compile target I will implement this language in Java most likely.

## Addendum
We'll see how this goes! Who's to say how far this project gets. As work on the grammar continues, the requirements of the module system are becoming clearer. Hopefully that will be the next post.

### Footnotes
[^1]: Temperature Conversion algorithms courtesy [Rosetta Code](http://www.rosettacode.org/wiki/Temperature_conversion)