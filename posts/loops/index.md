---
title: All the Loops
date_published: 2020-7-8
authors:
    - matt-hall
tags:
    - javascript
    - reference
---

Modern JavaScript supports many different looping constructs. I often use these
different constructs for working with arrays. This is a reference, for myself
and for others, written to augment the [existing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration) [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) [documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).

An array `arr` is defined for all the below examples. The sample code for each
looping construct performs the same behavior.

## Basic Loop Constructs

### [`for` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration#for_statement)
This is the standard C-style loop.
```javascript
let arr = ["a","b","c","d"]
for(var i = 0; i < arr.length; i++) {
    console.log(i, arr[i])
}
```

### [`do...while` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration#do...while_statement)
Repeat until condition is false.
```javascript
var i = 0;
do {
    console.log(i, arr[i])
    i++
} while (i < arr.length)
```
### [`while` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration#while_statement)
Repeat while condition is true.
```javascript
var i = 0
while (i < arr.length) {
    console.log(i, arr[i])
    i++
}
```

## Object Loop Constructs
### [`for...in` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration#for...in_statement)
Executes on the properties (indices) of an object. In JavaScript, Arrays are objects, so
this is valid.
```javascript
for(var i in arr) {
    console.log(i, arr[i])
}
```
### [`for...of` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration#for...of_statement)
Loops over the values of iterable objects including Array, Map and Set.
```javascript
var i = 0
for(var val of arr) {
    console.log(i, val)
    i++
}
```
Note that `for...of` loops the values, while `for...in` loops the properties/indices.

## Functional Loop Constructs
Multiple functional-style prototypes exist on the Array object. Handy for
list comprehensions or for rewriting complicated loops with simpler syntax,
especially with `reduce` and `filter`. Promotes immutability.

### [`map` prototype](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
Calls a callback function once for each element and returns the resulting array.
This map callback prints trivial debug information for the array.
```javascript
function callback(value, index, array) {
    console.log(index, value)
    return `value: ${value}, index: ${index}`;
}
var mappedArr = arr.map(callback)
```
Does not mutate the source array.

### [`reduce` prototype](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
Calls a reducer callback to accumulate the array values into a single value.
This reducer callback joins the array with commas, similar to [`Array.prototype.join()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join).
```javascript
function reducer(accumulator, value, index, array) {
    console.log(index, value)
    return accumulator + "," + value
}
var initialValue = ""
var joined = arr.reduce(reducer, initialValue)
```
Does not mutate the source array. Note that if the `initialValue` parameter is
not included in the `arr.reduce()` call, the initial value is set to `array[0]`
and that first index will be skipped in the loop.

### [`filter` prototype](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
Calls a filter callback to create a filtered array from the source array. This
useless filter function below illustrates the behavior. The `filter` prototype
is very useful for cleaning *sparse arrays* or for, of course, filtering data
based on a condition in a more readable manner than with a `for` loop.
```javascript
function filter(value, index, array) {
    console.log(index, value)
    if (value == "b") {
        return true
    } else {
        return false
    }
}
var filtered = arr.filter(filter)
```
Does not mutate the source array.

## Addendum
Nothing here for now.