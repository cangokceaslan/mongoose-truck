"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PersonSchema = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Schema = _mongoose.default.Schema;
const PersonSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  }
}, {
  collection: 'users',
  timestamps: true
});
exports.PersonSchema = PersonSchema;

const Person = _mongoose.default.model('Person', PersonSchema);
/* 

Person.exampleData = {
    name: 'John',
    surname: 'Doe',
    age: 25
} 

*/


var _default = Person;
exports.default = _default;