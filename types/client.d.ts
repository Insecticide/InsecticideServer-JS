import RawClient from './raw-client';
import * as Response from './response';
export interface Breakpoint {
    path: string;
    line: number;
}
export default class InsecticideClient extends RawClient {
    init(): Promise<Response.InitResponse>;
    stepIn(): Promise<Response.StandardResponse | Response.FailureResponse>;
    stepOut(): Promise<Response.StandardResponse | Response.FailureResponse>;
    stepOver(): Promise<Response.StandardResponse | Response.FailureResponse>;
    stop(): Promise<Response.StandardResponse | Response.FailureResponse>;
    pause(): Promise<Response.StandardResponse | Response.FailureResponse>;
    play(): Promise<Response.StandardResponse | Response.FailureResponse>;
    getVariables(level: number): Promise<Response.FailureResponse | Response.VariablesResponse>;
    getStack(): Promise<Response.FailureResponse | Response.StackResponse>;
    addBreakpoint(breakpoint: Breakpoint): Promise<Response.StandardResponse | Response.FailureResponse>;
    removeBreakpoint(breakpoint: Breakpoint): Promise<Response.StandardResponse | Response.FailureResponse>;
}
