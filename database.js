var mssql = require("mssql");
var config = require("./config.js");

function executeQuery(queryString, callback) {
    var mssqlConnection = new mssql.Connection(config.mssqlConfig);
    mssqlConnection.connect()
        .then(function() {
            var mssqlRequest = new mssql.Request(mssqlConnection);
            mssqlRequest.query(queryString)
                .then(function(recordset) {
                    mssqlConnection.close();
                    callback(recordset);
                })
                .catch(function(error) {
                    console.log("query failure: " + error);
                    callback(null, error);
                });
        })
        .catch(function(error) {
            console.log("database connection failure: " + error);
            callback(null, error);
        });
};

module.exports = {
    executeQuery
};