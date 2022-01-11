var FCM = require('fcm-push');

var serverKey = process.env.server_KEY;
var fcm = new FCM(serverKey);


async function sendNotification(
    // to,collapse_key,data,notification
    to, description, title, data = {}
) {

    // var message = {
    //     to: to, // required fill with device token or topics
    //     collapse_key: collapse_key,
    //     data: data,
    //     notification: notification
    // };

    var message = {
        // to: to, // required fill with device token or topics
        registration_ids: to, // send mutiple notification at same time 
        notification: {
            title: `${title}`,
            body: `${description}`,
            priority: 'high',
           // click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        data:{}
    };
   
    return await fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!",err);
            return err;
        } else {
            console.log("Successfully sent with response: ", response);
            return response;
        }
    });


}


module.exports = {
    sendNotification
}
