"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
const tslib_1 = require("tslib");
const ejs = (0, tslib_1.__importStar)(require("ejs"));
function render(content, data) {
    return ejs.render(content, data);
}
exports.render = render;
