const express = require('express');
const AWS = require('aws-sdk');
const AWS_credentials = require('../config/AWS_Credentials.json');

AWS.config.update({
    accessKeyId: AWS_credentials.ACCESS_KEY,
    secretAccessKey: AWS_credentials.SECRET_ACCESS_KEY,
    sessionToken: AWS_credentials.SESSION_TOKEN,
    region: AWS_credentials.region
});

// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sns-examples-managing-topics.html

exports.registerUserSNS = async (user) => {
    return await createTopicAndSubscribe(user);
}

function createTopicAndSubscribe(user) {
    const at = user.email.indexOf('@');
    const topicName = 'user-' + user.email.slice(0, at) + '-notification';
    const createTopicPromise = new AWS.SNS({apiVersion: '2010-03-31'}).createTopic({Name: topicName}).promise();

    // Handle promise's fulfilled/rejected states
    return createTopicPromise.then((data) => {
            console.log("Topic ARN is " + data.TopicArn);
            subscribe(data.TopicArn, user.email);
            return data.TopicArn;
        }).catch((err) => {
            console.error(err, err.stack);
        });
}

// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sns-examples-subscribing-unubscribing-topics.html
function subscribe(topicArn, email) {

    const params = {
        Protocol: 'EMAIL',
        TopicArn: topicArn,
        Endpoint: email
    };

// Create promise and SNS service object
    const subscribePromise = new AWS.SNS({apiVersion: '2010-03-31'}).subscribe(params).promise();

// Handle promise's fulfilled/rejected states
    subscribePromise.then(
        function(data) {
            console.log("Subscription ARN is " + data.SubscriptionArn);
        }).catch(
        function(err) {
            console.error(err, err.stack);
        });
}

// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sns-examples-publishing-messages.html
exports.publish = (topicArn, message) => {
    // Create publish parameters
    const params = {
        Message: message, /* required */
        TopicArn: topicArn
    };

// Create promise and SNS service object
    const publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

// Handle promise's fulfilled/rejected states
    publishTextPromise.then(
        function(data) {
            console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
            console.log("MessageID is " + data.MessageId);
        }).catch(
        function(err) {
            console.error(err, err.stack);
        });
}

// createTopicAndSubscribe(user);
// publish();
