/// <reference types="node" />
import * as net from 'net';
export default class RawClient {
    protected id?: string;
    private pending;
    private waiting;
    private current?;
    private doNotEnd;
    private incompleteResponse;
    private client?;
    private remove;
    constructor(client: net.Socket, remove: (id: string) => void);
    readonly pendingRequests: number;
    readonly isWaiting: boolean;
    readonly isOpen: boolean;
    request(message: string): Promise<string>;
    clearPending(reason: string): void;
    close(): void;
    private rejectCurrent(reason);
    private resolveCurrent(response);
    private send();
}
