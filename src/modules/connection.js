import mongoose from 'mongoose';
import * as Logs from '../utils/logger';
mongoose.Promise = Promise;

export const connect = (connectionStr) => new Promise((resolve, reject) => {
    const connection = mongoose.createConnection(connectionStr, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    connection.on('open', function () {
        //Logs.log(`Connection Started`);
        resolve(connection)
    });
}) 