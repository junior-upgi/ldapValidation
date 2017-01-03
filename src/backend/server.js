const bodyParser = require('body-parser');
const cors = require('cors');
// const CronJob = require('cron').CronJob;
const express = require('express');
const jwt = require('jsonwebtoken');
const ldap = require('ldapjs');
const moment = require('moment-timezone');
const morgan = require('morgan');
// const httpRequest = require('request-promise');
const favicon = require('serve-favicon');

const serverConfig = require('./module/serverConfig.js');
const systemPrivilege = require('./model/systemPrivilege.js');
const telegramUser = require('./model/telegramUser.js');
const upgiSystem = require('./model/upgiSystem.js');
const utility = require('./module/utility.js');

const app = express();
app.use(cors()); // allow cross origin request
app.use(morgan('dev')); // log request and result to console
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

app.use(favicon(__dirname + '/../public/upgiLogo.png')); // middleware to serve favicon
app.use('/ldapValidation', express.static('./public')); // serve static files
app.use('/ldapValidation/bower_components', express.static('./bower_components')); // serve static files

app.get('/status', function(request, response) { // serve system status information
    return response.status(200).json({
        system: serverConfig.systemReference,
        status: 'online',
        timestamp: moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
    });
});

app.get('/ldapValidation/systemList', function(request, response) { // serve system status information
    return response.status(200).json(upgiSystem.list);
});

app.route('/ldapValidation/login')
    .get(function(request, response) {
        if (serverConfig.development !== true) {
            return response.status(200).redirect('http://localhost:9005/ldapValidation/login.html');
        } else {
            return response.status(200).redirect('http://localhost:9995/ldapValidation/login.html');
        }
    })
    .post(function(request, response) {
        utility.logger.info(`received login request from ${request.body.loginID}`);
        let ldapClient = ldap.createClient({ url: serverConfig.ldapServerUrl });
        ldapClient.bind(`uid=${request.body.loginID},ou=user,dc=upgi,dc=ddns,dc=net`, request.body.password, function(error) {
            if (error) {
                utility.logger.error(`LDAP validation failure: ${error.lde_message}`);
                return response.status(403).send({
                    errorMessage: error.lde_message
                });
            }
            ldapClient.unbind(function(error) {
                if (error) {
                    utility.logger.error(`LDAP server separation failure: ${error.lde_message}`);
                    utility.sendMessage([telegramUser.getUserID('蔡佳佑')], [`LDAP server separation failure: ${error.lde_message}`]);
                }
                utility.logger.info(`${request.body.loginID} account info validated, checking access rights`);
                // continue to check if user has rights to access the website of the system selected
                let userPrivObject = systemPrivilege.list.filter(function(privObject) {
                    return privObject.erpID === request.body.loginID;
                });
                if (userPrivObject.length !== 1) {
                    utility.logger.info(`userPrivObject.length: ${userPrivObject.length}`);
                    return response.status(403).send({
                        errorMessage: '此帳號沒有使用權限'
                    });
                } else {
                    let systemMembershipObject = userPrivObject[0].membership.filter(function(membershipObject) {
                        return membershipObject.systemID === parseInt(request.body.systemID);
                    });
                    if (systemMembershipObject.length !== 1) {
                        utility.logger.info(`systemMembershipObject.length: ${systemMembershipObject.length}`);
                        return response.status(403).send({
                            errorMessage: '此帳號沒有使用權限'
                        });
                    }
                    utility.logger.info(`${request.body.loginID} ${request.body.systemID} access privilege validated`);
                    let payload = {
                        loginID: request.body.loginID,
                        systemID: request.body.systemID,
                        expiration: systemMembershipObject[0].accessPeriod
                    };
                    let token = jwt.sign(payload, serverConfig.passphrase, { expiresIn: systemMembershipObject[0].accessPeriod });
                    utility.logger.info(`${request.body.loginID} login procedure completed`);
                    return response.status(200).send({
                        token: token,
                        redirectUrl: function() {
                            return upgiSystem.list.filter(function(system) {
                                return system.id === parseInt(request.body.systemID);
                            })[0].frontendUrl;
                        }()
                    });
                }
            });
        });
    });

app.listen(serverConfig.serverPort, function(error) { // start backend server
    if (error) {
        utility.logger.error(`error starting ${serverConfig.systemReference} server: ${error}`);
    } else {
        utility.logger.info(`${serverConfig.systemReference} server in operation... (${serverConfig.serverUrl})`);
    }
});

utility.statusReport.start(); // start the server status reporting function

