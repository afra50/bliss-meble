const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Logowanie do dedykowanej skrzynki kontaktowej
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER_CONTACT, // <--- ZMIANA
      pass: process.env.EMAIL_PASS_CONTACT, // <--- ZMIANA
    },
  });

  // 2. Konfiguracja samej wiadomości
  const mailOptions = {
    from: `Formularz Bliss Meble <${process.env.EMAIL_USER_CONTACT}>`, // <--- ZMIANA
    to: process.env.EMAIL_USER_CONTACT, // <--- ZMIANA (Wysyła maila na Twoją własną skrzynkę)
    replyTo: options.email, // Dzięki temu, gdy klikniesz "Odpowiedz" w swoim programie pocztowym, odpiszesz klientowi
    subject: `Nowe zapytanie: ${options.subject}`,
    text: `Masz nową wiadomość z formularza.\n\nOd: ${options.name} (${options.email})\n\nTreść wiadomości:\n${options.message}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
