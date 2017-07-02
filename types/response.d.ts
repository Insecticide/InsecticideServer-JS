import * as Deserialize from './deserialize';
export declare enum Types {
    STANDARD = "Standard Response",
    FAILURE = "Failure Response",
    INIT = "Init Response",
    VARIABLES = "Variables Response",
    STACK = "Stack Response",
}
export interface BaseResponse {
    readonly type: Types;
    readonly values: ReadonlyArray<string>;
}
export interface StandardResponse extends BaseResponse {
    readonly type: Types.STANDARD;
}
export interface FailureResponse extends BaseResponse {
    readonly type: Types.FAILURE;
    readonly error: Error;
    readonly code: number;
}
export interface StackResponse extends BaseResponse {
    readonly type: Types.STACK;
    readonly stack: Deserialize.Stack;
}
export interface VariablesResponse extends BaseResponse {
    readonly type: Types.VARIABLES;
    readonly variables: Deserialize.Variables;
}
export interface InitResponse extends BaseResponse {
    readonly type: Types.INIT;
    readonly id: string;
    readonly path: string;
}
export declare const standard: (resp: string) => StandardResponse | FailureResponse;
export declare const init: (resp: string) => FailureResponse | InitResponse;
export declare const variables: (resp: string) => FailureResponse | VariablesResponse;
export declare const stack: (resp: string) => FailureResponse | StackResponse;
