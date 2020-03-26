# babytracker-snoo-sync

This is an [AWS Lambda](https://aws.amazon.com/lambda/) function written in Node.js that logs sleep sessions to the [Baby Tracker](https://apps.apple.com/app/appname/id779656557) app from [SNOO](https://happiestbaby.com/).


## Deployment

Upload the code for the AWS Lambda Function by following the instructions here: https://docs.aws.amazon.com/lambda/latest/dg/programming-model.html

Configure your AWS Lambda Function to use the Node.js 12.x runtime and allow for one minute timeout.

Create the following environment variables on your AWS Lambda Function:

`SNOO_EMAIL_ADDRESS` - The email address for your SNOO account.

`SNOO_PASSWORD` - The password for your SNOO account.

`BABYTRACKER_EMAIL_ADDRESS` - The email address for your Baby Tracker account.

`BABYTRACKER_PASSWORD` - The password for your Baby Tracker account.

`BABYTRACKER_DEVICE_UUID` - Generate a random UUID and paste it here. You can use a site like https://www.guidgen.com to generate this.

Create a [CloudWatch Event](https://aws.amazon.com/cloudwatch/) that runs every 24 hours by following the instructions here: https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/RunLambdaSchedule.html

The following cron expression will trigger a CloudWatch Event everyday at 17:00 UTC:

`0 17 * * ? *`

Configure your CloudWatch Event to trigger your AWS Lambda function.


## Usage

This Lambda function syncs the last 24 hours of sleep sessions from SNOO into Baby Tracker.

When deployed as described above, this function will run every 24 hours and sync sleep sessions from SNOO into Baby Tracker on a daily basis.


## Known Issues

This function does not attempt to de-duplicate sleep sessions in Baby Tracker. Therefore, if you invoke this function multiple times, then there will be duplicate sleep sessions created in Baby Tracker.

For this reason, it is important that you configure your CloudWatch Event to run at a 24 hour interval.


## License

This software, and its dependencies, are distributed free of charge and licensed under the GNU General Public License v3. For more information about this license and the terms of use of this software, please review the `LICENSE.txt` file.

&nbsp;

Made with ❤️ for Elliana.
