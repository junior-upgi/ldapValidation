const systemReference = 'ldapValidation';

const development = false;

function serverHost() {
    if (development === true) {
        return 'http://127.0.0.1'; // development
    } else {
        return 'http://upgi.ddns.net'; // production
    }
}
const serverPort = '9005';

module.exports = {
    serverUrl: `${serverHost()}:${serverPort}/${systemReference}`,
    systemReference: systemReference,
    loginUrl: `${serverHost()}:${serverPort}/${systemReference}/login`
};
