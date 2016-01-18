# js-props - JavaScript Property validation
Lorem ipsum ...

## Getting Started

## Example

```
import Props from 'js-props';

const validator = Props.object({
    name: Props.string(),
    age: Props.number(),
    phone: Props.string().isOptional(),
    country: Props.oneOf([ 'Austria', 'Germany', 'Switzerland' ]).withDefault('Germany')
  });

validator.validate({
    name: 'Egon',
    age: 12
  });
// => true

validator.validate({
    name: 'Egon'
  });
// => Will throw exception due to missing age

validator.validateValue({
    name: 'Egon',
    age: 'twelve'
  });
// => false due to wrong type for age

validator.valueOrDefault({
    name: 'Egon',
  });
// => { name: 'Egon', country: 'Germany' }
```

## Types

### Any

```
Props.any([ ofType: Function | Array [, isOptional: boolean = false [, defaultValue: Any ]]])
```

Checks for any type. If `ofType` is a function it will be used to validate the value. E.g.:

```
const validator = Props.any((value) => value > 10);
validator.validateValue(13) === true;
validator.validateValue(9) === false;
```

If `ofType` is an array of `Type` the value will be checked if it is one of the given types. E.g.:

```
const validator = Props.any([ Props.number(), Props.string() ]);
validator.validateValue(12) === true;
validator.validateValue(twelve) === true;
validator.validateValue([ 12 ]) === false;
```

### Array

```
Props.array([ ofType: Type [, isOptional: boolean = false [, defaultValue: Array ]]])
```

Checks for arrays. `ofType` can be defined as Type. E.g.:

```
const validator = Props.array(Props.string());
validator.validateValue([ "a", "b", "c" ]) === true;
validator.validateValue([ 1, 2, 3]) === false;
```

### Boolean

```
Props.bool([ isOptional: boolean = false [, defaultValue: boolean ]])
```

Checks for boolean.

### Enumeration

```
Props.oneOf(values: Array [, isOptional: boolean = false [, defaultValue: Any ]])
```

Checks for a set of defined values. E.g.:

```
const validator = Props.oneOf([ 1, 'A', 2 ]);
validator.validateValue(1) === true;
validator.validateValue('B') === false;
```

### Function

```
Props.func([ isOptional: boolean = false [, defaultValue: Function ]])
```

Checks for functions.

### Number

```
Props.number([ isOptional: boolean = false [, defaultValue: Number ]])
```

Checks for numbers.

### Object

```
TODO
Props.number([ isOptional: boolean = false [, defaultValue: Object ]])
```

Checks for objects.

### String

```
Props.string([ isOptional: boolean = false [, defaultValue: String ]])
```

Checks for strings.
