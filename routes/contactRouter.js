const express = require('express');
const app = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

app.get('/', (req, res)=>{
    res.send({msg:"SEND CONTACT USING POST"})
})

app.post('/',(req,res)=> {
    const {name, email, message, subject} = req.body
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAIL,
          pass: process.env.PASS
        }
      });
      
      var mailOptions = {
        from: email,
        to: 'muhaymien96@gmail.com',
        subject: `${subject}`,
        text: `Name: ${name}
Email: ${email}
Contacted You With The Below Message
    ${message}
              `
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          res.status(400).send({msg : "Email could not be sent" + error})
        } else {
          console.log('Email sent: ' + info.response);
          res.send({msg: "Message sent succesfully"})
        }
      });
})

module.exports = app;