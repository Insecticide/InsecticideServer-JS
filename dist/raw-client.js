"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RawClient {
    constructor(client, remove) {
        this.pending = [];
        this.waiting = false;
        this.doNotEnd = false;
        this.incompleteResponse = '';
        this.client = client;
        this.remove = remove;
        client.setEncoding('utf8');
        client.on('data', (buf) => {
            const response = this.incompleteResponse + buf;
            if (!response.indexOf('\n')) {
                this.incompleteResponse = response;
            }
            else {
                this.resolveCurrent(response.split('\n')[0]);
                this.incompleteResponse = '';
            }
        });
        client.on('error', (err) => this.rejectCurrent(err.message)
        // Here we could set waiting to false and call doSend()
        // But the 'close' event will probably be fired right after 'error'
        );
        client.on('close', () => {
            // No need to send FIN packet
            this.doNotEnd = true;
            this.close();
        });
    }
    get pendingRequests() {
        return this.pending.length;
    }
    get isWaiting() {
        return this.waiting;
    }
    get isOpen() {
        return this.client !== undefined;
    }
    request(message) {
        if (this.client === undefined) {
            return Promise.reject(new Error('Closed Client'));
        }
        return new Promise((resolve, reject) => {
            this.pending.push({
                resolve,
                reject,
                message
            });
            this.send();
        });
    }
    clearPending(reason) {
        this.pending.forEach(obj => obj.reject(new Error(reason || 'Cleared pending requests')));
        this.pending = [];
    }
    close() {
        if (this.client) {
            // Reject all the requests
            this.clearPending('Closed Client');
            this.rejectCurrent('Closed Client');
            // Send FIN packet if needed
            if (!this.doNotEnd) {
                this.client.end();
            }
            // Destroy the client object entirely
            this.client.unref();
            this.client = undefined;
            if (this.id) {
                this.remove(this.id);
            }
        }
    }
    rejectCurrent(reason) {
        if (this.current) {
            this.current.reject(new Error(reason || 'Forcefully rejected'));
            this.current = undefined;
            // Note here, even though current is null waiting is still true
            // This shouldn't be a problem
        }
    }
    resolveCurrent(response) {
        if (this.current) {
            this.current.resolve(response);
            this.current = undefined;
            this.waiting = false;
            this.send();
        }
    }
    send() {
        if (!this.waiting) {
            this.current = this.pending.shift();
            if (this.current && this.client) {
                this.client.write(this.current.message);
                this.waiting = true;
            }
        }
    }
}
exports.default = RawClient;
//# sourceMappingURL=raw-client.js.map