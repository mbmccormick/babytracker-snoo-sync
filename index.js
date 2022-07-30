const snoo = require("./snoo.js");
const babyTracker = require("./babyTracker.js");

const moment = require("moment-timezone");

moment.tz.setDefault(process.env.TIME_ZONE);

function combineSleepSessions(data) {
    var sleeps = [];

    for (var i = 0; i < data.length; i++) {
        var session = data[i];

        var exists = false;

        for (var j = 0; j < sleeps.length; j++) {
            var sleep = sleeps[j];

            if (sleep.sessionId == session.sessionId) {
                exists = true;
                break;
            }
        }

        if (exists) {
            sleeps[j].duration += session.stateDuration;

            if (session.startTime < sleeps[j].startTime) {
                sleeps[j].startTime = session.startTime;
            }
        }
        else {
            sleeps[j] = {
                sessionId: session.sessionId,
                startTime: session.startTime,
                duration: (session.isActive ? 0 : session.stateDuration)
            };
        }
    }

    return sleeps;
}

async function getSleeps(token, syncInterval) {
    var syncTime = moment();

    // get all sleep sessions for the last 24 hours
    var sessions = (await snoo.getSleepData(token, moment(syncTime).subtract(24, "hours"))).levels;

    // combine all sleep session levels into individual sleep sessions
    var data = combineSleepSessions(sessions);

    var sleeps = [];

    for (var i = 0; i < data.length; i++) {
        var sleep = data[i];

        // ignore active sleep sessions, these will be synced later
        if (sleep.duration == 0) {
            continue;
        }
        
        var sleepEndTime = moment(sleep.startTime).add(sleep.duration, "seconds");

        if (sleepEndTime >= (syncTime - syncInterval)) {
            sleeps.push(sleep);
        }
    }

    return sleeps;
}

exports.handler = async function (event, context, callback) {
    console.log("Received event:");
    console.log(event);

    var token = await snoo.login(process.env.SNOO_EMAIL_ADDRESS, process.env.SNOO_PASSWORD);

    var syncInterval = moment.duration(1, "hours");

    var sleeps = await getSleeps(token, syncInterval);

    if (sleeps.length > 0) {
        await babyTracker.login(process.env.BABYTRACKER_EMAIL_ADDRESS, process.env.BABYTRACKER_PASSWORD, process.env.BABYTRACKER_DEVICE_UUID);

        for (var i = 0; i < sleeps.length; i++) {
            var sleep = sleeps[i];

            await babyTracker.createSleep(sleep.startTime, (sleep.duration / 60), "Logged from SNOO.");
        }
    }

    console.log("Completed.");
};