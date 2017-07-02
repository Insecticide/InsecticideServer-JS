"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regs = {
    escape: /([@`=,!$;]|[^\40-\176])/gm,
    unescape: /\$([\dabcde]{2})/gi
};
// Unescape characters
const tochar = (_, num) => String.fromCharCode(parseInt(num, 16));
exports.unescape = (str) => str.replace(regs.unescape, tochar);
const tocode = (char) => '$' + char.charCodeAt(0).toString(16).toUpperCase();
// Escape characters
exports.escape = (str) => str.replace(regs.escape, tocode);
//# sourceMappingURL=utils.js.map