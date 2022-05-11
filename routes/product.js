const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const AWS_credentials = require('../config/AWS_Credentials.json');
const utils = require('./utils');


// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html
// https://www.youtube.com/watch?v=EBlHUDUfCfk

AWS.config.update({
    accessKeyId: AWS_credentials.ACCESS_KEY,
    secretAccessKey: AWS_credentials.SECRET_ACCESS_KEY,
    sessionToken: AWS_credentials.SESSION_TOKEN,
    region: "us-east-1"
});

const docClient = new AWS.DynamoDB.DocumentClient()
const table = 'Clouds-products';

// get all products
router.get('/', (req, res) => {
    const params = {
        TableName : table
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            const error = JSON.stringify(err, null, 2);
            console.error("Unable to query. Error:", error);
            res.send({
                'error': error,
                'success': false
            });
        } else {
            console.log("Scan succeeded.");
            data.Items.forEach((product) => {
                console.log(`${product.id}, ${product.name}, ${product.price}, ${product.description}`);
            });
            res.send({
                'data': data.Items,
                'success': true
            });
        }
    });
});


// get one product
router.get('/:id', (req, res) => {

    const params = {
        TableName : table,
        KeyConditionExpression: '#id = :id',
        ExpressionAttributeNames:{
            '#id': 'id'
        },
        ExpressionAttributeValues: {
            ':id': req.params.id
        }
    };

    docClient.query(params, (err, data) => {
        if (err) {
            const error = JSON.stringify(err, null, 2);
            console.error("Unable to query. Error:", error);
            res.send({
                'error': error,
                'success': false
            });
        } else {
            console.log("Query succeeded.");
            data.Items.forEach(function(product) {
                console.log(`${product.id}, ${product.name}, ${product.price}, ${product.description}`);
            });
            res.send({
                'data': data.Items,
                'success': true
            });
        }
    });

});

// add products
router.post('/add', (req, res) => {

    const products = [
        {
            id: utils.getUniqueId('product'),
            name: 'product 1',
            price: 100,
            brand: 'brand 1',
            description: 'description of product 1',
            dateAdded: utils.getCurrentTime()

        },
        {
            id: utils.getUniqueId('product'),
            name: 'product 2',
            price: 200,
            brand: 'brand 2',
            description: 'description of product 2',
            dateAdded: utils.getCurrentTime()

        },
        {
            id: utils.getUniqueId('product'),
            name: 'product 3',
            price: 300,
            brand: 'brand 3',
            description: 'description of product 3',
            dateAdded: utils.getCurrentTime()
        }
    ]

    for (const product of products) {
        const params = {
            TableName: table,
            Item: product
        };
        console.log("Adding a new item...");
        docClient.put(params, (err, data) => {
            if (err) {
                const error = JSON.stringify(err, null, 2);
                console.error("Unable to add item. Error JSON:", error);
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
            }
        });
    }
    res.send({
        'added': products,
        'success': true
    });
});

module.exports = router;
