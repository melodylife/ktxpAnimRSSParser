#!/usr/local/bin/node

var sendmail = require('nodemailer');
var mailacct = require('../configuration/mailacct');



var transporter = new sendmail.createTransport({
  service: 'Gmail',
  auth: {
    user: mailacct.user,
    pass: mailacct.pwd
  }
});

var mailOptions = {
    from: 'Chang\'s App <hangapp@gmail.com>',// sender address
    to: 'goodeffort2003@gmail.com', // list of receivers
    subject: 'Hello', // Subject line
    text: 'Hello world', // plaintext body
    html: '<b>Hello world ✔</b>' // html body
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});
