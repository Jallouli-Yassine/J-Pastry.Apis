const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const User = require('../models/user.schema'); // Assuming you have a User model in your project

class EmailService {
  constructor() {
    // Initialize the nodemailer transporter with hardcoded values
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'yassinejalloulitech@gmail.com',
        pass: 'fjbm bplc ydda wgxr',
      },
    });
  }

  // Method to send the actual email
  async send(template, subject, user, url, randomCode, myRandomPassword) {
    try {
      // Render HTML from pug template
      const html = pug.renderFile(path.join(__dirname, 'views', `${template}.pug`), {
        name: user.firstName,
        url: url,
        subject: subject,
        randomCode: randomCode,
        myRandomPassword: myRandomPassword,
      });

      // Define email options
      const mailOptions = {
        from: {
          name: "Pastry",
          address: "yassinejalloulitech@gmail.com",
        },
        to: user.email,
        subject: subject,
        html: html,
      };

      // Create a transport and send the email
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Method to send password reset email
  async sendPasswordReset(user, url, randomCode) {
    try {
      await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)', user, url, randomCode);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Method to send random password
  async sendPassword(user, password) {
    try {
      await this.send('sendPassword', 'Your Random Password', user, null, null, password);
    } catch (error) {
      console.error('Error sending random password email:', error);
      throw new Error('Failed to send random password email');
    }
  }

  // Method to send welcome email
  async sendWelcome(user, url) {
    try {
      console.log('Sending hello email to: ', user.email);
      await this.send('welcome', 'Welcome to TeamSphere!', user, url);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  // Method to send email for user acceptance
  async sendUserAcceptance(userId) {
    try {
      const user = await User.findById(userId).exec();
      if (!user) throw new Error('User not found');

      await this.send('acceptedUser', 'Your Application has been Accepted!', user);
    } catch (error) {
      console.error('Error sending user acceptance email:', error);
      throw new Error('Failed to send user acceptance email');
    }
  }

  // Method to send email for user rejection
  async sendUserRejection(userId) {
    try {
      const user = await User.findById(userId).exec();
      if (!user) throw new Error('User not found');

      await this.send('declinedUser', 'Your Application has been Rejected!', user);
    } catch (error) {
      console.error('Error sending user rejection email:', error);
      throw new Error('Failed to send user rejection email');
    }
  }
}

module.exports = EmailService;
