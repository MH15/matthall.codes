---
title: Adding Structs to Imp
date_published: 2021-6-02
tags:
    - programming-languages
    - imp
---

I've added to Imp a way for users to define custom types through structs.


The current version of the Imp compiler is live on [Github](https://github.com/MH15/imp/). Most recent commit at time of writing [3e004a782334f30574f3b6bc6ac9cea9a93eea64](https://github.com/MH15/imp/tree/3e004a782334f30574f3b6bc6ac9cea9a93eea64).

## Design

Users define a new struct using the following syntax:

```imp
struct Person {
    fname string
    lname string
    dateOfBirth Date
}
```
Each field must include a type. Fields marked with `string`, `int`, `float`, `bool`, etc. are treated as value types, while other fields reference instances of other custom structs (Date, in the above example). To initialize an instance of a struct I've adopted the `new` keyword:

```imp
val matt = new Person()
```

The variable `matt` is inferred to have type of `Person` at compile-time. Property access and assignment is also supported:

```imp
matt.fname = "Matt"
matt.lname = "Hall"

log(matt.fname)
log(matt.lname)
```

One can define functions that accept arguments of a custom type. These arguments are pass-by-reference currently as that's how the JVM works with objects but value-types will exist eventually once Imp's mutability story settles.

```imp
function greet(p Person) {
    log("Hello, ")
    log(p.fname)
}

greet(matt)

// Hello,
// Matt
```


## Implementation

Structs in Imp are compiled to classes on the JVM. When parsing an Imp file, struct definitions are removed and compiled into class files. The definition of `Person` above is compiled to the following JVM bytecode:

```
public class scratch.Person {
  public java.lang.String fname;

  public java.lang.String lname;

  public Date dateOfBirth;

  public scratch.Person();
    Code:
       0: aload_0
       1: invokespecial #8                  // Method java/lang/Object."<init>":()V
       4: return
}
```

Each struct definition in the source file is compiled to its own class. These classes are saved to the same package as the rest of the source file. 

### Initialization

For initialization, the `INVOKESPECIAL` opcode is used.

```java
// from StructInit.java
public void generate(MethodVisitor mv, Scope scope) {
    String ow = new StructType(struct).getInternalName();
    String ownerDescriptor = "scratch/" + ow;
    mv.visitTypeInsn(Opcodes.NEW, ownerDescriptor);
    mv.visitInsn(Opcodes.DUP);

    FunctionSignature constructorSignature = new FunctionSignature(ow, Collections.emptyList(), BuiltInType.VOID);
    String methodDescriptor = DescriptorFactory.getMethodDescriptor(constructorSignature);

    // generate arguments
    arguments.forEach(argument -> argument.generate(mv, scope));

    mv.visitMethodInsn(Opcodes.INVOKESPECIAL, ownerDescriptor, "<init>", methodDescriptor, false);
}
```

### Property Access

Property access was a bit more tricky. To make the feature ergonomic, each property access expression needs to be typechecked, and useful errors must be reported to the programmer. I rewrote the compiler error codes to be more useful when programming. Say for example you made a typo while setting the `fname` property on a `Person`:

```imp
val matt = new Person()
matt.fnam = "Matt"
```

This would not compile and would instead print the following text:

```
filename@26:6 SyntaxError[3]: Identifier 'fnam' does not exist as a field on the parent struct.
	Check the type definition of custom types to find the correct field name, or to add a field of this name.
Correct semantic errors before compilation can continue.
```

I've added many such errors. The first line shows you where and what is wrong, the second line gives a suggestion of what to do. The errors are coded to make searching for help easier. For codegen on property access expressions, field access of one level is supported in compilation. Nested field access, like the expression `matt.dateOfBirth.year` is not yet supported. This will be implemented in the near future.

All of the above functionality is still flakey, but it runs for simple examples.

## Other updates

I've split the two parse and compile passes into three passes total.
1. **parse** takes the ANTLR context and generates an AST.
2. **validate** performs static type checking and inference and modifies the AST to include this information.
3. **compile** compiles the fully typed AST to bytecode.

This change was necessary to allow users to reference a custom type before it has been defined, an ability necessary to support recursive types and nested types. Function signatures will also benefit from this added pass but for now you cannot call a function at a point in the file before it has been parsed. 

## Looking ahead

There's not much more work to do with structs. Once structs settle to a point they are useable, I intend to work on implementing Java interop. I'm not sure how this will work as Java is a far more complex language than Imp, but I want to at least support using the Java Collections library in Imp code, preferably in a syntax that feels native to this language, but still is compatible with Java.

I also need to decide what the module system will look like. Some of the first ideas I had for this language were about the module system so it'll be fun to go back and look at these. 

### Footnotes
Again much thanks to Jakub Dziworski's blog posts on [Enkel](http://jakubdziworski.github.io/categories.html#Enkel-ref). Since my [last post](/blog/imp-jvm-compilation/), the architecture of Imp has diverged but without his examples of compiling certain constructs using [OW2 ASM](https://asm.ow2.io/), this project would be taking a lot longer. 