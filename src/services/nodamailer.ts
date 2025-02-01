import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'blockbusterasesinadopormaduro@gmail.com',
    pass: 'jnkc xeei sedk ckim'
  }

})

void transporter.verify().then(() => {
  console.log('ready for send emails')
})
