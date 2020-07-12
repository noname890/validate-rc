<h1 align="center">Validate RC</h1>
<h3 align="center">A library that validates objects with rules.</h3>

# Usage

**NOTE: This library is intended to be used for config files, but if you __really__ want to, you can use it like a 'runtime interface'.**

__Example__

```ts
// dummy.ts

// import validateRc
import validateRc, { Optional, Choice } from 'validate-rc'

// the rules that the rc should follow
// rule to validate a custom package.json
const rules = {
    name: String,
    version: String,
    description: Optional(Object),
    scripts: Optional(Object),
    keywords: Array,
    dependencies: Optional(Object),
    devDependencies: Optional(Object),
    author: String,
    license: String,
    bin: Optional(Object),
    repository: Optional({
        type: String,
        url: String
    })
}

validateRc(rules, require('./package.js'))

```

## `validateRc(rules: object, rc: object): boolean | never`

Takes two objects, `rules` and `rc`. `rules` is the object that holds the rules, `rc` is the object that needs to be validated.  

### Syntax

The `rules`' syntax is made of constructors and branches.

Example:

```js
const rules = {
    // only matches numbers
    num: Number,
    // only matches strings
    str: String,
    // only matches booleans
    bool: Boolean
    // this is valid for all primitives, promises, buffers etc cannot be used
    branch: {
        // other constructors
    }
}
```

## `Optional`

`Optional` is a function that accepts a constructor or branch. If in the config file the key associated with `Optional` isn't present, it does not throw. But, if that key is present and it violates the rule that is specified in `Optional`, throws.

Example

```ts
import validateRc, { Optional } from 'validate-rc'

const rules = { 
    age: Optional(Number),
    otherInfo: Optional({
        hobbies: Array,
        height: Number,
        name: String
    })
}

validateRc(rules, {})  // does not throw, because `age` and `otherInfo` are optional
validateRc(rules, { age: 24 }) // does not throw, because `otherInfo` is optional
validateRc(rules, {  // does not throw, because `otherInfo`'s rules are not violated
    otherInfo: {
        hobbies: [ 'Programming' ],
        height: 179,
        name: 'Michael'
    }
})
validateRc(rules, {  // throws, because `age` is a string
    age: 'string'
})
validateRc(rules, {  // throws, because `otherInfo`'s rules are violated
    otherInfo: {}
})
validateRc(rules, {  // throws, because otherInfo is a boolean and not an object
    otherInfo: false
})

```

## `Choice`

`Choice` is a function that takes multiple arguments as choices, throws when the value in the config isn't present in `Choice`.

Example

```ts
import validateRc, { Optional, Choice } from 'validate-rc'

const rule = { esVersion: Optional(Choice('es5', 'es6', 'es2015', 'esnext')) }

validateRc(rule, {}) // does not throw, because its optional
validateRc(rule, { esVersion: 'es6' }) // does not throw, because 'es6' is in `Choice`
validateRc(rule, { esVersion: 'es2017' }) // throws, because 'es2017' isn't in `Choice`

```

## Handling Errors

`validateRc` throws a `ValidationError` when the config doesn't match the rules. It contains what it expected and what it got.

Handling example

```ts
import validateRc from 'validate-rc'
import chalk from 'chalk'

const rules = { /* rules */ }
const config = require(process.cwd() + '/.dummyrc.js')

try {
    validateRc(rules, config)
} catch (e) {
    // check if is ValidationError
    if(e.VALIDATION_ERROR) {
        console.log(chalk.redBright(`Expected type '${chalk.whiteBright(e.expected)}', got '${chalk.whiteBright(e.got)}'.`))
        process.exit(1)
    }
    throw e
}

```