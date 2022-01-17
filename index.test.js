const MongooseTruck = require('./index.js');
const connection = require('./build/connection.json');
const { Person } = require('./build/tests/db/Schemas');

//console.log(connection);

async function test() {
    const conn1 = await MongooseTruck.connect(connection.production),
        conn2 = await MongooseTruck.connect(connection.development),
        conn3 = await MongooseTruck.connect(connection.test);

    const parsedData1 = await MongooseTruck.create(conn1, [conn2, conn3]).loadFrom({
        model: 'Person',
        schema: Person,
        query: {
            name: "John"
        },
        populate: {
            path: '_id'
        },
        skip: 1,
        sort: {
            _id: -1
        },
        select: "_id name surname age",
        concurrent: 1,
        limit: 20
    }).emptyTo({
        model: 'Person1',
        schema: Person
    }).start()
    console.log(parsedData1);

    const parsedData2 = await MongooseTruck.create(conn1, [conn2, conn3]).loadFrom([
        {
            model: 'Person',
            schema: Person,
            query: {
                name: "John"
            },
            populate: {
                path: '_id'
            },
            skip: 0,
            sort: {
                _id: -1
            },
            select: "_id name surname age",
            concurrent: 1,
            limit: 3
        },
        {
            model: 'Person',
            schema: Person,
            query: {
                name: "John"
            },
            populate: {
                path: '_id'
            },
            skip: 3,
            sort: {
                _id: -1
            },
            select: "_id name surname age",
            concurrent: 1,
            limit: 3
        }
    ]).emptyTo({
        model: 'PersonsTests',
        schema: Person
    }).start()
    console.log(parsedData2);
}

test();

//module.exports = MongooseTruck;