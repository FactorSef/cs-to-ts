export interface IConfig {
    /**
     * `true` for camelCase.
     * 
     * `false` for preserving original name
     * 
     * @default true
     */
    propertiesToCamelCase?: boolean;
    /**
     * Removes specified postfixes from
     * property names, types & class names.
     * 
     * @description case-sensitive
     * @default []
     */
    trimPostfixes?: string | Array<string>;
    /**
     * Whether or not trim postfixes recursive. 
     * 
     * @description
     * e.g. with postfixes 'A' & 'B'
     * PersonAAB will become PersonAA
     * when it's `false` and Person when it's `true`
     * 
     * @default true
     */
    recursiveTrimPostfixes?: boolean;
    /**
     * When `true` to initializers will be ignored
     * 
     * @default true
     */
    ignoreInitializer?: boolean;
    /**
     * `true` to remove method bodies
     * 
     * `false` to preserve the body as-is
     * 
     * @default false
     */
    removeMethodBodies?: boolean;
    /**
     * `true` to remove class constructors
     * 
     * `false` to treat then like any other method
     * 
     * @default true
     */
    removeConstructors?: boolean;
    /**
     * `signature` to emit a method signature.
     * 
     * `lambda` to emit a lambda function.
     * 
     * `controller` to emit a lambda to call an async controller
     * 
     * @default 'signature'
     */
    methodStyle?: 'signature' | 'lambda' | 'controller';
    /**
     * `true` to convert C# byte array type to Typescript string
     * 
     * @description defaults to `true` since the serialization of C# `byte[]` results in a string
     * 
     * @default true
     */
    byteArrayToString?: boolean;
    /**
     * Convert C# types `DateTime` and `DateTimeOffset` to selected types
     * 
     * @default 'Date | string'
     */
    dateTypes?: Array<string> | string;
    /**
     * Remove fields or properties with the given modifiers. 
     * 
     * @description Ex. if you want to remove private and internal members set to `['private', 'internal']`
     * 
     * @default []
     */
    removeWithModifier?: Array<string>;
    /**
     * If setted, any property or field that its name matches the given regex will be removed
     */
    removeNameRegex?: string;
    /**
     * `true` to convert classes to interfaces
     * 
     * `false` to convert classes to classes
     * 
     * @default true
     */
    classToInterface?: boolean;
    /**
     * `true` to preserve fields and property modifiers
     * 
     * @default false
     */
    preserveModifiers?: boolean;
    /**
     * @default 8
     */
    maxBodyDepth?: number;
    /**
     * @default 4
     */
    maxExpressionDepth?: number;
}

export function getConfig(config?: IConfig): IConfig {
    return {
        propertiesToCamelCase: true,
        trimPostfixes: [],
        recursiveTrimPostfixes: true,
        ignoreInitializer: true,
        removeMethodBodies: false,
        removeConstructors: true,
        methodStyle: 'signature',
        byteArrayToString: true,
        dateTypes: 'Date | string',
        removeWithModifier: [],
        removeNameRegex:'',
        classToInterface: true,
        preserveModifiers: false,
        maxBodyDepth: 8,
        maxExpressionDepth: 4,
        ...config,
    }
}