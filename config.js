var passphrase = function() { // can be later changed to pull something from other locations
    return "This is not a passphrase";
};

//var serverHost = "http://localhost"; // development
var serverHost = "http://192.168.168.25"; // production
var serverPort = process.env.PORT || 9000;
var ldapServerHost = "ldap://upgi.ddns.net";
var ldapServerPort = process.env.PORT || 389;
//var mssqlServerHost = "http://upgi.ddns.net"; // access database from the internet (development)
var mssqlServerHost = "http://192.168.168.5"; // access database from LAN (production)
var upgiSystemAccount = "upgiSystem";
var upgiSystemPassword = "upgiSystem";

module.exports = {
    passphrase,
    serverHost,
    serverPort,
    ldapServerHost,
    ldapServerPort,
    mssqlServerHost,
    upgiSystemAccount,
    upgiSystemPassword
};