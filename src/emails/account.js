const sgMailLib = require('@sendgrid/mail');

sgMailLib.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    return sgMailLib.send({
        to: email,
        from: 'astritdemiri11@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    });
};

const sendCancellationEmail = (email, name) => {
    return sgMailLib.send({
        to: email,
        from: 'astritdemiri11@gmail.com',
        subject: 'Upset to see you leave!',
        text: `Goodbye ${name}. Is anything we could have done to keep you on board?`
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
};