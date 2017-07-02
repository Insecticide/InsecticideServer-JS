"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const regs = {
    reference: /(.+?)`(.*?)`/g,
    keyValue: /(.+?)@(.*?)=(.+?)@(.*?),/g
};
const knownTypes = new Map()
    .set('C', 'Coroutine')
    .set('F', 'Function')
    .set('U', 'Undefined')
    .set('T', 'Table')
    .set('M', 'Metatable')
    .set('B', 'Boolean')
    .set('N', 'Number');
// Format the type and representation into an object
const getRepresentation = (typ, val) => {
    let type;
    let data;
    let reference;
    if (typ in knownTypes) {
        type = knownTypes.get(typ);
    }
    else {
        type = utils_1.unescape(typ);
    }
    if (val[0] === '!') {
        data = utils_1.unescape(val.slice(1));
        reference = true;
    }
    else {
        data = utils_1.unescape(val);
        reference = false;
    }
    return {
        type,
        data,
        reference
    };
};
// Split key-value pairs
const getKeyValuePairs = (str) => {
    const list = [];
    let result = regs.keyValue.exec(str);
    while (result !== null) {
        const key = getRepresentation(result[1], result[2]);
        const value = getRepresentation(result[3], result[4]);
        list.push({
            key,
            value
        });
        result = regs.keyValue.exec(str);
    }
    return list;
};
// Deserialize variables from string
exports.variables = (str = '') => {
    const references = new Map();
    const scopes = [];
    let result = regs.reference.exec(str);
    while (result !== null) {
        const vars = getKeyValuePairs(result[2]);
        if (result[1][0] === '!') {
            const name = result[1].slice(1);
            references.set(name, vars);
            scopes.push(name);
        }
        else {
            references.set(result[1], vars);
        }
        result = regs.reference.exec(str);
    }
    return {
        references,
        scopes
    };
};
const pathLineFunction = /(.+?)@(.+?)=(.+?)/g;
// Deserialize stack from string
exports.stack = (str = '') => {
    const list = [];
    str.split(',').forEach(scope => {
        const result = pathLineFunction.exec(scope);
        if (result) {
            list.push({
                path: result[1],
                line: parseInt(result[2], 10),
                function: result[3]
            });
        }
    });
    return list;
};
//# sourceMappingURL=deserialize.js.map