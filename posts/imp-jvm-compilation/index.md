---
title: Compiling Imp to the JVM
date_published: 2021-4-18
tags:
    - programming-languages
    - imp
---

I've made a lot of progress since my last post. Since then, I've chosen the Java Virtual Machine as the target platform for Imp. I'm not that interested in the memory management or virtual machine components of language design, and given that the JVM is very quick (thanks JIT!) it seems like a good choice. Also, I used [ANTLR](https://www.antlr.org/) to generate the parser, and ANTLR is written in Java, so it follows that I'll write the first version of Imp in Java.

The current version of the Imp compiler is live on [Github](https://github.com/MH15/imp/). Most recent commit at time of writing [76c703e5cd11a0c04fd5c103e94192c520b05b91](https://github.com/MH15/imp/tree/76c703e5cd11a0c04fd5c103e94192c520b05b91).

## Inspiration

The initial boilerplate code for the Imp compiler is inspired heavily by the [Creating JVM language](http://jakubdziworski.github.io/enkel/2016/03/10/enkel_first.html) series of blog posts by [Jakub Dziworski](https://github.com/JakubDziworski). Imp is far different than Jakub's Enkel, but his examples on how to use ANTLR's generated parsing code are the best I've found.


## Concepts

I've made some key decisions about the semantics of this implementation while developing the compiler. The aspects below have been (mostly) implemented.

### Classes

Each Imp file a programmer may write is split into several class files at compile time. As there is no `main` entry point in an Imp file, the first statement in the file runs first. To accomplish this, each top level statement that is not a class declaration is added to a separate class. Functions declared in this outer scope are compiled to static methods in said class. Class declarations will be compiled to a separate file.

### Types

So far, only primitive types have been implemented. Each Imp primitive type is mapped to a JVM primitive type.

- `int` and `bool` compile to Java integers.
- `float` compiles to a Java float.
- `double` compiles to a Java double.
- `string` compiles to a `java.lang.String` object.

### Variables

Reference variables in a similar model to Java have been implemented. A variable may be passed to a function or assigned a new result. The immutability model of Imp has yet to be implemented. Soon, variables not declared as mutable will not support modification after initialization.

## Parsing the AST

From the ANTLR base classes I use the Visitor pattern to "visit" each node in the parse tree. 

## Bytecode generation

The [ASM](https://asm.ow2.io/) framework is a tool to generate and manipulate JVM bytecode. I'm using ASM to dynamically generate class files from the ANTLR parse tree.

## Turing completeness

With this progress, Imp is now [turing complete](https://en.wikipedia.org/wiki/Turing_completeness). I can compile simple code like the following example, and see the expected output.

```imp
function sum(x int, y int) int {
    return x + y
}

val expected = 8
val actual = sum(3, 50)


if expected == actual {
    log("equal")
} else {
    log("not equal")
}
```

Loops and nested loops also compile.

```imp

loop val i=0; i<10; i=i+1 {
    if i==4 {
        log("b")
    }
    log("aaa")
}
```

These are trivial examples, but the foundations are in place for compilation to bytecode of the entire Imp language.




### Footnotes
[^1]: Temperature Conversion algorithms courtesy [Rosetta Code](http://www.rosettacode.org/wiki/Temperature_conversion)