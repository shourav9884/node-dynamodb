var AWS = require("aws-sdk");
AWS.config.update({
  region: "ap-southeast-1"
});
var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "UserTable",
    KeySchema: [       
        { AttributeName: "email", KeyType: "HASH"},  //Partition key
        { AttributeName: "registration_date", KeyType: "RANGE" }  //Sort key
    ],
    AttributeDefinitions: [       
        { AttributeName: "email", AttributeType: "S" },
        { AttributeName: "registration_date", AttributeType: "S" }
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});