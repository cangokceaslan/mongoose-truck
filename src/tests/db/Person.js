import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export const PersonSchema = new Schema({
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

const Person = mongoose.model('Person', PersonSchema);

/* 

Person.exampleData = {
    name: 'John',
    surname: 'Doe',
    age: 25
} 

*/

export default Person;
