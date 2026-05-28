import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Info, CreditCard, Truck } from "lucide-react";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader"; // Dodany import Loadera
import ErrorState from "../components/ui/ErrorState"; // Dodany import ErrorState
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import { orderApi } from "../utils/api";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";

import "../styles/pages/order-summary.scss";

const OrderSummary = () => {
  const { token } = useParams();
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cartClearedRef = useRef(false);

  useEffect(() => {
    let timeoutId = null;
    let isMounted = true;

    const fetchOrder = async () => {
      try {
        const response = await orderApi.getOrderByToken(token);

        // Jeśli komponent został odmontowany w międzyczasie, przerywamy
        if (!isMounted) return;

        const orderData = response.data;
        setOrder(orderData);
        setIsLoading(false);

        // BEZPIECZNE CZYSZCZENIE KOSZYKA
        if (!cartClearedRef.current) {
          if (
            orderData.payment_method !== "online" ||
            orderData.status === "paid"
          ) {
            clearCart();
            cartClearedRef.current = true;
          }
        }

        // --- KONTROLOWANY POLLING: Planujemy następne żądanie tylko gdy trzeba ---
        if (
          orderData.payment_method === "online" &&
          orderData.status !== "paid"
        ) {
          timeoutId = setTimeout(fetchOrder, 3000);
        }
      } catch (err) {
        console.error("Błąd pobierania podsumowania:", err);
        if (isMounted) {
          setError(
            "Nie odnaleziono danych zamówienia lub link jest nieprawidłowy.",
          );
          setIsLoading(false);
        }
      }
    };

    fetchOrder(); // Odpalamy pierwsze, pojedyncze zapytanie

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [token, clearCart]);

  // 1. Użycie globalnego Loadera
  if (isLoading) {
    return (
      <main
        className="order-summary"
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader message="Weryfikujemy status zamówienia. Prosimy nie odświeżać strony." />
      </main>
    );
  }

  // 2. Użycie globalnego ErrorState
  if (error || !order) {
    return (
      <main
        className="order-summary"
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="order-summary__container">
          <ErrorState
            title="Brak danych"
            message={
              error ||
              "Nie odnaleziono danych zamówienia lub link jest nieprawidłowy."
            }
            actionText="Wróć do sklepu"
            actionLink="/sklep" // Zmień na właściwy props, jakiego oczekuje Twój ErrorState (np. onAction, href itp.)
          />
        </div>
      </main>
    );
  }

  // Obliczamy wartość samych produktów (brutto)
  const productsTotal =
    order.items?.reduce(
      (acc, item) => acc + item.price_brut_snapshot * item.quantity,
      0,
    ) || 0;

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
            <div className="payment-info payment-info--pickup">
              <Truck size={24} />
              <p>
                Wybrałeś płatność przy odbiorze osobistym. Zapłacisz za swoje
                produkty gotówką lub kartą na miejscu.
              </p>
            </div>
          )}

          {/* SZCZEGÓŁY ZAMÓWIENIA */}
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
              {order.items?.map((item, idx) => {
                // 1. Wyciągamy dane (szukamy we wszystkich możliwych kluczach, w tym selected_options)
                let selectedAttributes =
                  item.selected_options ||
                  item.configuration ||
                  item.attributes;

                // 2. KLUCZOWA ZMIANA: Jeśli dane przyszły z bazy jako tekst (String JSON), zamieniamy je na obiekt
                if (typeof selectedAttributes === "string") {
                  try {
                    selectedAttributes = JSON.parse(selectedAttributes);
                  } catch (e) {
                    console.error("Błąd parsowania atrybutów:", e);
                    selectedAttributes = null;
                  }
                }

                return (
                  <div key={idx} className="product-row">
                    <div className="product-info-block">
                      <span className="product-name">
                        {item.name} <em>(x{item.quantity})</em>
                      </span>
                      {selectedAttributes &&
                        Object.keys(selectedAttributes).length > 0 && (
                          <ul className="product-attributes">
                            {Object.entries(selectedAttributes).map(
                              ([key, value]) => (
                                <li key={key}>
                                  - {key}: {String(value)}
                                </li>
                              ),
                            )}
                          </ul>
                        )}
                    </div>
                    <span className="product-price">
                      {formatPrice(item.price_brut_snapshot * item.quantity)} zł
                    </span>
                  </div>
                );
              })}

              {/* Dodatkowy podział na produkty i koszt dostawy */}
              <div className="product-row product-row--summary-line">
                <span>Wartość produktów:</span>
                <span>{formatPrice(productsTotal)} zł</span>
              </div>
              <div className="product-row">
                <span>
                  {order.delivery_method === "odbior" ||
                  order.delivery_method === "odbior_osobisty"
                    ? "Koszt odbioru:"
                    : `Koszt dostawy (${order.delivery_method === "kurier" ? "Kurier" : "Paczkomat"}):`}
                </span>
                <span>
                  {Number(order.shipping_cost) === 0
                    ? "0 zł"
                    : `${formatPrice(order.shipping_cost)} zł`}
                </span>
              </div>

              {/* Podsumowanie końcowe łączące produkty i wysyłkę */}
              <div className="product-row product-row--total">
                <span>Razem z dostawą:</span>
                <span>{formatPrice(order.total_brut)} zł</span>
              </div>
            </div>
          </div>

          <div className="order-summary__actions">
            <p className="confirmation-note">
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
