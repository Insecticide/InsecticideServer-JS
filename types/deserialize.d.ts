export interface KeyValuePair {
    readonly key: Representation;
    readonly value: Representation;
}
export interface Representation {
    readonly type: string;
    readonly data: string;
    readonly reference: boolean;
}
export declare type Variables = {
    references: Map<string, ReadonlyArray<KeyValuePair>>;
    scopes: ReadonlyArray<string>;
};
export declare type Stack = ReadonlyArray<Scope>;
export interface Scope {
    path: string;
    function: string;
    line: number;
}
export declare const variables: (str?: string) => Variables;
export declare const stack: (str?: string) => ReadonlyArray<Scope>;
