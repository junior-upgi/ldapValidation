const systemReference = 'ldapValidation';

const development = true;
const serverHost = 'http://127.0.0.1';
const serverPort = 9005;
const broadcastServerHost = 'http://192.168.168.25';
const broadcastServerPort = 9001;
const mssqlServerHost = 'http://192.168.168.5'; // access database from LAN (production)
// const mssqlServerHost = 'http://127.0.0.1'; // access database through SSH (development)
const mssqlServerPort = 1433;
const upgiSystemAccount = 'upgiSystem';
const upgiSystemPassword = 'upgiSystem';
const smtpTransportAccount = 'smtps://junior.upgi@gmail.com:cHApPPZV@smtp.gmail.com';
const workingTimezone = 'Asia/Taipei';

module.exports = {
    systemReference: systemReference,
    development: development,
    serverHost: serverHost,
    serverPort: serverPort,
    serverUrl: serverHost + ':' + serverPort,
    // publicServerUrl: 'http://upgi.ddns.net:' + serverPort, // production
    publicServerUrl: serverHost + ':' + 9999, // development with browserSync
    broadcastAPIUrl: broadcastServerHost + ':' + broadcastServerPort + '/broadcast',
    mssqlServerHost: mssqlServerHost,
    mssqlServerPort: mssqlServerPort,
    mssqlServerUrl: mssqlServerHost + ':' + mssqlServerHost,
    upgiSystemAccount: upgiSystemAccount,
    upgiSystemPassword: upgiSystemPassword,
    mssqlConfig: {
        server: mssqlServerHost.slice(7),
        user: upgiSystemAccount,
        password: upgiSystemPassword,
        port: mssqlServerPort,
        connectionTimeout: 60000,
        requestTimeout: 60000
    },
    smtpTransportAccount: smtpTransportAccount,
    workingTimezone: workingTimezone
};
