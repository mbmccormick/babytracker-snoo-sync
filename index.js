const snoo = require("./snoo.js");
const babyTracker = require("./babyTracker.js");

const moment = require("moment-timezone");

moment.tz.setDefault("America/Los_Angeles");

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

async function getSleeps(token, duration) {
    var days = duration.asDays();

    var endDate = moment();
    var startDate = moment(endDate - duration);
    
    var sessions = [];
    for (var i = 0; i <= days; i++) {
        sessions = sessions.concat((await snoo.getSleepData(token, moment(startDate).add(i, "days"))).levels);
    }

    var data = combineSleepSessions(sessions);

    var sleeps = [];

    for (var i = 0; i < data.length; i++) {
        var sleepEndTime = moment(data[i].startTime).add(data[i].duration, "seconds");

        if (sleepEndTime.isSameOrAfter(startDate) &&
            sleepEndTime.isSameOrBefore(endDate)) {
            sleeps.push(data[i]);
        }
    }

    return sleeps;
}

exports.handler = async function (event, context, callback) {
    console.log("Beginning synchronization.");

    var token = await snoo.login(process.env.SNOO_EMAIL_ADDRESS, process.env.SNOO_PASSWORD);

    var duration = moment.duration(24, "hours");
    
    var sleeps = await getSleeps(token, duration);

    await babyTracker.login(process.env.BABYTRACKER_EMAIL_ADDRESS, process.env.BABYTRACKER_PASSWORD, process.env.BABYTRACKER_DEVICE_UUID);

    for (var i = 0; i < sleeps.length; i++) {
        var sleep = sleeps[i];

        await babyTracker.createSleep(sleep.startTime, (sleep.duration / 60), "Logged from SNOO.");
    }

    console.log("Completed.");
};
