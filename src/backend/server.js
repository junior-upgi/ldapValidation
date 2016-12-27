const bodyParser = require('body-parser');
const cors = require('cors');
// const CronJob = require('cron').CronJob;
const express = require('express');
// const moment = require('moment-timezone');
const morgan = require('morgan');
// const httpRequest = require('request-promise');
const favicon = require('serve-favicon');
// const uuid = require('uuid/v4');

const serverConfig = require('./module/serverConfig.js');
const utility = require('./module/utility.js');

const app = express();
app.use(cors()); // allow cross origin request
app.use(morgan('dev')); // log request and result to console
app.use(bodyParser.urlencoded({
    extended: true
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(favicon(__dirname + '/../public/upgiLogo.png')); // middleware to serve favicon

utility.informStatus.start();

app.get('/status', function(request, response) { // serve system status information
    return response.status(200).json({
        system: serverConfig.systemReference,
        status: 'online'
    });
});

app.listen(serverConfig.serverPort, function(error) { // start backend server
    if (error) {
        console.log(`error starting ${serverConfig.systemReference} server: ${error}`);
    } else {
        console.log(`${serverConfig.systemReference} server in operation... (${serverConfig.serverUrl})`);
    }
});
