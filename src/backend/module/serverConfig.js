const systemReference = 'ldapValidation';

const development = false;
const serverHost = 'http://127.0.0.1';
const serverPort = 9005;

function broadcastServerUrl() {
    let broadcastServerPort = 9001;
    if (development === true) {
        return `http://upgi.ddns.net:${broadcastServerPort}/broadcast`; // access broadcast server from internet (development)
    } else {
        return `http://192.168.168.25:${broadcastServerPort}/broadcast`; // access broadcast server from LAN (production)
    }
}

function mssqlServerHost() {
    if (development === true) {
        return 'http://127.0.0.1'; // access database through SSH (development)
    } else {
        return 'http://192.168.168.5'; // access database from LAN (production)
    }
}
const mssqlServerPort = 1433;

function mssqlServerUrl() {
    if (development === true) {
        return `${mssqlServerHost()}:${mssqlServerPort}`; // access database through SSH (development)
    } else {
        return `${mssqlServerHost()}:${mssqlServerPort}`; // access database from LAN (production)
    }
}

function publicServerUrl() {
    if (development === true) {
        return `${serverHost}:${serverPort}`; // development
    } else {
        return `http://upgi.ddns.net:${serverPort}`; // production
    }
}
const upgiSystemAccount = 'upgiSystem';
const upgiSystemPassword = 'upgiSystem';
const smtpTransportAccount = 'smtps://junior.upgi@gmail.com:cHApPPZV@smtp.gmail.com';
const workingTimezone = 'Asia/Taipei';

const botAPIUrl = 'https://api.telegram.org/bot';

function passphrase() { // can be later changed to pull something from other locations
    return 'This is not a passphrase';
}

module.exports = {
    botAPIUrl: botAPIUrl,
    broadcastServerUrl: broadcastServerUrl(),
    development: development,
    ldapServerUrl: 'ldap://upgi.ddns.net:389',
    logDir: 'log',
    mssqlConfig: {
        server: mssqlServerHost().slice(7),
        user: upgiSystemAccount,
        password: upgiSystemPassword,
        port: mssqlServerPort,
        connectionTimeout: 60000,
        requestTimeout: 60000
    },
    mssqlServerUrl: mssqlServerUrl(),
    passphrase: passphrase(),
    publicServerUrl: publicServerUrl(),
    serverHost: serverHost,
    serverPort: serverPort,
    serverUrl: serverHost + ':' + serverPort,
    smtpTransportAccount: smtpTransportAccount,
    systemReference: systemReference,
    upgiSystemAccount: upgiSystemAccount,
    upgiSystemPassword: upgiSystemPassword,
    workingTimezone: workingTimezone
};
