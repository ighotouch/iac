var AWS = require("aws-sdk");
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const docClient = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event) => {
  const p = JSON.parse(event.body);
  var params = {
    TableName: "JakeUsers"
  };
  
  try {
    const data = await docClient.scan(params).promise()
    const result = data.Items.find(d=> d.ID === p.bucket)
    return { statusCode: 200, body: JSON.stringify(result) }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify(err) }
  }
};
