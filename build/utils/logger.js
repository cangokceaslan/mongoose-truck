"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = void 0;
const isEnabled = true;
const log = isEnabled ? console.log : args => {};
exports.log = log;