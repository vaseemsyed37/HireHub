const { MongoClient } = require('mongodb');

async function insertMessage(db, message) {
  const collection = db.collection('messages');
  return await collection.insertOne(message);
}

module.exports = { insertMessage };
