var passphrase = function() { // can be later changed to pull something from other locations
    return "This is not a passphrase";
};

var serverHost = "http://192.168.168.25";
var serverPort = process.env.PORT || 9000;
var ldapServerHost = "ldap://upgi.ddns.net";
var ldapServerPort = process.env.PORT || 389;

module.exports = {
    passphrase,
    serverHost,
    serverPort,
    ldapServerHost,
    ldapServerPort
};