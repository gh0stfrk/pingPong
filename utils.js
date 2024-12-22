const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const { MongoClient } = require('mongodb');

const ssmClient = new SSMClient({});

async function getCredentials() {
  try {
    const usernameParams = {
      Name: 'mongodb_username',
      WithDecryption: true,
    };
    const usernameResponse = await ssmClient.send(new GetParameterCommand(usernameParams));
    const username = usernameResponse.Parameter.Value;

    const passwordParams = {
      Name: 'mongodb_password',
      WithDecryption: true,
    };
    const passwordResponse = await ssmClient.send(new GetParameterCommand(passwordParams));
    const password = passwordResponse.Parameter.Value;

    return {
      username,
      password
    };
  } catch (error) {
    console.error('Error fetching credentials from SSM:', error);
    throw error;
  }
}

async function writeDataToMongo(jsonData) {
  try {
    const credentials = await getCredentials();
    const uri = `mongodb://${credentials.username}:${credentials.password}@${credentials.hostname}:${credentials.port}/${credentials.database}`;

    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db(credentials.database);
    const collection = database.collection('your_collection_name');

    const result = await collection.insertOne(jsonData);
    console.log(`Document inserted with ID: ${result.insertedId}`);

  } catch (error) {
    console.error('Error writing data to MongoDB:', error);
  } finally {
    await client.close();
  }
}


module.exports = {
    getCredentials,
    writeDataToMongo
}