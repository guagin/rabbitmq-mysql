#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

/* process.argv is an array containing the command line arguments. 
   The first element will be 'node', the second element will be the name of the JavaScript file. 
   The next elements will be any additional command line arguments.
*/
var queue = process.argv[2]
var msg = process.argv[3];

// connect to RabbitMQ server
amqp.connect('amqp://127.0.0.1:5672', function (err, conn) {
    if (err) {
        console.log("error: " + err);
        return;
    }

    console.log(conn);
    // create a channel, which is where most of the API for getting things done resides:
    conn.createChannel(function (err, ch) {
        // declare a queue for us to send to; then we can publish a message to the queue:
        var q = queue;

        ch.assertQueue(q, { durable: false });
        // Note: on Node 6 Buffer.from(msg) should be used
        // # bank
        // ch.sendToQueue(q, new Buffer('{"full_name":"Randy Gibson","id":"328302038351872","logo":"tobgu","short_name":"Cora Lindsey","website":"hakewuje"}'));
        // # account
        // ch.sendToQueue(q, new Buffer('{"IBAN":"uzip","balance":82.13091081,"id":"3718887457685504","label":"zazot","number":"5063591134756864","oweners":"epaha","swift_bic":"jobtins","type":"toog"}'));
        
        ch.sendToQueue(q, new Buffer(msg));

        console.log('Message sent');


    });
    // close the connection and exit;
    setTimeout(function () { conn.close(); process.exit(0) }, 500);
});


