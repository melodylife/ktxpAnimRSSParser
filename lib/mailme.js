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
    from: 'Chang\'s App <changapp@gmail.com>',// sender address
    to: 'goodeffort2003@gmail.com', // list of receivers
    subject: 'Donwload is done', // Subject line
    html: '<b>An animation downloading is done...</b>' // html body
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});
