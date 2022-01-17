# mongoose-truck 🚚

mongoose-truck is a Node.js package for handling with data transaction between different MongoDb clusters.

### Terms
- Source connection is the main database which will provide us data basically
- Destination connections are the databases in which we are going to insert the data

### Definitions
#### .create(conn1,[conn2,conn3])
- conn1 - source connection
- conn2 - destination connection
- conn3 - destination connection

#### .loadFrom() object:
```javascript
model       // preferred model name
schema      // Schema for the collection - reading the data
query:      // Query for searching over the collection
populate:   // Relation with other collections - Same with .populate() method
skip:       // skipping N values in the collection - same with .skip() method
sort:       // sorting - same with .sort() method
select:     // selecting keys - same with .select()
concurrent: // concurrent adjusts the pagination fetching constant
limit:      // total data will be fetched - same with .limit() method
```
#### .emptyTo() object:
```javascript
model       // preferred model name
schema      // Schema for the collection to load the data
```
#### .start() object:
```javascript
parse: //if true this will return the datas added into cluster and if false returns empty array
```
### Installation

Use the package manager [npm](https://www.npmjs.org/) to install mongoose-truck.

```bash
npm i mongoose-truck
```

# How to use

```javascript 
const MongooseTruck = require("mongoose-truck")
```
### Managing the Connections 

```javascript
const conn1 = await MongooseTruck.connect("database_connection_string"),
        conn2 = await MongooseTruck.connect("database_connection_string"),
        conn3 = await MongooseTruck.connect("database_connection_string");
```

### Reading from one collection Schema with one configuration.

```javascript
const parsedData = await MongooseTruck.create(conn1, [conn2, conn3]).loadFrom({
    model: 'People',
    schema: PeopleSchema,
    query: {
        name: "John"
    },
    populate: {
        path: 'stars'
    },
    skip: 0,
    sort: {
        _id: -1
    },
    select: "_id name surname age",
    concurrent: 20,
    limit: 100
}).emptyTo({
    model: 'People',
    schema: PeopleSchema
}).start({
    parse: true
})

console.log(parsedData);
```
### Reading from array of collections and Schemas with different configurations.
```javascript
const parsedData = await MongooseTruck.create(conn1, [conn2, conn3]).loadFrom([{
        model: 'People',
        schema: PeopleSchema,
        query: {
            name: "John"
        },
        skip: 0,
        sort: {
            _id: -1
        },
        concurrent: 5,
        limit: 10
    },
    {
        model: 'People',
        schema: PeopleSchema,
        query: {
            name: "Adam"
        },
        populate: {
            path: 'stars'
        },
        skip: 1,
        sort: {
            _id: -1
        },
        select: "_id name surname age",
        concurrent: 3,
        limit: 20
    }
]).emptyTo({
    model: 'PersonsTests',
    schema: Person
}).start({
    parse: true
})
console.log(parsedData);
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)