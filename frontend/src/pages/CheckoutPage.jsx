import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";
import { settingApi } from "../utils/api";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import Button from "../components/ui/Button";
import ToastAlert from "../components/ui/ToastAlert";
import Loader from "../components/ui/Loader";
import { FaInfoCircle } from "react-icons/fa";

import "../styles/pages/checkout-page.scss";

const CheckoutPage = () => {
  const { cartItems, cartTotal } = useCart();
  const navigate = useNavigate();

  // --- STANY ---
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({
    isOpen: false,
    message: "",
    type: "error",
  });

  const [shippingCostsDB, setShippingCostsDB] = useState({
    courierCost: 55,
    lockerCost: 50,
  });
  const [deliveryMethod, setDeliveryMethod] = useState("kurier");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    street: "",
    apartment: "",
    postalCode: "",
    city: "",
    phone: "",
    email: "",
    companyName: "",
    nip: "",
    notes: "",
    paczkomatCode: "",
  });

  // --- LOGIKA BIZNESOWA ---
  const hasFurniture = cartItems.some(
    (item) =>
      item.category_name !== "Dodatki" && item.subcategory_name !== "Dodatki",
  );

  useEffect(() => {
    const fetchCosts = async () => {
      try {
        setIsLoading(true);
        const response = await settingApi.getShippingCosts();
        setShippingCostsDB({
          courierCost: Number(response.data.courierCost),
          lockerCost: Number(response.data.lockerCost),
        });
      } catch (error) {
        console.error("Błąd pobierania kosztów wysyłki:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCosts();
  }, []);

  useEffect(() => {
    if (hasFurniture && deliveryMethod === "paczkomat") {
      setDeliveryMethod("kurier");
    }
    if (deliveryMethod !== "odbior" && paymentMethod === "odbior") {
      setPaymentMethod("online");
    }
  }, [hasFurniture, deliveryMethod, paymentMethod]);

  let shippingCost = 0;
  if (!hasFurniture) {
    if (deliveryMethod === "kurier") shippingCost = shippingCostsDB.courierCost;
    if (deliveryMethod === "paczkomat")
      shippingCost = shippingCostsDB.lockerCost;
  }

  const finalTotal = cartTotal + shippingCost;
  const vatAmount = finalTotal - finalTotal / 1.23;

  const showErrorToast = (message) => {
    setToast({ isOpen: true, message, type: "error" });
  };

  // --- HANDLERY ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      showErrorToast("Musisz zaakceptować regulamin i politykę prywatności.");
      return;
    }

    const hasCompany = formData.companyName.trim().length > 0;
    const hasNip = formData.nip.trim().length > 0;

    if ((hasCompany && !hasNip) || (!hasCompany && hasNip)) {
      showErrorToast(
        "Aby otrzymać fakturę na firmę, musisz podać ZARÓWNO NIP, jak i Nazwę firmy.",
      );
      return;
    }

    const orderData = {
      items: cartItems,
      customer: formData,
      deliveryMethod,
      paymentMethod,
      shippingCost,
      totalAmount: finalTotal,
    };

    // Tymczasowe przejście do podsumowania (zamiast wysyłania do API)
    navigate("/zamowienie/podsumowanie", { state: { orderData } });

    // Opcjonalnie: wyczyść koszyk tutaj lub na stronie podsumowania
    clearCart();
  };

  if (isLoading) {
    return (
      <main
        className="checkout-page"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Loader message="Przygotowujemy podsumowanie..." />
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-page__container">
          <div className="checkout-page__empty">
            <h2>Twój koszyk jest pusty.</h2>
            <Button
              variant="primary"
              onClick={() => navigate("/sklep")}
              className="empty-btn"
            >
              Wróć do sklepu
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <ToastAlert
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />

      <div className="checkout-page__container">
        <CheckoutStepper currentStep={2} />

        <form className="checkout-page__layout" onSubmit={handleSubmit}>
          <div className="checkout-page__form-container">
            <section className="form-section">
              <h3>Sposób dostawy</h3>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="delivery"
                    value="odbior"
                    checked={deliveryMethod === "odbior"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  />
                  Odbiór osobisty{" "}
                  <span className="price price--free">0,00 zł</span>
                </label>

                {!hasFurniture && (
                  <>
                    <label>
                      <input
                        type="radio"
                        name="delivery"
                        value="paczkomat"
                        checked={deliveryMethod === "paczkomat"}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                      />
                      Paczkomaty InPost 24/7{" "}
                      <span className="price">
                        {formatPrice(shippingCostsDB.lockerCost)} zł
                      </span>
                    </label>

                    {deliveryMethod === "paczkomat" && (
                      <div
                        className="form-group"
                        style={{
                          marginLeft: "30px",
                          marginTop: "-5px",
                          marginBottom: "10px",
                        }}
                      >
                        <label className="form-group__label">
                          Kod paczkomatu <span>*</span>
                        </label>
                        <input
                          className="form-group__input"
                          type="text"
                          name="paczkomatCode"
                          placeholder="Np. WAW123M"
                          value={formData.paczkomatCode}
                          onChange={handleInputChange}
                          required={deliveryMethod === "paczkomat"}
                        />
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            marginTop: "4px",
                          }}
                        >
                          Wpisz kod paczkomatu, do którego mamy wysłać
                          zamówienie.
                        </span>
                      </div>
                    )}
                  </>
                )}

                <label>
                  <input
                    type="radio"
                    name="delivery"
                    value="kurier"
                    checked={deliveryMethod === "kurier"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                  />
                  Kurier
                  <span
                    className={`price ${hasFurniture ? "price--free" : ""}`}
                  >
                    {hasFurniture
                      ? "0,00 zł (Darmowa dostawa)"
                      : `${formatPrice(shippingCostsDB.courierCost)} zł`}
                  </span>
                </label>
              </div>
            </section>

            <section className="form-section">
              <h3>Dane odbiorcy</h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-group__label">
                    Imię <span>*</span>
                  </label>
                  <input
                    className="form-group__input"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-group__label">
                    Nazwisko <span>*</span>
                  </label>
                  <input
                    className="form-group__input"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-group__label">
                    Ulica i numer domu <span>*</span>
                  </label>
                  <input
                    className="form-group__input"
                    type="text"
                    name="street"
                    placeholder="Np. Słoneczna 62"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Numer mieszkania</label>
                  <input
                    className="form-group__input"
                    type="text"
                    name="apartment"
                    placeholder="(opcjonalnie)"
                    value={formData.apartment}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-group__label">
                    Kod pocztowy <span>*</span>
                  </label>
                  <input
                    className="form-group__input"
                    type="text"
                    name="postalCode"
                    placeholder="00-000"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-group__label">
                    Miasto <span>*</span>
                  </label>
                  <input
                    className="form-group__input"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-group__label">
                    Numer telefonu <span>*</span>
                  </label>
                  <input
                    className="form-group__input"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-group__label">
                    Adres e-mail <span>*</span>
                  </label>
                  <input
                    className="form-group__input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="custom-checkbox" style={{ marginTop: "20px" }}>
                <input
                  type="checkbox"
                  id="wantsInvoice"
                  checked={wantsInvoice}
                  onChange={(e) => setWantsInvoice(e.target.checked)}
                />
                <label htmlFor="wantsInvoice">Chcę otrzymać fakturę</label>
              </div>

              {wantsInvoice && (
                <div className="invoice-box">
                  <div className="info-text">
                    <FaInfoCircle className="info-icon" />
                    Faktura zostanie wystawiona na powyższy adres. Jeśli
                    potrzebujesz faktury na firmę, wpisz dane poniżej.
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-group__label">Nazwa firmy</label>
                      <input
                        className="form-group__input"
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required={wantsInvoice}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-group__label">NIP</label>
                      <input
                        className="form-group__input"
                        type="text"
                        name="nip"
                        value={formData.nip}
                        onChange={handleInputChange}
                        required={wantsInvoice}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="form-section">
              <h3>Informacje dodatkowe</h3>
              <div className="form-group">
                <label className="form-group__label">
                  Uwagi do zamówienia (opcjonalne)
                </label>
                <textarea
                  className="form-group__input"
                  name="notes"
                  rows="4"
                  placeholder="Przekaż swoją wiadomość..."
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
            </section>

            <section className="form-section">
              <h3>Metoda płatności</h3>
              <div className="radio-group">
                {/* --- PŁATNOŚĆ ONLINE --- */}
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Płatność online (BLIK, szybki przelew, karta) – przez
                  Przelewy24
                </label>
                {paymentMethod === "online" && (
                  <div className="radio-info-box">
                    <FaInfoCircle className="info-icon" />
                    <span>
                      Zostaniesz przekierowany do szybkiej płatności
                      internetowej. Obsługiwane są m.in. BLIK, przelewy
                      ekspresowe.
                    </span>
                  </div>
                )}

                {/* --- PRZELEW TRADYCYJNY --- */}
                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="tradycyjny"
                    checked={paymentMethod === "tradycyjny"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Przelew tradycyjny (samodzielna wpłata na konto po złożeniu
                  zamówienia)
                </label>
                {paymentMethod === "tradycyjny" && (
                  <div className="radio-info-box">
                    <FaInfoCircle className="info-icon" />
                    <span>
                      Po złożeniu zamówienia otrzymasz dane do przelewu. Wyślemy
                      je także na Twój adres e-mail.
                    </span>
                  </div>
                )}

                {/* --- PŁATNOŚĆ PRZY ODBIORZE --- */}
                {deliveryMethod === "odbior" && (
                  <label>
                    <input
                      type="radio"
                      name="payment"
                      value="odbior"
                      checked={paymentMethod === "odbior"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    Płatność przy odbiorze
                  </label>
                )}
              </div>
            </section>
          </div>

          <aside className="checkout-page__summary">
            <div className="summary-box">
              <h3 className="summary-box__title">TWOJE ZAMÓWIENIE</h3>

              <div className="summary-box__items">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="summary-item">
                    <img src={item.image} alt={item.name} />
                    <div className="info">
                      <h4>{item.name}</h4>
                      <p>Ilość: {item.quantity}</p>

                      {/* NOWOŚĆ: Uwzględniamy wyświetlanie strony narożnika (item.side) */}
                      {(item.fabric || item.size || item.side) && (
                        <p>
                          {item.fabric}
                          {item.size ? ` | ${item.size}` : ""}
                          {item.side ? ` | Strona: ${item.side}` : ""}
                        </p>
                      )}
                    </div>
                    <div className="price">
                      {formatPrice(item.price * item.quantity)} zł
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-box__row">
                <span>Produkty:</span>
                <span>{formatPrice(cartTotal)} zł</span>
              </div>
              <div className="summary-box__row">
                <span>Dostawa:</span>
                <span>
                  {shippingCost === 0
                    ? "0,00 zł"
                    : `${formatPrice(shippingCost)} zł`}
                </span>
              </div>

              <div className="summary-box__total">
                <span>RAZEM:</span>
                <div className="total-price">
                  <strong className="price-nowrap">
                    {formatPrice(finalTotal)} zł
                  </strong>
                  <small>(w tym {formatPrice(vatAmount)} zł VAT)</small>
                </div>
              </div>

              <div
                className="custom-checkbox"
                style={{ marginTop: "25px", alignItems: "flex-start" }}
              >
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                />
                <label
                  htmlFor="terms"
                  style={{ fontSize: "0.85rem", lineHeight: "1.5" }}
                >
                  Oświadczam, że zapoznałem/am się i akceptuję{" "}
                  <a
                    href="/regulamin.pdf"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#7a5c43", fontWeight: "600" }}
                  >
                    Regulamin
                  </a>{" "}
                  oraz{" "}
                  <a
                    href="/polityka_prywatnosci.pdf"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#7a5c43", fontWeight: "600" }}
                  >
                    Politykę prywatności
                  </a>
                  . *
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="summary-box__btn"
              >
                KUPUJĘ I PŁACĘ
              </Button>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default CheckoutPage;
