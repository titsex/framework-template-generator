"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateRender = void 0;
const ejs_1 = require("ejs");
function templateRender(content, data) {
    return (0, ejs_1.render)(content, data);
}
exports.templateRender = templateRender;
