// passphrase is specific for ldapValidation project only
var passphrase = function() { // can be later changed to pull something from other locations
    return "afhaiAGginpinFTEFifan3fi2ion";
};

var serverHost = "http://localhost";
var serverPort = process.env.PORT || 9000;
var serverUrl = serverHost + ":" + serverPort;
var ldapServerHost = "ldap://upgi.ddns.net"; // specific for ldapValidation project
var ldapServerPort = process.env.PORT || 389; // specific for ldapValidation project
var ldapServerUrl = ldapServerHost + ":" + ldapServerPort; // specific for ldapValidation project
var mssqlServerHost = "http://localhost"; // access database from the internet through ssh tunnel (development)
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
    ldapServerHost, // specific for ldapValidation project
    ldapServerPort, // specific for ldapValidation project
    ldapServerUrl, // specific for ldapValidation project
    mssqlConfig,
    passphrase, // passphrase is specific for ldapValidation project only
    serverHost,
    serverPort,
    serverUrl,
    smtpTransportAccount,
    upgiSystemAccount,
    upgiSystemPassword,
    workingTimezone
};