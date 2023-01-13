var AWS = require("aws-sdk");
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
exports.handler = async (event) => {
  var params = {
    TableName: "JakeUsers",
    Item: {
      ID: { S: event.id },
      Username: { S: event.detail.requestParameters.key },
    },
  };

  return await new Promise((resolve, reject) => {
    ddb.putItem(params, (error, data) => {
      if (error) {
        console.log(`createChatMessage ERROR=${error.stack}`);
        resolve({
          statusCode: 400,
          error: `Could not create message: ${error.stack}`,
        });
      } else {
        console.log(`createChatMessage data=${JSON.stringify(data)}`);
        resolve({ statusCode: 200, body: JSON.stringify(params.Item) });
      }
    });
  });
};
