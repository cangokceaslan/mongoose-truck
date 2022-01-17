"use strict";

connection('mongodb://localhost:27017/test').then(() => {
  console.log('Connected to MongoDB');
});