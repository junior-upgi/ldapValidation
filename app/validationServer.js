var cors = require("cors");
var CronJob = require("cron").CronJob;
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var ldap = require("ldapjs");
var morgan = require("morgan");
var moment = require("moment-timezone");
var jwt = require("jsonwebtoken");
var config = require("./model/config.js");
var mssql = require("mssql");


app.set("view engine", "ejs");
app.set("passphrase", config.passphrase());

app.use(cors()); // allow cross origin request
app.use(morgan("dev")); // log request and result to console
app.use(bodyParser.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

var mssqlConfig = {
    //server: "upgi.ddns.net", // access database from the Internet (development)
    server: "192.168.168.5", // access database from LAN (production)
    user: "upgiSystem",
    password: "upgiSystem"
};

var websitePrivilegeData = [];
mssql.connect(mssqlConfig).then(function() { // fetch data from server
    var mssqlRequest = new mssql.Request();
    var queryString = "SELECT a.erpID,a.systemID,b.cReference FROM upgiSystem.dbo.websitePrivilege a INNER JOIN upgiSystem.dbo.system b ON a.systemID=b.id;";
    mssqlRequest.query(queryString).then(function(resultset) {
        mssql.close();
        console.log("網頁使用權限資料查詢成功");
        websitePrivilegeData = resultset;
    }).catch(function(error) {
        console.log("網頁使用權限資料查詢失敗：" + error);
        websitePrivilegeData = [];
    });
});

app.get("/", function(request, response) { // takes the user to UPGI portal page
    return response.status(200).render("portal");
});

app.get("/status", function(request, response) { // route that provides status verification
    console.log("統義玻璃 LDAP 認證系統運行中...(" + config.serverHost + ":" + config.serverPort + ")");
    return response.status(200).json('{"status":"online"}');
});

app.get("/loginFailure", function(request, response) { // serve login failure page
    response.render("loginFailure");
});

app.route("/login") // login related routes
    .get(function(request, response) { // supply user with a login page
        return response.render("login", { registeredWebsiteList: websitePrivilegeData });
    })
    .post(function(request, response) { // route that verifies a login request and supplies token when successful
        console.log("收到驗證要求...");
        console.log(request.body);
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
                    return response.status(500).json({ "authenticated": false, "message": "LDAP 伺服器分離失敗：" + error });
                }
                console.log("帳號驗證成功...");
                mssql.connect(mssqlConfig).then(function() { // continue to check if user has rights to access the website of the system selected
                    var queryString = "SELECT systemID FROM upgiSystem.dbo.websitePrivilege WHERE erpID='" +
                        request.body.loginID + "';"
                    var mssqlRequest = new mssql.Request();
                    mssqlRequest.query(queryString).then(function(resultset) {
                        mssql.close();
                        console.log(resultset);
                        if (resultset[0].hasAccess !== 1) {
                            console.log("使用者無權使用該系統網頁");
                            return response.status(403).redirect(config.serverHost + ":" + config.serverPort + "/loginFailure");
                        }
                        console.log("使用者系統權限認證成功");
                        var payload = { loginID: request.body.loginID };
                        var expiration = moment(moment(), "YYYY-MM-DD HH:mm:ss").add(1, 'hours').format("YYYY-MM-DD HH:mm:ss");
                        var token = jwt.sign(payload, app.get("passphrase"), { expiresIn: 3600 });
                        console.log("token 失效時間： " + expiration);
                        return response.status(200).json({
                            token: token,
                            expiration: expiration
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
console.log("統義玻璃 LDAP 認證系統運行中...(" + config.serverHost + ":" + config.serverPort + ")");

var scheduledPrivilegeTableUpdate = new CronJob("0 * * * * *", function() { // periodically updates the privilege data
    var currentDatetime = moment(moment(), "YYYY-MM-DD HH:mm:ss");
    console.log(currentDatetime.format("YYYY-MM-DD HH:mm:ss") + " 更新");
    mssql.connect(mssqlConfig).then(function() { // fetch data from server
        var queryString = "SELECT a.erpID,a.systemID,b.cReference FROM upgiSystem.dbo.websitePrivilege a INNER JOIN upgiSystem.dbo.system b ON a.systemID=b.id;";
        var mssqlRequest = new mssql.Request();
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