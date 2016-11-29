// passphrase is specific for ldapValidation project only
var passphrase = function() { // can be later changed to pull something from other locations
    return "This is not a passphrase";
};

var serverHost = "http://localhost";
var serverPort = process.env.PORT || 9000;
var ldapServerHost = "ldap://upgi.ddns.net"; // specific for ldapValidation project
var ldapServerPort = process.env.PORT || 389; // specific for ldapValidation project
var mssqlServerHost = "http://upgi.ddns.net"; // access database from the internet (development)
//var mssqlServerHost = "http://192.168.168.5"; // access database from LAN (production)
var mssqlServerPort = process.env.PORT || 1433;
var upgiSystemAccount = "upgiSystem";
var upgiSystemPassword = "upgiSystem";

var mssqlConfig = {
    server: mssqlServerHost.slice(7),
    user: upgiSystemAccount,
    password: upgiSystemPassword,
    port: mssqlServerPort
};

const smtpTransportAccount = "smtps://junior.upgi@gmail.com:cHApPPZV@smtp.gmail.com";

const workingTimezone = "Asia/Taipei";

module.exports = {
    passphrase, // passphrase is specific for ldapValidation project only
    serverHost,
    serverPort,
    ldapServerHost, // specific for ldapValidation project
    ldapServerPort, // specific for ldapValidation project
    mssqlConfig,
    upgiSystemAccount,
    upgiSystemPassword,
    smtpTransportAccount,
    workingTimezone
};