import InsecticideClient from './client';
export interface ConnectedClient {
    client: InsecticideClient;
    path: string;
}
export default class InsecticideServer {
    private server?;
    private clients;
    private pendingClients;
    constructor(port: number);
    getClient(id: string): Promise<ConnectedClient>;
    getClientsIDs(): ReadonlyArray<string>;
    close(): Promise<{}>;
}
