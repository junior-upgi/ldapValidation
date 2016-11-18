var cors = require("cors");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var ldap = require("ldapjs");
var morgan = require("morgan");
var jwt = require("jsonwebtoken");

var passphrase = "This is not a passphrase";

var serverHost = "http://localhost";
var serverPort = process.env.PORT || 9000;
var ldapServerHost = "ldap://upgi.ddns.net";
var ldapServerPort = process.env.PORT || 389;

app.use(cors()); // allow cross origin request
app.use(morgan("dev")); // log request and result to console
app.use(bodyParser.urlencoded({ extended: true })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

var loginRouter = express.Router(); //instantiate authentication router
app.use("/login", loginRouter); //apply prefix to routes

app.get("/loginFailure", function(request, response) { // serve login failure page
    response.sendFile(__dirname + "/public/loginFailure.html");
});

loginRouter.get("/status", function(request, response) { // basic route
    console.log("統義玻璃LDAP認證系統運行中...(" + serverHost + ":" + serverPort + ")");
    return response.status(200).json('{"status":"online"}');
});

loginRouter.route("/")
    .get(function(request, response) {
        console.log("送出驗證頁面...");
        response.sendFile(__dirname + "/view/login.html");
    })
    .post(function(request, response) {
        console.log("收到驗證要求...");
        console.log("request.body.loginID: " + request.body.loginID);
        console.log("request.body.system: " + request.body.system);
        var baseDN = "dc=upgi,dc=ddns,dc=net";
        var ldapClient = ldap.createClient({ url: ldapServerHost + ":" + ldapServerPort });
        ldapClient.bind("uid=" + request.body.loginID + ",ou=user," + baseDN, request.body.password, function(error) {
            if (error) {
                console.log("帳號驗證失敗：" + error);
                return response.status(403).redirect("http://localhost:9000/loginFailure");
            }
            ldapClient.unbind(function(error) {
                if (error) {
                    console.log("LDAP伺服器分離失敗：" + error);
                    return response.status(500).json({ "authenticated": false, "message": "LDAP伺服器分離失敗：" + error });
                }
                var user = { loginID: request.body.loginID };
                var token = jwt.sign(user, passphrase, { expiresIn: "1h" });
                console.log("帳號驗證成功...");
                return response.status(200).redirect("http://upgi.ddns.net:3355/seedCount?token=" + token);
            });
        });
    });

loginRouter.use(function(request, response, next) { // route middleware to verify a token
    var token = request.body.token || request.query.token || request.headers["x-access-token"]; // check for token
    if (token) { // decode token, verifies secret and checks exp
        jwt.verify(token, passphrase, function(error, decoded) {
            if (error) {
                return response.status(403).json({ success: false, message: "token驗證失敗" });
            } else { // if everything is good, save to request for use in other routes
                request.decoded = decoded;
                next();
            }
        });
    } else { // if there is no token, return an error
        return response.status(403).send({ success: false, message: "未發現token" });
    }
});

app.listen(serverPort); // start server
console.log("統義玻璃LDAP認證系統運行中...(" + serverHost + ":" + serverPort + ")");