const mssql = require('mssql');
const serverConfig = require('./serverConfig.js');
const utility = require('./utility.js');

module.exports = {
    executeQuery: function(queryString, callback) {
        let mssqlConnection = new mssql.Connection(serverConfig.mssqlConfig);
        mssqlConnection.connect()
            .then(function() {
                let mssqlRequest = new mssql.Request(mssqlConnection);
                mssqlRequest.query(queryString)
                    .then(function(recordset) {
                        console.log(queryString);
                        mssqlConnection.close();
                        callback(recordset);
                    })
                    .catch(function(error) {
                        utility.alertSystemError('query failure', `[queryString]: ${queryString}`, error);
                        console.log('query failure: ' + error);
                        callback(null, error);
                    });
            })
            .catch(function(error) {
                utility.alertSystemError('database connection failure', `[queryString]: ${queryString}`, error);
                console.log('database connection failure: ' + error);
                callback(null, error);
            });
    }
};
