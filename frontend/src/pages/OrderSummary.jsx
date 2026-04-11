import React from "react";
import { useLocation, Link } from "react-router-dom";
import { CheckCircle, Info, CreditCard, Truck } from "lucide-react";
import Button from "../components/ui/Button";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import "../styles/pages/order-summary.scss";

const OrderSummary = () => {
  const location = useLocation();
  // Pobieramy dane zamówienia przekazane przez nawigację (z CheckoutPage)
  const orderData = location.state?.orderData;

  // Zabezpieczenie na wypadek ręcznego wejścia na adres /zamowienie/podsumowanie
  if (!orderData) {
    return (
      <main className="order-summary order-summary--error">
        <div className="order-summary__container">
          <h2>Nie odnaleziono danych zamówienia.</h2>
          <Link to="/sklep">
            <Button variant="primary">Wróć do sklepu</Button>
          </Link>
        </div>
      </main>
    );
  }

  const { paymentMethod, totalAmount } = orderData;

  return (
    <main className="order-summary">
      <div className="order-summary__container">
        <CheckoutStepper currentStep={3} />

        <div className="order-summary__card">
          <CheckCircle className="success-icon" size={80} />
          <h1>Dziękujemy za zamówienie!</h1>
          <p className="order-number">
            Twoje zamówienie zostało przyjęte do realizacji.
          </p>

          {/* PRZYPADEK 1: PRZELEW TRADYCYJNY */}
          {paymentMethod === "tradycyjny" && (
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
                  <strong>{totalAmount.toFixed(2)} zł</strong>
                </div>
                <div className="bank-row">
                  <span>Tytuł:</span>{" "}
                  <strong>
                    Zamówienie nr [Numer zostanie wysłany e-mailem]
                  </strong>
                </div>
              </div>
              <p className="instruction-footer">
                Zamówienie zostanie przekazane do produkcji po zaksięgowaniu
                wpłaty na naszym koncie.
              </p>
            </div>
          )}

          {/* PRZYPADEK 2: PŁATNOŚĆ ONLINE (Symulacja przed integracją) */}
          {paymentMethod === "online" && (
            <div className="payment-info payment-info--online">
              <CreditCard size={24} />
              <p>
                Wybrałeś płatność online. W pełnej wersji sklepu zostaniesz
                teraz przekierowany do systemu <strong>Przelewy24</strong>.
              </p>
            </div>
          )}

          {/* PRZYPADEK 3: PŁATNOŚĆ PRZY ODBIORZE */}
          {paymentMethod === "odbior" && (
            <div className="payment-info payment-info--pickup">
              <Truck size={24} />
              <p>
                Wybrałeś płatność przy odbiorze osobistym. Zapłacisz za swoje
                produkty gotówką lub kartą na miejscu.
              </p>
            </div>
          )}

          <div className="order-summary__actions">
            <p>Potwierdzenie zamówienia wysłaliśmy na Twój adres e-mail.</p>
            <Button variant="primary" to="/sklep">
              Kontynuuj zakupy
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderSummary;
