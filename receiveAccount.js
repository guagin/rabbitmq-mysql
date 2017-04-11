var amqp = require('amqplib/callback_api');

var mysql = require('mysql'); 

// AMQP listener
amqp.connect('amqp://rabbitmq:5672', function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'account';
        ch.assertQueue(q, { durable: false });
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, function (msg) {
            console.log(" [x] Received %s", msg.content.toString());
            var msgObj = JSON.parse(msg.content);

            console.log(`IBAN = ${msgObj.IBAN}, balance = ${msgObj.balance}, id = ${msgObj.id}, 
                label = ${msgObj.label}, number = ${msgObj.number},
                oweners = ${msgObj.oweners}, swift_bic = ${msgObj.swift_bic}, type = ${msgObj.type}`);
            
            // write into mysql
            var obpMysqlConnection = mysql.createConnection({
                user: 'root',
                password: 'passw0rd',
                host: 'mysql-obp',
                port: 3306,
                database: 'obp'
            });

            obpMysqlConnection.connect();

            obpMysqlConnection.query('INSERT INTO `obp`.`account` (`IBAN`, `balance`, `id`, `label`, `number`, `oweners`, `swift_bic`, `type`) VALUES (?,?,?,?,?,?,?,?);', [msgObj.IBAN, msgObj.balance, msgObj.id, msgObj.label, msgObj.number, msgObj.oweners, msgObj.swift_bic, msgObj.type] ,function (error, results, fields) {
            if (error) throw error;
            console.log('Record inserted: ', results);
            });

            obpMysqlConnection.end();


        }, { noAck: true });
    });
});