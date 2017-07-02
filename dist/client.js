"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const raw_client_1 = require("./raw-client");
const Response = require("./response");
const utils_1 = require("./utils");
class InsecticideClient extends raw_client_1.default {
    // For documentation on each command refer to github.com/Insecticide/Protocol
    init() {
        const self = this;
        const prom = this.request('INIT\n')
            .then(Response.init)
            .then((res) => {
            if (res.type === Response.Types.FAILURE) {
                self.close(); // Failed to initialize
                throw res.error;
            }
            else {
                self.id = res.id;
                return res;
            }
        });
        return prom;
    }
    stepIn() {
        return this.request('STEPIN\n')
            .then(Response.standard);
    }
    stepOut() {
        return this.request('STEPOUT\n')
            .then(Response.standard);
    }
    stepOver() {
        return this.request('STEPOVER\n')
            .then(Response.standard);
    }
    stop() {
        return this.request('STOP\n')
            .then(Response.standard);
    }
    pause() {
        return this.request('PAUSE\n')
            .then(Response.standard);
    }
    play() {
        return this.request('PLAY\n')
            .then(Response.standard);
    }
    getVariables(level) {
        // Make it an integer value
        level = Math.floor(level);
        if (isNaN(level) || !isFinite(level)) {
            level = 1; // Default is current scope
        }
        return this.request(`GETVARIABLES;${level}\n`)
            .then(Response.variables);
    }
    getStack() {
        return this.request('GETSTACK\n')
            .then(Response.stack);
    }
    addBreakpoint(breakpoint) {
        const path = utils_1.escape(breakpoint.path);
        return this.request(`ADDBREAKPOINT;${path};${breakpoint.line}\n`)
            .then(Response.standard);
    }
    removeBreakpoint(breakpoint) {
        const path = utils_1.escape(breakpoint.path);
        return this.request(`REMOVEBREAKPOINT;${path};${breakpoint.line}\n`)
            .then(Response.standard);
    }
}
exports.default = InsecticideClient;
//# sourceMappingURL=client.js.map