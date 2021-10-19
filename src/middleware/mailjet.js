const mailjet = require('node-mailjet').connect(
    process.env.APIKEY_PUBLIC, 
    process.env.APIKEY_PRIVATE
);

const sendWelcomeEmail = async function(email, name) {
    await mailjet.post("send", {'version': 'v3.1'}).request({
        "Messages":[
            {
              "From": {
                "Email": "jishanul.dev@gmail.com",
                "Name": "S M Jishanul Islam"
              },
              "To": [
                {
                  "Email": email,
                  "Name": name
                }
              ],
              "Subject": "Welcome to the task app 🥳",
              "TextPart": "Your first mail ",
              "HTMLPart": `<h3>Dear ${name}, welcome to Task App!</h3><br/>May your day become organized as you want it to be!`,
              "CustomID": "AppGettingStartedTest"
            }
        ]
    })
}

const sendGoodbyeEmail = async function(email, name) {
    await mailjet.post("send", {'version': 'v3.1'}).request({
        "Messages":[
            {
              "From": {
                "Email": "jishanul.dev@gmail.com",
                "Name": "S M Jishanul Islam"
              },
              "To": [
                {
                  "Email": email,
                  "Name": name
                }
              ],
              "Subject": "Goodbye 😢",
              "TextPart": "Your last mail",
              "HTMLPart": `<h3>Dear ${name}, we are really sorry to see you go!</h3><br/>Hope this app has helped you have become organized as you want it to be!`,
              "CustomID": "AppGettingStartedTest"
            }
        ]
    })
}

module.exports = {
    mailjet,
    sendWelcomeEmail,
    sendGoodbyeEmail
};