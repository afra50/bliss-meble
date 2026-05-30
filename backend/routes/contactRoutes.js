const express = require("express");
const { z } = require("zod"); // 1. Importujemy Zoda
const sendEmail = require("../utils/email");

const router = express.Router();

// 2. Tworzymy pancerne zasady walidacji dla formularza
const contactSchema = z.object({
  name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki."),
  email: z.string().email("Proszę podać poprawny adres e-mail."),
  // transform i optional: jeśli klient nie poda tematu, wstawiamy domyślny tekst
  subject: z
    .string()
    .optional()
    .transform((val) => (val ? val : "Brak tematu")),
  message: z
    .string()
    .min(10, "Wiadomość jest za krótka. Napisz nam coś więcej!"),
});

router.post("/", async (req, res) => {
  try {
    // 3. Zod sprawdza, czy to co przyszło (req.body) zgadza się ze schematem
    const parsed = contactSchema.safeParse(req.body);

    // 4. Jeśli weryfikacja się nie powiedzie, od razu odsyłamy błąd z ładnym komunikatem
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0].message, // Wyciągamy nasz polski komunikat błędu z Zoda
      });
    }

    // 5. Jeśli wszystko jest super, wyciągamy CZYSTE i ZWALIDOWANE dane
    const { name, email, subject, message } = parsed.data;

    // 6. Odpalamy wysyłkę
    await sendEmail({
      name,
      email,
      subject,
      message,
    });

    // 7. Sukces!
    res.status(200).json({
      success: true,
      message: "Wiadomość została wysłana pomyślnie!",
    });
  } catch (error) {
    console.error("Błąd wysyłania emaila z formularza:", error);
    res.status(500).json({
      success: false,
      message:
        "Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.",
    });
  }
});

module.exports = router;
