const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		secure: process.env.EMAIL_SECURE === "true",
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	const mailOptions = {
		from: `Formularz Bliss Meble <${process.env.EMAIL_USER}>`,
		to: process.env.EMAIL_USER,
		replyTo: options.email,
		subject: `Nowe zapytanie: ${options.subject}`,
		text: `Masz nową wiadomość z formularza.\n\nOd: ${options.name} (${options.email})\n\nTreść wiadomości:\n${options.message}`,
	};

	await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
