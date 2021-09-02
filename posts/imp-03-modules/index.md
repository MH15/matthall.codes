---
title: Modules for Imp
date_published: 2021-9-02
tags:
    - programming-languages
    - imp
---

I've implemented a module system for the Imp programming language.

The current version of the Imp compiler is live on [Github](https://github.com/MH15/imp/). Most recent commit at time of writing [cc23c098647ff22769ce32dc42b81589dab9dd83](https://github.com/MH15/imp/commit/cc23c098647ff22769ce32dc42b81589dab9dd83).


## Introduction

The language project has come a long way since the [last post](/blog/imp-02-adding-structs/). I've added a bare-bones implementation of [closures](https://en.wikipedia.org/wiki/Closure_(computer_programming)), which included implementing value-type boxing and unboxing at the bytecode level and forced me to redesign how functions are compiled. I've added some basic language constructs that I've been putting off, such as logical and/or/not and string literals with escape characters. Recently, the biggest new feature has been the addition of the module system.

## Design

I didn't have many opinions on the module system going in, but I new I wanted it to further the main goal of the Imp language, *to support programmer confidence*. This meant that all imports and exports needed to be type-checked and valdiated at compile time and designed in a way that will support dot-autocomplete in the future. I am a fan of file-based modules (think an implicit namespace) in the format most popular with NodeJS modules. Several people helped me design the syntax for import statements that fulfil the above goals.

### Imports

Import statements may follow one of the three following forms:
```g4
importStatement
    // import "io"
    : IMPORT stringLiteral                       #ImportFile 
    // import "io" as fs
    | IMPORT stringLiteral AS identifier         #ImportFileAsIdentifier 
    // from "io" import read, write
    | FROM stringLiteral IMPORT identifierList   #ImportFromFile 
;
```

The first form imports all exported members of module `io` under an alias of the same name. The second form does the same but under a custom alias. The third form is more complicated- it only imports the entities you wish to use from the module, and you can use them without a namespace.

Note that the third form differs from the NodeJS format. In Node, `import { export1 , export2 } from "module-name"` is how we import certain items. This is not as ergonomic for autocomplete tooling, so in Imp we accomplish the same by writing the module name before the specific imports.

### Exports

Any first-class entity (functions, variables, structs) can be exported for consumption in another file. The entity's type signatures are available in the file that imports the entity.

## Implementation

Each Imp file may begin with zero or more import statements. After parsing the entry file, we can begin walking the tree:

```java
private final Graph<ImpFile, DefaultEdge> dependencies = new DefaultDirectedGraph<>(DefaultEdge.class);

public Graph<ImpFile, DefaultEdge> walkDependencies(ImpFile entry) throws IOException {
    dependencies.addVertex(entry);
    recurse(entry);
    return dependencies;
}

private void recurse(ImpFile file) throws IOException {
    var imports = ImpAPI.gatherImports(file);

    for (var impFile : imports.values()) {
        dependencies.addVertex(impFile);
        dependencies.addEdge(file, impFile);
        recurse(impFile);
    }
}
```

We then have built a tree that represents all imported files by any file that the entry file imports. This tree may have duplicates (some files may be imported by more than one file), so we reduce the tree to a set of the files that must be compiled:

```java
// Reduce graph dependencies to unique set of compilation units
Iterator<ImpFile> iterator = new DepthFirstIterator<>(dependencyGraph, entry);
Map<String, ImpFile> compilationSet = new HashMap<>();
while (iterator.hasNext()) {
    ImpFile impFile = iterator.next();
    if (!compilationSet.containsKey(impFile.packageName)) {
        compilationSet.put(impFile.packageName, impFile);
    }
}
```

Then we compile each file as normal and write its contents to the disk, following the structure of the original files. The compiled Java package structure matches the source structure.


## Looking ahead

The module system took wildly less time than closures, but to me was much more interesting. While implementing closures I developed the ability for a compiled Imp class to call a compiled Java class, so I'm thinking it's time to start working on the standard library. I'm also experimenting with [Unified Function Call Syntax](https://en.wikipedia.org/wiki/Uniform_Function_Call_Syntax) as a method for adding functionality to structs without supporting a full OOP system.

I'm also seeking beta testers. The source code has been on Github in a semi-functional state for a while now but odds are it'd take some communication to get a programmer up and running at this point. Anyone who wants to give it a spin should email me at [matthew349hall@hotmail.com](mailto:matthew349hall@hotmail.com).


### Footnotes
Graph data structures provided by [JGraphT](https://jgrapht.org/). Seriously recommend.