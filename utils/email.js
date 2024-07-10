const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url, newPassword) {
        this.to = user.email;
        this.name = user.name;
        this.newPassword = newPassword;
        this.url = url;
        this.from = `Yassine Jallouli <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    //Send the actual email
    async send(template, subject) {
        //1 render HTML based on pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            name: this.name,
            url: this.url,
            subject: subject,
            newPassword: this.newPassword,
        });

        //2 define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            //text: htmlToText.fromString(html),
        };
        //3 create a transport and send the email

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'welcome to the natours family');
    }
    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Your password reset token(valid for only 10 min'
        );
    }
};
