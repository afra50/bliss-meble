import React from "react";
import Button from "../components/ui/Button";
import "../styles/pages/payment-success.scss";
import { Check } from "lucide-react";

function PaymentSuccess() {
  return (
    <main className="ps-page">
      <Check size={100} strokeWidth={3} />
      <header className="ps-hero">
        <h1 className="ps-title">Płatność zaakceptowana!</h1>
        <p className="ps-text">
          Dziękujemy za zamówienie. Potwierdzenie oraz szczegóły transakcji
          zostały wysłane na Twój adres e-mail.
        </p>
        <Button className="ps-button" to="/sklep" variant="primary">
          Kontynuuj zakupy
        </Button>
      </header>
    </main>
  );
}

export default PaymentSuccess;
