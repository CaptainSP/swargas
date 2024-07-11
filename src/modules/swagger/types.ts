export interface ParameterOptions {
    isMongoId?: boolean;
    isUUID?: boolean;
    isOptional?: boolean;
    isEnum?: boolean;
    enum?: any;
    isArray?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    isDate?: boolean;
    isBoolean?: boolean;
    isNumber?: boolean;
    isString?: boolean;
    isObject?: boolean;
    schema?: any;
}