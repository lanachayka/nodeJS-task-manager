const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENGRIN_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ruslana.chaikivska@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
};

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ruslana.chaikivska@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Googbye, ${name}. I hope to see you back sometime soon.`
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
};