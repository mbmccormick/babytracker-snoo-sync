# babytracker-snoo-sync

This is an [AWS Lambda](https://aws.amazon.com/lambda/) function written in Node.js that logs sleep sessions to the [Baby Tracker](https://apps.apple.com/app/appname/id779656557) app from [SNOO](https://happiestbaby.com/).


## Deployment

Download the latest `deploy.zip` file from the [Releases](https://github.com/mbmccormick/babytracker-snoo-sync/releases) page.

Create a new AWS Lambda Function by following the instructions here: https://docs.aws.amazon.com/lambda/latest/dg/programming-model.html and then upload the `deploy.zip` file that you downloaded.

Configure your AWS Lambda Function to use the Node.js 16.x runtime and allow for one minute timeout.

Create the following environment variables on your AWS Lambda Function:

`TIME_ZONE` - The time zone in which you are located, like `America/Chicago`. See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones for the complete list of supported options.

`SNOO_EMAIL_ADDRESS` - The email address for your SNOO account.

`SNOO_PASSWORD` - The password for your SNOO account.

`BABYTRACKER_EMAIL_ADDRESS` - The email address for your Baby Tracker account.

`BABYTRACKER_PASSWORD` - The password for your Baby Tracker account.

`BABYTRACKER_DEVICE_UUID` - Generate a random UUID and paste it here. You can use a site like https://www.guidgen.com to generate this.

Create a [CloudWatch Event](https://aws.amazon.com/cloudwatch/) that runs every hour by following the instructions here: https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/RunLambdaSchedule.html

Use the following cron expression to trigger your CloudWatch Event every hour:

`0 * * * ? *`

Configure your CloudWatch Event to trigger the AWS Lambda function that you created above.


## Usage

This Lambda function syncs the last hour of sleep sessions from SNOO into Baby Tracker.

When deployed as described above, this function will run every hour and sync sleep sessions from SNOO into Baby Tracker at the top of each hour.


## Known Issues

This function does not attempt to de-duplicate sleep sessions in Baby Tracker. Therefore, if you invoke this function multiple times in an hour, then there will be duplicate sleep sessions created in Baby Tracker.

For this reason, it is important that you configure your CloudWatch Event to run hourly.

If sleep sessions are not syncing to the Baby Tracker app for some reason or you see the error `Account has been reset. Please login again.` in your logs, generate a new UUID for the `BABYTRACKER_DEVICE_UUID`. Disconnect your mobile device(s) from the group in the Baby Tracker app. Then reconnect one device to the group, selecting the Reset Group option when reconnecting. This should clear out any sync issues and recreate the group.


## License

This software, and its dependencies, are distributed free of charge and licensed under the GNU General Public License v3. For more information about this license and the terms of use of this software, please review the `LICENSE.txt` file.

&nbsp;

Made with ❤️ for Elliana and Grady.
