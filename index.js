const express = require('express')
const app = express()
app.use(express.json())
const port = 3000

var AWS = require("aws-sdk");
AWS.config.update({
  region: "ap-southeast-1"
});
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();


app.get('/users', (req, res) => {
  docClient.scan({TableName: "UserTable"}, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        res.status(500).send(err)
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        res.send(data['Items'])
    }
  });
})

app.get('/users/:email', (req, res) => {
  var params = {
    TableName: "UserTable",
    KeyConditionExpression: "#email = :email",
    ExpressionAttributeNames:{
        "#email": "email"
    },
    ExpressionAttributeValues: {
        ":email": req.params.email
    }
  }
  docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        res.status(500).send(err)
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        res.send(data['Items'][0])
    }
  });
})

app.post('/users', (req, res) => {
  var params = {
    TableName: "UserTable",
    Item: req.body
  };
  docClient.put(params, function(err, data) {
     if (err) {
         console.error("Unable to add user", req.body.name, ". Error JSON:", JSON.stringify(err, null, 2));
         res.send(err)
     } else {
         res.status(201).send(req.body)
     }
  });
  // console.log(req.body)
  // res.send(req.body)
})

app.put('/users/:email', (req, res) => {

  var params = {
    TableName: "UserTable",
    KeyConditionExpression: "#email = :email",
    ExpressionAttributeNames:{
        "#email": "email"
    },
    ExpressionAttributeValues: {
        ":email": req.params.email
    }
  }
  docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        res.status(500).send(err)
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        var user = data['Items'][0]
        var paramsToUpdate = {
          TableName: 'UserTable',
          Key:{
            "email": user['email'],
            "registration_date": user['registration_date']
          },
          UpdateExpression: "set balance = :balance, user_name=:name, queries=:queries, is_active=:is_active, credit=:credit",
          ExpressionAttributeValues:{
              ":credit": req.body['credit'],
              ":balance": req.body['balance'],
              ":name": req.body['name'],
              ":is_active": req.body['is_active'],
              ":queries": req.body['queries']
          },
          ReturnValues:"UPDATED_NEW"
        }
        docClient.update(paramsToUpdate, function(err, data) {
          if (err) {
              console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
              res.status(500).send(err);
          } else {
              console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
              res.send({"msg": "Updated successfully"})
          }
        });
    }
  });
})

app.delete('/users/:email', (req, res) => {

  var params = {
    TableName: "UserTable",
    KeyConditionExpression: "#email = :email",
    ExpressionAttributeNames:{
        "#email": "email"
    },
    ExpressionAttributeValues: {
        ":email": req.params.email
    }
  }
  docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        res.status(500).send(err)
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        var user = data['Items'][0]
        var paramsToDelete = {
          TableName: 'UserTable',
          Key:{
            "email": user['email'],
            "registration_date": user['registration_date']
          }
          
        }
        docClient.delete(paramsToDelete, function(err, data) {
          if (err) {
              console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
              res.status(500).send(err);
          } else {
              console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
              res.send({"msg": "Deleted successfully"})
          }
        });
    }
  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})