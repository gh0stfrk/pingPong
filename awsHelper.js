const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
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
      const hostname = "cluster0.euzvpx0.mongodb.net";
      const database = "pingPongLambdaLogs";

      return {
        username,
        password,
        hostname,
        database
      };
    } catch (error) {
      console.error('Error fetching credentials from SSM:', error);
      throw error;
    }
  }

  
module.exports = {
    getCredentials
}