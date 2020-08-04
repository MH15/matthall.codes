---
title: Functional Core, Imperative Shell in Typescript
date_published: 2020-7-8
authors:
    - matt-hall
tags:
    - typescript
    - cs
draft: true
---

I recently stumbled across Destroy All Software's screencast titled [Functional
Core, Imperative
Shell](https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell).
I realized that I've come to structure many of my projects that have both
"business-side" and "display-side" logic this way. I mostly work in Typescript,
and this talk is in Ruby, so I'm writing a guide (for myself and for others) on adhering to **Functional
Core, Imperative Shell** in  Typescript (or modern JavaScript).

## Definitions
- *functional* - functional programming means a lot of things, here, it
  means that the unit of abstraction (be it the class, or function)
  does not depend on its state. 
- *imperative* - imperative programming uses statements to alter a program's
  state, each statement may operate on a different program state then the
  previous statement.
- *immutability* - an immutable object is a group of data that cannot be
  modified after creation. To update the value of an immutable object, you
  simply create a new object. Note: `const` in JavaScript does not cause
  immutability in objects, only immutability in assignment[^1].

## Motivations
The ecosystem of TS/JS often deals with
applications where responsibilites of the view and data layers are muddied. I
believe a **Functional Core, Imperative Shell** model can alleviate some of
these issues.

## Functional Core
The functional core should be kept as pure as possible. 

Remember, writing a functional core does not mean to avoid classes. TS/JS
classes are a good way to separate concerns. What makes the core functional is
how immutable and pure the calls can be.

## Imperative Shell



## Footnotes
[^1]: [ES2015 `const` is not about immutability](https://mathiasbynens.be/notes/es6-const).