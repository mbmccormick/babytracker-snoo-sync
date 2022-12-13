const snoo = require("./snoo.js");
const babyTracker = require("./babyTracker.js");

const moment = require("moment-timezone");
const jsonata = require("jsonata");

moment.tz.setDefault(process.env.TIME_ZONE);

function combineSleepSessions(data) {
    var expression = jsonata(
       `({
            \`sessionId\`: {
                "startTime": (startTime)[0],
                "isActive": $boolean($max($map(isActive, $number))),
                "durations": {
                    "total": $sum(stateDuration),
                    \`type\`: $sum(stateDuration)
                }
            }
        }).$map($keys(), function($v, $i, $a) {
        {
            "sessionId": $v,
            "startTime": $.*[$i].startTime,
            "isActive": $.*[$i].isActive,
            "durations": $.*[$i].durations
        }
        })[]`
    );
    
    var result = expression.evaluate(data);

    return result;
}

async function getSleeps(token, syncInterval) {
    var syncTime = moment();

    // get all sleep sessions for the last 12 hours
    var sessions = (await snoo.getSleepData(token, moment(syncTime).subtract(12, "hours"))).levels;

    // combine all sleep session levels into individual sleep sessions
    var data = combineSleepSessions(sessions);

    var sleeps = [];

    for (var i = 0; i < data.length; i++) {
        var sleep = data[i];

        // ignore active sleep sessions, these will be synced later
        if (sleep.isActive) {
            continue;
        }
        
        // compute the sleep session end time, based on start time and duration
        var sleepEndTime = moment(sleep.startTime).add(sleep.durations.total, "seconds");

        // if the sleep session ended during this last last sync interval, add it to the result
        if (sleepEndTime >= (syncTime - syncInterval)) {
            sleeps.push(sleep);
        }
    }

    return sleeps;
}

exports.handler = async function (event, context, callback) {
    console.log("Received event:");
    console.log(event);

    // login to the SNOO service
    var token = await snoo.login(process.env.SNOO_EMAIL_ADDRESS, process.env.SNOO_PASSWORD);

    var syncInterval = moment.duration(1, "hours");

    // fetch sleep sessions from SNOO
    var sleeps = await getSleeps(token, syncInterval);

    console.log("Found " + sleeps.length + " completed sleep sessions since last synchronization.");

    if (sleeps.length > 0) {
        // login to the Baby Tracker service
        await babyTracker.login(process.env.BABYTRACKER_EMAIL_ADDRESS, process.env.BABYTRACKER_PASSWORD, process.env.BABYTRACKER_DEVICE_UUID);

        for (var i = 0; i < sleeps.length; i++) {
            var sleep = sleeps[i];

            var note = "Logged from SNOO.";
            if (sleep.durations.soothing > 0)
                note += " Soothed for " + moment.duration(sleep.durations.soothing, "seconds").humanize() + ".";

            // post a new sleep record to Baby Tracker
            await babyTracker.createSleep(sleep.startTime, (sleep.durations.total / 60), note);
        }
    }

    console.log("Completed.");
};
