import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle,
  Info,
  CreditCard,
  Truck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Button from "../components/ui/Button";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import { orderApi } from "../utils/api";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";

import "../styles/pages/order-summary.scss";

const OrderSummary = () => {
  const { token } = useParams(); // Pobieramy token UUID z linku
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Referencja zapobiegająca wielokrotnemu czyszczeniu koszyka
  const cartClearedRef = useRef(false);

  useEffect(() => {
    let intervalId = null;

    const fetchOrder = async () => {
      try {
        const response = await orderApi.getOrderByToken(token);
        const orderData = response.data;
        setOrder(orderData);
        setIsLoading(false);

        // BEZPIECZNE CZYSZCZENIE KOSZYKA
        if (!cartClearedRef.current) {
          if (orderData.payment_method !== "online") {
            // Przelew tradycyjny lub pobranie - czyścimy od razu
            clearCart();
            cartClearedRef.current = true;
          } else if (orderData.status === "paid") {
            // Online - czyścimy dopiero gdy P24 potwierdzi wpłatę
            clearCart();
            cartClearedRef.current = true;
            if (intervalId) clearInterval(intervalId); // Zatrzymujemy odświeżanie
          }
        } else if (orderData.status === "paid" && intervalId) {
          clearInterval(intervalId); // Zatrzymujemy odświeżanie, jeśli już zapłacono
        }
      } catch (err) {
        console.error("Błąd pobierania podsumowania:", err);
        setError(
          "Nie odnaleziono danych zamówienia lub link jest nieprawidłowy.",
        );
        setIsLoading(false);
        if (intervalId) clearInterval(intervalId);
      }
    };

    fetchOrder(); // Pierwsze pobranie po wejściu na stronę

    // Mechanizm Polling - jeśli to płatność online, odpytuj bazę co 3 sekundy
    intervalId = setInterval(() => {
      fetchOrder();
    }, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [token, clearCart]);

  if (isLoading) {
    return (
      <main className="order-summary">
        <div
          className="order-summary__container"
          style={{ textAlign: "center", padding: "100px 0" }}
        >
          <Loader2
            className="animate-spin"
            size={48}
            color="#7a5c43"
            style={{ margin: "0 auto 20px" }}
          />
          <h2>Weryfikujemy status zamówienia...</h2>
          <p>Prosimy nie odświeżać strony.</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-summary order-summary--error">
        <div
          className="order-summary__container"
          style={{ textAlign: "center", padding: "100px 0" }}
        >
          <AlertTriangle
            size={64}
            color="#dc2626"
            style={{ margin: "0 auto 20px" }}
          />
          <h2>{error || "Brak danych"}</h2>
          <Link
            to="/sklep"
            style={{ display: "inline-block", marginTop: "20px" }}
          >
            <Button variant="primary">Wróć do sklepu</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="order-summary">
      <div className="order-summary__container">
        <CheckoutStepper currentStep={3} />

        <div className="order-summary__card">
          {/* PRZYPADEK 1: OPŁACONE ONLINE */}
          {order.status === "paid" ? (
            <>
              <CheckCircle className="success-icon" size={80} color="#16a34a" />
              <h1>Dziękujemy za zamówienie nr {order.id}!</h1>
              <p className="order-number">
                Płatność została potwierdzona. Twoje zamówienie zostało przyjęte
                do realizacji.
              </p>
            </>
          ) : order.payment_method === "online" ? (
            /* PRZYPADEK 2: OCZEKUJE NA POTWIERDZENIE Z P24 */
            <>
              <CreditCard className="success-icon" size={80} color="#f59e0b" />
              <h1>Oczekujemy na płatność</h1>
              <p className="order-number">
                Wykryliśmy transakcję. Czekamy na ostateczne potwierdzenie z
                Twojego banku (Przelewy24). Strona odświeży się automatycznie...
              </p>
            </>
          ) : (
            /* PRZYPADEK 3: INNE (Przelew / Odbiór) */
            <>
              <CheckCircle className="success-icon" size={80} color="#7a5c43" />
              <h1>Dziękujemy za zamówienie!</h1>
              <p className="order-number">
                Twoje zamówienie zostało przyjęte do realizacji.
              </p>
            </>
          )}

          {/* INSTRUKCJE DLA PRZELEWU TRADYCYJNEGO */}
          {order.payment_method === "tradycyjny" && order.status !== "paid" && (
            <div className="payment-instructions">
              <div className="instruction-header">
                <Info size={20} />
                <h3>Dane do przelewu tradycyjnego</h3>
              </div>
              <div className="bank-details">
                <div className="bank-row">
                  <span>Odbiorca:</span>{" "}
                  <strong>BLISS MEBLE Rafał Redes</strong>
                </div>
                <div className="bank-row">
                  <span>Nr konta:</span>{" "}
                  <strong>PL62 1020 4564 0000 5802 0414 3301</strong>
                </div>
                <div className="bank-row">
                  <span>Bank:</span> <strong>PKO BP</strong>
                </div>
                <div className="bank-row">
                  <span>Kwota:</span>{" "}
                  <strong>{formatPrice(order.total_brut)} zł</strong>
                </div>
                <div className="bank-row">
                  <span>Tytuł:</span> <strong>Zamówienie nr {order.id}</strong>
                </div>
              </div>
              <p className="instruction-footer">
                Zamówienie zostanie przekazane do produkcji po zaksięgowaniu
                wpłaty na naszym koncie.
              </p>
            </div>
          )}

          {/* ODBIÓR OSOBISTY */}
          {order.payment_method === "odbior" && (
            <div
              className="payment-info payment-info--pickup"
              style={{
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "8px",
                marginTop: "20px",
              }}
            >
              <Truck size={24} style={{ marginBottom: "10px" }} />
              <p>
                Wybrałeś płatność przy odbiorze osobistym. Zapłacisz za swoje
                produkty gotówką lub kartą na miejscu.
              </p>
            </div>
          )}

          {/* SZCZEGÓŁY ZAMÓWIENIA WIDOCZNE DLA KAŻDEGO */}
          <div className="order-details">
            <h3 className="order-details__title">Podsumowanie zamówienia</h3>

            <div className="order-details__grid">
              <div className="order-details__column">
                <h4>Dane dostawy</h4>
                <p>
                  <strong>Metoda:</strong>{" "}
                  {order.delivery_method === "kurier"
                    ? "Kurier"
                    : order.delivery_method === "paczkomat"
                      ? `Paczkomat (${order.paczkomat_code})`
                      : "Odbiór osobisty"}
                </p>
                <p>
                  <strong>Odbiorca:</strong>
                  <br />
                  {order.recipient_first_name} {order.recipient_last_name}
                  <br />
                  {order.street}{" "}
                  {order.apartment ? `m. ${order.apartment}` : ""}
                  <br />
                  {order.postal_code} {order.city}
                </p>
              </div>

              <div className="order-details__column">
                <h4>Dokument sprzedaży</h4>
                {order.wants_invoice === 1 ? (
                  <p>
                    <strong>Faktura:</strong>
                    <br />
                    {order.company_name ? (
                      <>
                        {order.company_name}
                        <br />
                        NIP: {order.nip}
                      </>
                    ) : (
                      "Imienna (na dane odbiorcy)"
                    )}
                  </p>
                ) : (
                  <p>Paragon imienny</p>
                )}
              </div>
            </div>

            <div className="order-details__products">
              <h4>Zamówione produkty</h4>
              {order.items?.map((item, idx) => (
                <div key={idx} className="product-row">
                  <span className="product-name">
                    {item.name} <em>(x{item.quantity})</em>
                  </span>
                  <span className="product-price">
                    {formatPrice(item.price_brut_snapshot * item.quantity)} zł
                  </span>
                </div>
              ))}
              <div className="product-row product-row--total">
                <span>Razem z dostawą:</span>
                <span>{formatPrice(order.total_brut)} zł</span>
              </div>
            </div>
          </div>

          <div className="order-summary__actions" style={{ marginTop: "30px" }}>
            <p style={{ marginBottom: "15px", color: "#64748b" }}>
              Potwierdzenie zamówienia wysłaliśmy na Twój adres e-mail.
            </p>
            <Link to="/sklep">
              <Button variant="primary">Kontynuuj zakupy</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderSummary;
