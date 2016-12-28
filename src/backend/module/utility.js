const CronJob = require('cron').CronJob;
const fs = require('fs');
const moment = require('moment-timezone');
const httpRequest = require('request-promise');

const serverConfig = require('./serverConfig.js');

const telegramUser = require('../model/telegramUser.js');
const telegramBot = require('../model/telegramBot.js');

let statusUpdate = new CronJob('0 0 */3 * * *', function() {
    let currentTime = moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
    let message = `${currentTime} ${serverConfig.systemReference} reporting`;
    httpRequest({
        method: 'post',
        uri: serverConfig.broadcastAPIUrl,
        form: {
            chat_id: telegramUser.getUserID('蔡佳佑'),
            text: `${message}`,
            token: telegramBot.getToken('upgiITBot')
        }
    });
}, null, true, serverConfig.workingTimezone);

function alertSystemError(systemReference, functionReference, errorMessage) {
    let currentDatetime = moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
    let messageHeading = httpRequest({ // broadcast alert when error encountered
        method: 'post',
        uri: serverConfig.broadcastAPIUrl,
        form: {
            chat_id: telegramUser.getUserID('蔡佳佑'),
            text: `error encountered while executing [${systemReference}][${functionReference}] @ ${currentDatetime}`,
            token: telegramBot.getToken('upgiITBot')
        }
    });
    let messageBody = httpRequest({
        method: 'post',
        uri: serverConfig.broadcastAPIUrl,
        form: {
            chat_id: telegramUser.getUserID('蔡佳佑'),
            text: `${errorMessage}`,
            token: telegramBot.getToken('upgiITBot')
        }
    });
    messageHeading().then(function() {
        return messageBody();
    }).then(function() {
        return console.log('error message had been alerted');
    }).catch(function(error) {
        return console.log(error);
    });
}

function fileRemoval(completeFilePath, callback) {
    console.log(completeFilePath);
    fs.unlink(completeFilePath, function(error) {
        if (error !== null) {
            console.log('file removal failure (may not be critical failure): ' + error);
            return false;
        } else {
            console.log(completeFilePath + ' removed successfully');
            if (callback === undefined) {
                return true;
            } else {
                callback();
            }
        }
    });
}

module.exports = {
    alertSystemError: alertSystemError,
    fileRemoval: fileRemoval,
    statusUpdate: statusUpdate
};
