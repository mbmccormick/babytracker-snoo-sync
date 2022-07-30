const request = require("request");
const moment = require("moment");

exports.login = async function (username, password) {
    console.log("Logging in to SNOO service.");

    return new Promise(((resolve, reject) => {
        request({
            method: "POST",
            url: "https://snoo-api.happiestbaby.com/us/login",
            json: {
                "username": username,
                "password": password
            }
        },
            function (err, response, body) {
                if (err || response.statusCode >= 400) {
                    console.error("Status Code = " + response.statusCode);

                    if (err) {
                        console.error(err);
                    }

                    if (body) {
                        console.error(body);
                    }

                    reject(err);
                    return;
                }

                var data = body;

                console.log("Login succeeded.");

                resolve(data.access_token);
            });
    }));
}

exports.getSleepData = async function (token, dateTime) {
    console.log("Fetching sleep data since " + moment(dateTime).format("MM/DD/YYYY HH:mm:ss") + " from SNOO service.");

    return new Promise(((resolve, reject) => {
        request({
            method: "GET",
            url: "https://snoo-api.happiestbaby.com/ss/v2/sessions/aggregated?startTime=" + moment(dateTime).format("MM/DD/YYYY HH:mm:ss"),
            auth: {
                bearer: token
            }
        },
            function (err, response, body) {
                if (err || response.statusCode >= 400) {
                    console.error("Status Code = " + response.statusCode);

                    if (err) {
                        console.error(err);
                    }

                    if (body) {
                        console.error(body);
                    }

                    reject(err);
                    return;
                }

                var data = JSON.parse(body);

                console.log("Fetch sleep data succeeded.");

                resolve(data);
            });
    }));
}