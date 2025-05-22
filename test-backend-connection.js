const axios = require('axios');

async function testBackendConnection() {
  try {
    // Simple GraphQL query to test the connection
    const query = `
      query TestConnection {
        __schema {
          queryType {
            name
          }
        }
      }
    `;

    const response = await axios.post('http://localhost:3001/graphql', {
      query
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = response.data;
    console.log('Backend connection test result:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return false;
    }
    
    if (data.data && data.data.__schema) {
      console.log('Successfully connected to the backend GraphQL API!');
      return true;
    }
    
    console.error('Unexpected response format:', data);
    return false;
  } catch (error) {
    console.error('Error connecting to backend:', error);
    return false;
  }
}

testBackendConnection()
  .then(success => {
    console.log(`Connection test ${success ? 'passed' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
