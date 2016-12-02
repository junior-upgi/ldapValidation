var bodyParser = require("body-parser");
var cors = require("cors");
var CronJob = require("cron").CronJob;
var express = require("express");
var httpRequest = require("request-promise");
var jwt = require("jsonwebtoken");
var ldap = require("ldapjs");
var moment = require("moment-timezone");
var morgan = require("morgan");

var config = require("./config.js");
var database = require("./database.js");

var app = express();
app.set("view engine", "ejs");
app.set("passphrase", config.passphrase());

app.use(cors()); // allow cross origin request
app.use(morgan("dev")); // log request and result to console
app.use(bodyParser.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

var upgiSystemList = [];
var systemPrivilegeData = [];
database.executeQuery("SELECT * FROM upgiSystem.dbo.system;", function(recordset, error) {
    if (error) {
        upgiSystemList = [];
        return console.log("unable to initialize upgiSystem data: " + error);
    }
    upgiSystemList = recordset;
    //console.log(upgiSystemList);
    return console.log("upgiSystem data initialized...");
});
database.executeQuery(
    "SELECT a.erpID AS loginID,a.systemID,b.reference,b.cReference " +
    "FROM upgiSystem.dbo.systemPrivilege a " +
    "INNER JOIN upgiSystem.dbo.system b ON a.systemID=b.id;",
    function(resultset, error) {
        if (error) {
            systemPrivilegeData = [];
            return console.log("unable to initialize privilege data: " + error);
        }
        systemPrivilegeData = resultset;
        //console.log(systemPrivilegeData);
        return console.log("system access privilege data initialized...");
    });

app.get("/ldap/status", function(request, response) { // provides status of verification system
    console.log("/ldap/status");
    return response.status(200).json({ status: "online" });
});

app.post("/ldap/generateToken", function(request, response) { // verify against LDAP server and grant access token
    console.log("/ldap/generateToken");
    var baseDN = "dc=upgi,dc=ddns,dc=net";
    var ldapClient = ldap.createClient({ url: config.ldapServerUrl });
    ldapClient.bind("uid=" + request.body.loginID + ",ou=user," + baseDN, request.body.password, function(error) {
        if (error) {
            console.log("user not validated: " + error);
            return response.status(403).json({ token: null }).end();
        }
        ldapClient.unbind(function(error) {
            if (error) {
                console.log("LDAP server unbind failure: " + error);
                return response.status(500).json({ token: null }).end();
            }
            console.log("user credential authenticated...");
            var payload = { loginID: request.body.loginID };
            var token = jwt.sign(payload, app.get("passphrase"), { expiresIn: 3600 });
            return response.status(200).json({ token: token }).end();
        });
    });
});

app.post("/ldap/verifySystemPrivilege", function(request, response) { // verify user against existing token and system
    console.log("/ldap/verifySystemPrivilege");
    var accessToken = (request.body && request.body.accessToken) ||
        (request.query && request.query.accessToken) ||
        request.headers['x-access-token'];
    if (accessToken) { // decode the token from request, verifies secret and checks exp
        jwt.verify(accessToken, app.get("passphrase"), function(error, decodedToken) {
            if (error) {
                console.log("token validation failure: " + error.message);
                return response.status(403).json({ authorized: false }).end();
            }
            console.log("token validated, proceed to verify system privilege");
            ///////////////////////////////////////////////////////////////////////////////////////////////////
            systemPrivilegeData.forEach(function(systemPrivilegeRecord) {
                if (systemPrivilegeRecord.loginID === request.body.loginID) {
                    if (systemPrivilegeRecord.systemID === request.body.systemID) {
                        console.log("authenticated user with access privilege");
                        return response.status(200).json({ authorized: true }).end();
                    } else {
                        console.log("authenticated user without proper access privilege");
                        return response.status(200).json({ authorized: true }).end();
                    }
                }
            });
            console.log("CRITICAL ERROR: attemp to login with valid token from unknown source");
            httpRequest({ // broadcast alert when error encountered
                method: "post",
                uri: "http://upgi.ddns.net:9001/broadcast",
                form: {
                    chat_id: 241630569,
                    text: "CRITICAL ERROR: attemp to login with valid token from unknown source",
                    token: "287236637:AAHSuMHmaZJ2Vm9gXf3NeSlInrgr-XXzoRo"
                }
            }).catch(function(error) {
                return response.status(403).json({ authorized: false }).end();
            });
            return response.status(403).json({ authorized: false }).end();
        });
    } else { // if there is no token, return an error
        console.log("token doesn't exist");
        return response.status(403).json({ authorized: false }).end();
    }
});

app.listen(config.serverPort); // start server
console.log("LDAP verification system online...(" + config.serverUrl + ")");

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
                mssql.connect(mssqlConfig).then(function() { // continue to check if user has rights to access the system selected
                    var queryString =
                        "SELECT a.systemID,b.reference " +
                        "FROM upgiSystem.dbo.systemPrivilege a " +
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

app.post("/getToken", function(request, response) { // validation
    console.log("validation request received...");
    var baseDN = "dc=upgi,dc=ddns,dc=net";
    var ldapClient = ldap.createClient({ url: config.ldapServerHost + ":" + config.ldapServerPort });
    ldapClient.bind("uid=" + request.body.loginID + ",ou=user," + baseDN, request.body.password, function(error) {
        if (error) {
            console.log("user not validated: " + error);
            return response.status(403).redirect(config.serverHost + ":" + config.serverPort + "/loginFailure");
        }
        ldapClient.unbind(function(error) {
            if (error) {
                console.log("LDAP server unbind failure: " + error);
                return response.status(500).json({
                    "authenticated": false,
                    "message": "LDAP server unbind failure: " + error,
                    "systemPrivilege": []
                });
            }
            console.log("user validated...");
            // continue to check if user has rights to access the system selected
            database.executeQuery("SELECT a.systemID,b.reference " +
                "FROM upgiSystem.dbo.systemPrivilege a " +
                "INNER JOIN upgiSystem.dbo.system b ON a.systemID=b.id " +
                "WHERE erpID='" + request.body.loginID + "';",
                function(recordset, error) {
                    if (error) {
                        console.log("unable to query system access rights data: " + error);
                        return response.status(500).json({
                            "authenticated": false,
                            "message": "unable to query system access rights data: " + error,
                            "systemPrivilege": []
                        });
                    }
                    console.log("user authenticated...");
                    var payload = { loginID: request.body.loginID };
                    var token = jwt.sign(payload, app.get("passphrase"), { expiresIn: 3600 });
                    return response.status(200).send(token).end();
                });
        });
    });
});

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
            "FROM upgiSystem.dbo.systemPrivilege a " +
            "INNER JOIN upgiSystem.dbo.system b ON a.systemID=b.id;";
        mssqlRequest.query(queryString).then(function(resultset) {
            mssql.close();
            console.log("網頁使用權限資料查詢成功");
            systemPrivilegeData = resultset;
        }).catch(function(error) {
            console.log("網頁使用權限資料查詢失敗：" + error);
            systemPrivilegeData = [];
        });
    });
}, null, true, "Asia/Taipei");
scheduledPrivilegeTableUpdate.start();*/