const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const AWS_credentials = require('../config/AWS_Credentials.json');
const utils = require('./utils');
const sns = require('./sns');


AWS.config.update({
    accessKeyId: AWS_credentials.ACCESS_KEY,
    secretAccessKey: AWS_credentials.SECRET_ACCESS_KEY,
    sessionToken: AWS_credentials.SESSION_TOKEN,
    region: AWS_credentials.region
});


const docClient = new AWS.DynamoDB.DocumentClient()
const purchaseTable = 'Cloud-purchases';
const userTable = 'Cloud-users';


router.post('/', async (req, res) => {

    if (!req.body.productId) {
        return res.status(400).send("Request doesn't have productId");
    }

    if (!req.body.email) {
        return res.status(400).send("Request doesn't have email");
    }

    const email = req.body.email;
    const productId = req.body.productId;

    const user = await getUserSNSTopicArn(email);

    const purchase = {
        id: utils.getUniqueId('purchase'),
        productId: productId,
        email: email,
        time: utils.getCurrentTime()
    }

    const purchaseParams = {
        TableName: purchaseTable,
        Item: purchase
    };

    console.log("Creating a new purchase in DB");
    docClient.put(purchaseParams, (err, data) => {
        if (err) {
            const error = JSON.stringify(err, null, 2);
            console.error("Unable to add item. Error JSON:", error);
            const errorMessage = 'Your purchase was not successful';
            sns.publish(user, errorMessage);
            return res.status(404).send({'error': error, 'success': false});
        } else {
            console.log("Added purchase:", JSON.stringify(data, null, 2));
            const successMessage = 'Your purchase was successful!';
            sns.publish(user.snsTopicArn, successMessage);
            return res.status(200).send({'data': purchase, 'success': true});
        }
    });
})

function getUserSNSTopicArn(email) {

    const userParams = {
        TableName: userTable,
        KeyConditionExpression: '#email = :email',
        ExpressionAttributeNames: {
            '#email': 'email'
        },
        ExpressionAttributeValues: {
            ':email': email
        }
    };

    return docClient.query(userParams)
        .promise()
        .then( (data) => {
            console.log("Query succeeded.");
            data.Items.forEach((user) => {
                console.log(`${user.email}, ${user.snsTopicArn}`);
            });
            return data.Items[0];
        })
        .catch((err) => {
        const error = JSON.stringify(err, null, 2);
        console.error("Unable to query. Error:", error);
    });
}

module.exports = router;