/*
app.get("/", function(request, response) { // takes the user to UPGI portal page
    return response.status(200).render("portal", {
        serverHost: config.serverHost,
        serverPort: config.serverPort
    });
});

app.get("/loginFailure", function(request, response) { // serve login failure page
    return response.render("loginFailure", {
        serverHost: config.serverHost,
        serverPort: config.serverPort
    });
});

app.post("/getToken", function(request, response) { // login routes for upgiSystems
    console.log("收到驗證要求...");
    var baseDN = "dc=upgi,dc=ddns,dc=net";
    var ldapClient = ldap.createClient({ url: config.ldapServerHost + ":" + config.ldapServerPort });
    ldapClient.bind("uid=" + request.body.loginID + ",ou=user," + baseDN, request.body.password, function(error) {
        if (error) {
            console.log("帳號驗證失敗：" + error);
            return response.status(403).redirect(config.serverHost + ":" + config.serverPort + "/loginFailure");
        }
        ldapClient.unbind(function(error) {
            if (error) {
                console.log("LDAP 伺服器分離失敗：" + error);
                return response.status(500).json({
                    "authenticated": false,
                    "message": "LDAP 伺服器分離失敗：" + error
                });
            }
            console.log("帳號驗證成功...");
            mssql.connect(mssqlConfig).then(function() { // continue to check if user has rights to access the website of the system selected
                var queryString =
                    "SELECT a.systemID,b.reference " +
                    "FROM upgiSystem.dbo.websitePrivilege a " +
                    "INNER JOIN upgiSystem.dbo.system b ON a.systemID=b.id " +
                    "WHERE erpID='" +
                    request.body.loginID + "';"
                var mssqlRequest = new mssql.Request();
                mssqlRequest.query(queryString).then(function(resultset) {
                    mssql.close();
                    console.log("使用者系統權限認證完畢");
                    var payload = { loginID: request.body.loginID };
                    var token = jwt.sign(payload, app.get("passphrase"), { expiresIn: 3600 });
                    return response.status(200).send(token).end();
                }).catch(function(error) {
                    console.log("網頁使用權限資料查詢失敗：" + error);
                    return response.status(500).send("").end();
                });
            });
        });
    });
});

app.route("/login") // login related routes
    .get(function(request, response) { // supply user with a login page
        return response.render("login", {
            upgiSystemList: upgiSystemList,
            serverHost: config.serverHost,
            serverPort: config.serverPort
        });
    })
    .post(function(request, response) { // route that verifies a login request and supplies token when successful
        console.log("收到驗證要求...");
        var baseDN = "dc=upgi,dc=ddns,dc=net";
        var ldapClient = ldap.createClient({ url: config.ldapServerHost + ":" + config.ldapServerPort });
        ldapClient.bind("uid=" + request.body.loginID + ",ou=user," + baseDN, request.body.password, function(error) {
            if (error) {
                console.log("帳號驗證失敗：" + error);
                return response.status(403).redirect(config.serverHost + ":" + config.serverPort + "/loginFailure");
            }
            ldapClient.unbind(function(error) {
                if (error) {
                    console.log("LDAP 伺服器分離失敗：" + error);
                    return response.status(500).json({
                        "authenticated": false,
                        "message": "LDAP 伺服器分離失敗：" + error
                    });
                }
                console.log("帳號驗證成功...");
                mssql.connect(mssqlConfig).then(function() { // continue to check if user has rights to access the website of the system selected
                    var queryString =
                        "SELECT a.systemID,b.reference " +
                        "FROM upgiSystem.dbo.websitePrivilege a " +
                        "INNER JOIN upgiSystem.dbo.system b ON a.systemID=b.id " +
                        "WHERE erpID='" +
                        request.body.loginID + "';"
                    var mssqlRequest = new mssql.Request();
                    mssqlRequest.query(queryString).then(function(resultset) {
                        mssql.close();
                        console.log("使用者系統權限認證完畢");
                        var payload = { loginID: request.body.loginID };
                        var token = jwt.sign(payload, app.get("passphrase"), { expiresIn: 3600 });
                        return response.status(200).render("authorizedPortal", {
                            token: token,
                            authorizedSystemList: JSON.stringify(resultset),
                            serverHost: config.serverHost,
                            serverPort: config.serverPort
                        });
                    }).catch(function(error) {
                        console.log("網頁使用權限資料查詢失敗：" + error);
                        return response.status(500).redirect(config.serverHost + ":" + config.serverPort + "/loginFailure");
                    });
                });
            });
        });
    });

app.post("/validate", function(request, response) { //verify a token
    // check for token
    var accessToken = (request.body && request.body.accessToken) ||
        (request.query && request.query.accessToken) ||
        request.headers['x-access-token'];
    if (accessToken) { // decode found token, verifies secret and checks exp
        jwt.verify(accessToken, app.get("passphrase"), function(error, decodedToken) {
            if (error) {
                console.log("token 驗證失敗： " + moment(moment(), "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss"));
                console.log("錯誤內容： " + error.message);
                return response.status(403).json({ authorized: false, message: "token 驗證失敗： " + error.message });
            }
            console.log("token 驗證成功： " + moment(moment(), "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss"));
            return response.status(200).json({ authorized: true, user: decodedToken.loginID, message: "token 驗證成功" });
        });
    } else { // if there is no token, return an error
        console.log("token 不存在");
        return response.status(403).send({ authorized: false, message: "token 不存在" });
    }
});

app.listen(config.serverPort); // start server
console.log("LDAP 認證系統運行中...(" + config.serverHost + ":" + config.serverPort + ")");

var scheduledPrivilegeTableUpdate = new CronJob("0 * * * * *", function() { // periodically updates the privilege data
    var currentDatetime = moment(moment(), "YYYY-MM-DD HH:mm:ss");
    console.log(currentDatetime.format("YYYY-MM-DD HH:mm:ss") + " 更新");
    mssql.connect(mssqlConfig).then(function() { // fetch data from server
        var mssqlRequest = new mssql.Request();
        var queryString = "SELECT * FROM upgiSystem.dbo.system;";
        mssqlRequest.query(queryString).then(function(resultset) {
            mssql.close();
            console.log("系統列表查詢成功");
            upgiSystemList = resultset;
        }).catch(function(error) {
            console.log("系統列表查詢失敗：" + error);
            upgiSystemList = [];
        });
        queryString =
            "SELECT a.erpID,a.systemID,b.reference,b.cReference " +
            "FROM upgiSystem.dbo.websitePrivilege a " +
            "INNER JOIN upgiSystem.dbo.system b ON a.systemID=b.id;";
        mssqlRequest.query(queryString).then(function(resultset) {
            mssql.close();
            console.log("網頁使用權限資料查詢成功");
            websitePrivilegeData = resultset;
        }).catch(function(error) {
            console.log("網頁使用權限資料查詢失敗：" + error);
            websitePrivilegeData = [];
        });
    });
}, null, true, "Asia/Taipei");
scheduledPrivilegeTableUpdate.start();
*/
