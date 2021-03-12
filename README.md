# cs-to-ts

[![License: MIT][license-image]][licanse-url]
[![CI status][github-action-image]][github-action-url]
[![Package ver.][pkg-version-image]][pkg-url]

[github-action-image]: https://github.com/FactorSef/cs-to-ts/workflows/tests/badge.svg
[github-action-url]: https://github.com/FactorSef/cs-to-ts/actions?query=workflow%253A%22tests%22
[license-image]: https://img.shields.io/npm/l/@factor-sef/cs-to-ts?color=green
[licanse-url]: https://github.com/FactorSef/cs-to-ts/blob/master/LICENSE
[pkg-version-image]: https://img.shields.io/npm/v/@factor-sef/cs-to-ts?label=varsion
[pkg-url]: https://www.npmjs.com/package/@factor-sef/cs-to-ts

It is a simple package for converting a C# class to typescript, where the user can flexibly customize the library to get the desired result.

this package was inspired by [@YuvrajSagarRana/csharp-to-typescript](https://github.com/YuvrajSagarRana/csharp-to-typescript) solution.

## Installation

```bash
npm i @factor-sef/cs-to-ts
```

## Usage

1. After installation, you must import this package:

```JavaScript
import Parser from '@factor-sef/cs-to-ts';
// or
const Parser = require('@factor-sef/cs-to-ts');
```

2. Next, you must create a new parser class:

```JavaScript
const parser = new Parser(config)
```

> You can view this config options [here](#config)

3. In the end, you can pass any C # class in string format to the conversion method:

```JavaScript
const codeForParse = `public class Address {
    public int Id { get; set; }
    public string Street { get; set; }
    public string City { get; set; }
}`

const output = parser.parse(codeForParse);
```

### Output:

```TypeScript
export class Address
{
    Id: number;
    Street: string;
    City: string;
}
```

## <a name="config"></a> Configuration

| param                  | type                                      | default            | description                                                                                                                                           |
| ---------------------- | ----------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| propertiesToCamelCase  | `boolean`                                 | `true`             | transform properties names to camelCase                                                                                                               |
| trimPostfixes          | `string \| string[]`                      | `[]`               | Removes specified postfixes from property names, types & class names.                                                                                 |
| recursiveTrimPostfixes | `boolean`                                 | `true`             | Whether or not trim postfixes recursive. (e.g. with postfixes 'A' & 'B' PersonAAB will become PersonAA when it's `false` and Person when it's `true`) |
| ignoreInitializer      | `boolean`                                 | `true`             | When `true` to initializers will be ignored                                                                                                           |
| removeMethodBodies     | `boolean`                                 | `false`            | If `true` then method bodies will be removed, else preserve the method body as-is                                                                     |
| removeConstructors     | `boolean`                                 | `true`             | When `true` to removing class constructor                                                                                                             |
| methodStyle            | `'signature' \| 'lambda' \| 'controller'` | `'signature'`      | `'signature'` to emit a method signature. `'lambda'` to emit a lambda function. `'controller'` to emit a lambda to call an async controller.          |
| byteArrayToString      | `boolean`                                 | `true`             | `true` to convert C# byte array type to Typescript string                                                                                             |
| dateTypes              | `string \| string[]`                      | `'Date \| string'` | Convert C# types `DateTime` and `DateTimeOffset` to selected types                                                                                    |
| removeWithModifier     | `string[]`                                | `[]`               | Remove fields or properties with the given modifiers (Ex. if you want to remove private and internal members set to `['private', 'internal']`)        |
| removeNameRegex        | `string`                                  | `null`             | If setted, any property or field that its name matches the given regex will be removed                                                                |
| classToInterface       | `boolean`                                 | `true`             | When `true` to classes will be converted to interfaces                                                                                                |
| preserveModifiers      | `boolean`                                 | `false`            | `true` to preserve fields and property modifiers                                                                                                      |
| maxBodyDepth           | `number`                                  | 8                  | Maximum body depth                                                                                                                                    |
| maxExpressionDepth     | `number`                                  | 4                  | Maximum expression depth                                                                                                                              |
