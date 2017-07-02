"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Deserialize = require("./deserialize");
var Types;
(function (Types) {
    Types["STANDARD"] = "Standard Response";
    Types["FAILURE"] = "Failure Response";
    Types["INIT"] = "Init Response";
    Types["VARIABLES"] = "Variables Response";
    Types["STACK"] = "Stack Response";
})(Types = exports.Types || (exports.Types = {}));
exports.standard = (resp) => {
    const msg = resp.split(';');
    const msgType = msg.shift();
    if (msgType === 'OK') {
        return {
            type: Types.STANDARD,
            values: msg
        };
    }
    else if (msgType === 'ERR') {
        let code = msg.shift();
        return {
            type: Types.FAILURE,
            error: new Error(msg.shift() || 'Unknown error'),
            code: code ? parseInt(code, 10) : 0,
            values: msg
        };
    }
    else {
        return {
            type: Types.FAILURE,
            error: new Error('Unknown format: "' + resp + '"'),
            code: 0,
            values: msg
        };
    }
};
exports.init = (resp) => {
    const parsed = exports.standard(resp);
    if (parsed.type === Types.FAILURE) {
        return parsed;
    }
    else {
        const values = parsed.values;
        const id = values.shift();
        const path = values.shift();
        return {
            type: Types.INIT,
            id: id ? id : '',
            path: path ? path : '',
            values
        };
    }
};
exports.variables = (resp) => {
    const parsed = exports.standard(resp);
    if (parsed.type === Types.FAILURE) {
        return parsed;
    }
    else {
        const values = parsed.values;
        const variables = Deserialize.variables(values.shift());
        return {
            type: Types.VARIABLES,
            values,
            variables
        };
    }
};
exports.stack = (resp) => {
    const parsed = exports.standard(resp);
    if (parsed.type === Types.FAILURE) {
        return parsed;
    }
    else {
        const values = parsed.values;
        const stack = Deserialize.stack(values.shift());
        return {
            type: Types.STACK,
            values,
            stack
        };
    }
};
//# sourceMappingURL=response.js.map