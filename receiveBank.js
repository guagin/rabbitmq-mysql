var amqp = require('amqplib/callback_api');

var mysql = require('mysql');  //mysql

// AMQP listener
amqp.connect('amqp://rabbitmq:5672', function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'bank';
        ch.assertQueue(q, { durable: false });
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, function (msg) {
            console.log(" [x] Received %s", msg.content.toString());
            var msgObj = JSON.parse(msg.content);

            console.log(`full_name = ${msgObj.full_name}, id = ${msgObj.id}, logo = ${msgObj.logo}, short_name = ${msgObj.short_name}, website = ${msgObj.website}`);
            
            // write into mysql
            var obpMysqlConnection = mysql.createConnection({
                user: 'root',
                password: 'passw0rd',
                host: 'mysql-obp',
                port: 3306,
                database: 'obp'
            });

            obpMysqlConnection.connect();

            obpMysqlConnection.query('INSERT INTO `obp`.`bank` (`full_name`, `id`, `logo`, `short_name`, `website`) VALUES (?,?,?,?,?);', [msgObj.full_name, msgObj.id, msgObj.logo, msgObj.short_name, msgObj.website] ,function (error, results, fields) {
            if (error) throw error;
            console.log('Record inserted: ', results);
            });

            obpMysqlConnection.end();


        }, { noAck: true });
    });
});