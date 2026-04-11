const express = require("express");
const sendEmail = require("../utils/email"); // Wołamy naszego listonosza z Kroku 2

const router = express.Router();

// Gdy ktoś wyśle formularz, uruchamia się ten kod:
router.post("/", async (req, res) => {
	try {
		// 1. Zbieramy to, co klient wpisał w formularzu
		const { name, email, subject, message } = req.body;

		// 2. Sprawdzamy, czy klient nie wysłał pustych pól
		if (!name || !email || !message) {
			return res.status(400).json({
				success: false,
				message: "Proszę wypełnić wszystkie wymagane pola.",
			});
		}

		// 3. Odpalamy wysyłkę (nasz plik email.js)
		await sendEmail({
			name,
			email,
			subject: subject || "Brak tematu",
			message,
		});

		// 4. Jeśli się udało, dajemy znać stronie, żeby wyświetliła zielony komunikat
		res.status(200).json({
			success: true,
			message: "Wiadomość została wysłana pomyślnie!",
		});
	} catch (error) {
		console.error("Błąd wysyłania emaila:", error);
		// Jeśli coś gruchnie, strona dostanie błąd
		res.status(500).json({
			success: false,
			message:
				"Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.",
		});
	}
});

module.exports = router;
