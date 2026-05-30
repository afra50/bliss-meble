const nodemailer = require("nodemailer");

// Prosty helper do formatowania cen
const formatPrice = (price) => {
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price));
};

// Konfiguracja połączenia SMTP dla ZAMÓWIEŃ
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER_ORDERS,
    pass: process.env.EMAIL_PASS_ORDERS,
  },
});

// Zmienne wizualne marki Bliss Meble
const BRAND_COLORS = {
  brown: "#564333",
  cream: "#ede1d1",
  black: "#1d1d1b",
  slate: "#64757d",
  white: "#ffffff",
};

// URL do Twojego logo (Zakładam, że wrzucisz plik logo do folderu 'public' w swoim Reactcie)
const LOGO_URL = `${process.env.PUBLIC_FRONTEND_URL}/logo.svg`;

// Wspólna baza wrapper HTML (Nagłówek z logo i Stopka)
const getCommonLayout = (title, innerContent) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${BRAND_COLORS.black}; margin: 0; padding: 0; background-color: #fafafa; }
        .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: ${BRAND_COLORS.white}; border: 1px solid ${BRAND_COLORS.cream}; }
        .header { background-color: ${BRAND_COLORS.brown}; padding: 25px; text-align: center; }
        .content { padding: 40px 30px; line-height: 1.6; font-size: 15px; }
        .footer { background-color: ${BRAND_COLORS.brown}; padding: 30px; text-align: center; font-size: 12px; color: ${BRAND_COLORS.cream}; }
        .btn { display: inline-block; padding: 12px 24px; background-color: ${BRAND_COLORS.brown}; color: ${BRAND_COLORS.white} !important; text-decoration: none; font-weight: bold; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <img src="${LOGO_URL}" alt="BLISS MEBLE" style="max-height: 45px; display: block; margin: 0 auto; outline: none; border: none;" />
        </div>
        <div class="content">
          ${innerContent}
        </div>
        <div class="footer">
          <img src="${LOGO_URL}" alt="BLISS MEBLE" style="max-height: 25px; display: block; margin: 0 auto 15px auto; filter: grayscale(100%); opacity: 0.8; outline: none; border: none;" />
          <p style="margin: 5px 0;">&copy; 2026 BLISS MEBLE Rafał Redes. Wszystkie prawa zastrzeżone.</p>
          <p style="margin: 5px 0;">Wiadomość wygenerowana automatycznie. Prosimy na nią nie odpowiadać.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Helper do generowania tabeli produktów w mailu
const generateProductsTable = (items) => {
  const defaultImg = `${process.env.PUBLIC_FRONTEND_URL}/assets/default-product.jpg`;
  const apiUrl =
    process.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

  let rows = "";
  items.forEach((item) => {
    // 1. Zabezpieczenie na brak obrazka
    const imgUrl = item.image
      ? item.image.startsWith("http")
        ? item.image
        : `${apiUrl}/uploads/products/${item.image}`
      : defaultImg;

    // 2. BUDOWANIE KONFIGURACJI MEBLA (Obsługa stringu JSON z bazy ORAZ pól luzem z koszyka)
    let configText = "";

    // Sytuacja A: Dane pochodzą z bazy i są już zakodowane jako selected_options (tekst JSON lub obiekt)
    if (item.selected_options) {
      try {
        const config =
          typeof item.selected_options === "string"
            ? JSON.parse(item.selected_options)
            : item.selected_options;
        configText = Object.entries(config)
          .map(
            ([k, v]) =>
              `<br><small style="color: ${BRAND_COLORS.slate}; font-size: 13px;">- ${k}: <strong>${v}</strong></small>`,
          )
          .join("");
      } catch (e) {
        configText = "";
      }
    }

    // Sytuacja B: Dane idą "w locie" z koszyka (Frontend wysyła płaskie pola)
    if (!configText) {
      const options = [];
      if (item.size || item.selectedSize)
        options.push(
          `Rozmiar: <strong>${item.size || item.selectedSize}</strong>`,
        );
      if (item.fabric || item.selectedFabric)
        options.push(
          `Tkanina: <strong>${item.fabric || item.selectedFabric}</strong>`,
        );
      if (item.side || item.selectedSide)
        options.push(
          `Strona: <strong>${item.side || item.selectedSide}</strong>`,
        );
      if (item.headrest || item.selectedHeadrest)
        options.push(
          `Zagłówek: <strong>${item.headrest || item.selectedHeadrest}</strong>`,
        );

      if (options.length > 0) {
        configText = options
          .map(
            (opt) =>
              `<br><small style="color: ${BRAND_COLORS.slate}; font-size: 13px;">- ${opt}</small>`,
          )
          .join("");
      }
    }

    // 3. Pobranie poprawnej ceny (zabezpieczenie przed NaN)
    const itemPrice = Number(item.price || item.price_brut_snapshot || 0);
    const itemQty = Number(item.quantity || 1);

    rows += `
      <tr style="border-bottom: 1px dashed ${BRAND_COLORS.cream};">
        <td style="padding: 15px 0; width: 70px; vertical-align: top;">
          <img src="${imgUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border: 1px solid ${BRAND_COLORS.cream}; display: block;" />
        </td>
        <td style="padding: 15px 15px; vertical-align: top;">
          <strong style="color: ${BRAND_COLORS.black}; font-size: 15px;">${item.name}</strong> <span style="color: ${BRAND_COLORS.slate};">x${itemQty}</span>
          ${configText}
        </td>
        <td style="padding: 15px 0; text-align: right; vertical-align: top; font-weight: bold; color: ${BRAND_COLORS.black}; white-space: nowrap; font-size: 15px;">
          ${formatPrice(itemPrice * itemQty)} zł
        </td>
      </tr>
    `;
  });

  return `<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">${rows}</table>`;
};

// GŁÓWNY EKSPERT WYSYŁKI MAILI
const emailService = {
  // TYP 1: DZIĘKUJEMY ZA ZAMÓWIENIE
  sendOrderConfirmation: async (order, items, customer) => {
    let paymentInstructions = "";

    // Jeśli przelew tradycyjny - wstrzykujemy instrukcje bankowe
    if (order.payment_method === "tradycyjny") {
      paymentInstructions = `
        <div style="background-color: #fdfaf6; border: 1px solid ${BRAND_COLORS.cream}; border-left: 4px solid ${BRAND_COLORS.brown}; padding: 15px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: ${BRAND_COLORS.brown};">Dane do przelewu tradycyjnego:</h3>
          <p style="margin: 4px 0;"><strong>Odbiorca:</strong> BLISS MEBLE Rafał Redes</p>
          <p style="margin: 4px 0;"><strong>Nr konta:</strong> PL62 1020 4564 0000 5802 0414 3301</p>
          <p style="margin: 4px 0;"><strong>Bank:</strong> PKO BP</p>
          <p style="margin: 4px 0;"><strong>Kwota:</strong> ${formatPrice(order.total_brut)} zł</p>
          <p style="margin: 4px 0;"><strong>Tytuł:</strong> Zamówienie nr ${order.id}</p>
          <p style="font-size: 13px; color: ${BRAND_COLORS.slate}; margin-top: 8px;">Zamówienie zostanie przekazane do produkcji po zaksięgowaniu wpłaty.</p>
        </div>
      `;
    }

    // Tekstowe formatowanie metod dostawy i płatności
    const methodDelivery =
      order.delivery_method === "odbior"
        ? "Odbiór osobisty"
        : order.delivery_method === "paczkomat"
          ? "Paczkomat InPost 24/7"
          : "Kurier";
    const methodPayment =
      order.payment_method === "online"
        ? "Płatność online (Przelewy24)"
        : order.payment_method === "tradycyjny"
          ? "Przelew tradycyjny"
          : "Przy odbiorze";

    const htmlContent = getCommonLayout(
      "Potwierdzenie zamówienia",
      `
        <h2 style="color: ${BRAND_COLORS.brown}; margin-top: 0;">Dziękujemy za zakupy!</h2>
        <p>Witaj <strong>${customer.firstName}</strong>,</p>
        <p>Twoje zamówienie o numerze <strong>BLISS-${order.id.toString().padStart(5, "0")}</strong> zostało pomyślnie złożone i zarejestrowane w naszym systemie.</p>
        
        <h3 style="margin-top: 30px;">Podsumowanie zamówienia:</h3>
        ${generateProductsTable(items)}

        <div style="text-align: right; margin-top: 15px; font-size: 15px; padding-top: 15px;">
          Koszt dostawy: <strong>${formatPrice(order.shipping_cost)} zł</strong><br>
          <div style="margin-top: 5px; font-size: 18px;">
            Razem do zapłaty: <strong style="color: ${BRAND_COLORS.brown};">${formatPrice(order.total_brut)} zł</strong>
          </div>
        </div>

        ${paymentInstructions}

        <div style="margin-top: 30px; border-top: 2px solid ${BRAND_COLORS.cream}; padding-top: 20px;">
          <h3 style="color: ${BRAND_COLORS.brown}; margin-top: 0;">Dane odbiorcy</h3>
          <p style="margin: 4px 0;"><strong>${customer.firstName} ${customer.lastName}</strong></p>
          <p style="margin: 4px 0;">${customer.street} ${customer.apartment ? `m. ${customer.apartment}` : ""}</p>
          <p style="margin: 4px 0;">${customer.postalCode} ${customer.city}</p>
          <br>
          <p style="margin: 4px 0;"><strong>Telefon:</strong> ${customer.phone}</p>
          <p style="margin: 4px 0;"><strong>E-mail:</strong> ${customer.email}</p>
          ${customer.paczkomatCode ? `<p style="margin: 4px 0;"><strong>Wybrany Paczkomat:</strong> ${customer.paczkomatCode}</p>` : ""}
          ${
            customer.wantsInvoice
              ? customer.companyName || customer.nip
                ? `<br><p style="margin: 4px 0;"><strong>Dokument sprzedaży: Faktura na firmę</strong><br>${customer.companyName || "-"} (NIP: ${customer.nip || "-"})</p>`
                : `<br><p style="margin: 4px 0;"><strong>Dokument sprzedaży: Faktura imienna</strong><br><span style="color: ${BRAND_COLORS.slate}; font-size: 13px;">(Osoba prywatna - dane jak do wysyłki)</span></p>`
              : `<br><p style="margin: 4px 0;"><strong>Dokument sprzedaży: Paragon imienny</strong></p>`
          }
          ${customer.notes ? `<p style="margin: 10px 0 0 0; color: ${BRAND_COLORS.slate};"><em>Uwagi: ${customer.notes}</em></p>` : ""}
        </div>

        <div style="margin-top: 20px; border-top: 2px solid ${BRAND_COLORS.cream}; padding-top: 20px;">
          <h3 style="color: ${BRAND_COLORS.brown}; margin-top: 0;">Metoda dostawy i płatności</h3>
          <p style="margin: 4px 0;"><strong>Sposób dostawy:</strong> ${methodDelivery}</p>
          <p style="margin: 4px 0;"><strong>Sposób płatności:</strong> ${methodPayment}</p>
        </div>
      `,
    );

    await transporter.sendMail({
      from: `"Bliss Meble - Zamówienia" <${process.env.EMAIL_USER_ORDERS}>`,
      to: customer.email,
      subject: `Potwierdzenie zamówienia nr BLISS-${order.id.toString().padStart(5, "0")}`,
      html: htmlContent,
    });
  },

  // TYP 2: ZMIANA STATUSU ZAMÓWIENIA
  sendOrderStatusUpdate: async (order) => {
    let statusDescription = "";
    const s = order.status;

    if (s === "paid")
      statusDescription =
        "Twoje zamówienie zostało opłacone i przekazane do realizacji/produkcji.";
    else if (s === "in_delivery")
      statusDescription =
        "Twoje meble są aktualnie w trakcie realizacji na hali produkcyjnej.";
    else if (s === "packed")
      statusDescription =
        "Twoje zamówienie zostało skompletowane i zapakowane. Czeka na odbiór przez kuriera.";
    else if (s === "ready_for_pickup")
      statusDescription =
        "Twoje zamówienie jest gotowe do odbioru osobistego w naszym punkcie.";
    else if (s === "shipped")
      statusDescription =
        "Twoje zamówienie zostało wysłane! Oczekuj na kontakt od kuriera/kierowcy.";
    else if (s === "completed")
      statusDescription =
        "Zamówienie zostało pomyślnie zrealizowane i odebrane. Dziękujemy!";
    else if (s === "cancelled")
      statusDescription = "Twoje zamówienie zostało anulowane.";
    else return;

    const htmlContent = getCommonLayout(
      "Aktualizacja statusu",
      `
        <h2 style="color: ${BRAND_COLORS.brown}; margin-top: 0;">Zmiana statusu zamówienia</h2>
        <p>Dzień dobry ${order.recipient_first_name || ""},</p>
        <p>Informujemy, że zamówienie numer <strong>BLISS-${order.id.toString().padStart(5, "0")}</strong> zmieniło status na:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid ${BRAND_COLORS.slate}; font-weight: bold; font-size: 16px; margin: 20px 0;">
          ${statusDescription}
        </div>
      `,
    );

    await transporter.sendMail({
      from: `"Bliss Meble - Zamówienia" <${process.env.EMAIL_USER_ORDERS}>`,
      to: order.recipient_email,
      subject: `Aktualizacja zamówienia BLISS-${order.id.toString().padStart(5, "0")}`,
      html: htmlContent,
    });
  },

  // TYP 3: PROŚBA O OCENĘ
  // TYP 3: PROŚBA O OCENĘ
  sendReviewRequest: async (order, reviewToken) => {
    // <--- ZMIANA: Dodano parametr reviewToken
    // ZMIANA: Zbudowanie unikalnego linku z tokenem
    const reviewLink = `${process.env.PUBLIC_FRONTEND_URL}/ocen-zakupy/${reviewToken}`;

    const htmlContent = getCommonLayout(
      "Podziel się opinią",
      `
        <h2 style="color: ${BRAND_COLORS.brown}; margin-top: 0;">Twoja opinia jest dla nas ważna!</h2>
        <p>Dzień dobry ${order.recipient_first_name || ""},</p>
        <p>Twoje zamówienie <strong>BLISS-${order.id.toString().padStart(5, "0")}</strong> zostało zakończone. Mamy nadzieję, że nowe meble idealnie wpasowały się w Twoje wnętrze!</p>
        <p>Jako manufaktura Bliss Meble wkładamy serce w każdy produkt. Będziemy niezwykle wdzięczni, jeśli poświęcisz minutę na ocenienie zakupionych produktów. Pomaga nam to stale rosnąć i dbać o najwyższą jakość.</p>
        
        <div style="text-align: center; margin-top: 25px;">
            <a href="${reviewLink}" class="btn" style="background-color: #727a5e;">Oceń zakupione produkty</a>
        </div>
      `,
    );

    await transporter.sendMail({
      from: `"Bliss Meble - Zamówienia" <${process.env.EMAIL_USER_ORDERS}>`,
      to: order.recipient_email,
      subject: `Jak oceniasz swoje meble od Bliss Meble?`,
      html: htmlContent,
    });
  },
};

module.exports = emailService;
