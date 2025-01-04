const { MongoClient } = require('mongodb');
const { getCredentials } = require('./awsHelper.js')

async function writeDataToMongo(jsonData) {
  let client
  try {
    const credentials = await getCredentials();
    const uri = `mongodb+srv://${credentials.username}:${credentials.password}@${credentials.hostname}`;

    client = new MongoClient(uri);
    await client.connect();
    const database = client.db(credentials.database);
    const collection = database.collection('ping_pong_logs');

    const result = await collection.insertOne(jsonData);
    console.log(`Document inserted with ID: ${result.insertedId}`);
    return {
      status: "Inserted Data",
      data: result
    }

  } catch (error) {
    console.error('Error writing data to MongoDB:', error);
    throw error
  } finally {
    await client.close();
  }
}


module.exports = {
  writeDataToMongo
}