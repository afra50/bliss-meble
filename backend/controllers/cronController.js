const pool = require("../config/db");

exports.runCleanup = async (req, res) => {
  // ZABEZPIECZENIE: Sprawdzamy tajne hasło z nagłówka
  const secret = req.headers["x-cron-secret"];
  if (!secret || secret !== process.env.CRON_SECRET) {
    return res
      .status(403)
      .json({ error: "Brak uprawnień do uruchomienia zadań CRON." });
  }

  console.log("--- START CRON z mSerwis: Czyszczenie bazy ---");

  let connection; // Wynosimy zmienną poza try, aby była dostępna w finally

  try {
    connection = await pool.getConnection();

    // 1. Usuwanie nieopłaconych / anulowanych zamówień starszych niż 30 dni
    const [delOrders] = await connection.execute(`
        DELETE FROM orders 
        WHERE status IN ('waiting_payment', 'cancelled') 
        AND created_at < NOW() - INTERVAL 30 DAY
    `);

    // 2. Czyszczenie tokenów opinii (użytych lub wygasłych)
    const [delTokens] = await connection.execute(`
        DELETE FROM review_tokens 
        WHERE is_used = 1 OR expires_at <= NOW()
    `);

    // 3. Anonimizacja bardzo starych zamówień (> 6 lat)
    const [anonim] = await connection.execute(`
        UPDATE shipping_details sd
        JOIN orders o ON sd.order_id = o.id
        SET 
            sd.recipient_first_name = 'Anonim',
            sd.recipient_last_name = 'Anonim',
            sd.street = 'Zanonimizowano',
            sd.apartment = NULL,
            sd.city = 'Zanonimizowano',
            sd.postal_code = '00-000',
            sd.recipient_email = 'anonim@blissmeble.pl',
            sd.recipient_phone = '000000000',
            sd.company_name = NULL,
            sd.nip = NULL,
            sd.paczkomat_code = NULL,
            sd.notes = NULL
        WHERE o.status IN ('paid', 'packed', 'shipped', 'ready_for_pickup', 'completed')
        AND o.created_at < NOW() - INTERVAL 6 YEAR
        AND sd.recipient_first_name != 'Anonim'
    `);

    console.log("--- KONIEC CRON: Sukces ---");

    res.json({
      success: true,
      message: "Baza została wyczyszczona.",
      stats: {
        deletedOrders: delOrders.affectedRows,
        deletedTokens: delTokens.affectedRows,
        anonymizedOrders: anonim.affectedRows,
      },
    });
  } catch (error) {
    console.error("--- BŁĄD CRON ---", error);
    res.status(500).json({ error: "Wystąpił błąd podczas czyszczenia bazy." });
  } finally {
    // To miejsce wykona się ZAWSZE, nawet jeśli był błąd.
    // Dzięki temu zapobiegamy wyciekom połączeń do bazy danych.
    if (connection) {
      connection.release();
    }
  }
};
