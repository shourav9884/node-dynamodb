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

function update_user(user) {
  var paramsToUpdate = {
    TableName: 'UserTable',
    Key:{
      "email": user['email'],
      "registration_date": user['registration_date']
    },
    UpdateExpression: "set balance = :balance, user_name=:name, queries=:queries, active=:active, credit=:credit",
    ExpressionAttributeValues:{
        ":credit": user['credit'],
        ":balance": user['balance'],
        ":name": user['user_name'],
        ":active": user['active'],
        ":queries": user['queries']
    },
    ReturnValues:"UPDATED_NEW"
  }
  docClient.update(paramsToUpdate, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        return false
    } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        return true
    }
  });
}


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

app.get('/users/:email/payment-fields', (req, res) => {
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
        if(data['Items'].length == 0) {
          res.status(404).send({"msg": "User not found"})
        } else {
          var body = {
            "credit": data['Items'][0]['credit'],
            "balance": data['Items'][0]['balance'],
            "queries": data['Items'][0]['queries'],
          }
          res.send(body)
        }
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

app.put('/users/:email/activate', (req, res) => {

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
        if(data['Items'].length == 0) {
          res.status(404).send({"msg": "User Not Found"})
        } else {
          var user = data['Items'][0]
          user['active'] = 1
          var result = update_user(user)
          console.log(result)
          res.send({"msg": "Activated successfully"})
          // else res.send({"msg": "Something went wrong"})
        }
    }
  });
})

app.put('/users/:email/deactivate', (req, res) => {

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
        if(data['Items'].length == 0) {
          res.status(404).send({"msg": "User Not Found"})
        } else {
          var user = data['Items'][0]
          user['active'] = 0
          var result = update_user(user)
          console.log(result)
          res.send({"msg": "Deactivated successfully"})
          // else res.send({"msg": "Something went wrong"})
        }
    }
  });
})

app.put('/users/:email/payment-fields/by-admin', (req, res) => {

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
        if(data['Items'].length == 0) {
          res.status(404).send({"msg": "User Not Found"})
        } else {
          var user = data['Items'][0]
          user['credit'] = req.body['credit']
          user['balance'] = req.body['balance']
          var result = update_user(user)
          console.log(result)
          res.send({"msg": "Updated successfully"})
          // else res.send({"msg": "Something went wrong"})
        }
    }
  });
})

app.put('/users/:email/payment-fields/by-user', (req, res) => {

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
        if(data['Items'].length == 0) {
          res.status(404).send({"msg": "User Not Found"})
        } else {
          var user = data['Items'][0]
          if(user['queries'] == 0){
            res.status(412).send({"msg": "you cannot change your payment info"})
          } else {
            user['credit'] = req.body['credit']
            user['balance'] = req.body['balance']
            user['queries'] -= 1
            var result = update_user(user)
            console.log(result)
            res.send({"msg": "Updated successfully"})
          }
          // else res.send({"msg": "Something went wrong"})
        }
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