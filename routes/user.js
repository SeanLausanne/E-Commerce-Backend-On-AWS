const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const AWS_credentials = require('../config/AWS_Credentials.json');
const utils = require('./utils');
const sns = require('./sns');

// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
// https://www.youtube.com/watch?v=EBlHUDUfCfk

AWS.config.update({
    accessKeyId: AWS_credentials.ACCESS_KEY,
    secretAccessKey: AWS_credentials.SECRET_ACCESS_KEY,
    sessionToken: AWS_credentials.SESSION_TOKEN,
    region: "us-east-1"
});

const docClient = new AWS.DynamoDB.DocumentClient()
const table = 'Cloud-users';

router.post('/', async (req, res) => {

    if (!req.body.email) {
        return res.status(400).send({
            success: false,
            error: "Missing user email"
        })
    }

    const email = req.body.email;

    const topicArn = await sns.registerUserSNS({
        email: email
    });

    const user = {
        email: email,
        snsTopicArn: topicArn
    }

    const params = {
        TableName: table,
        Item: user
    };

    docClient.put(params, (err, data) => {
        if (err) {
            const error = JSON.stringify(err, null, 2);
            console.error("Unable to add item. Error JSON:", error);
            return res.status(400).send({'error': error, 'success': false});
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
            return res.status(200).send({success: true, item: user});
        }
    });
});

module.exports = router;