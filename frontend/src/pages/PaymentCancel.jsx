import React from "react";
import Button from "../components/ui/Button";
import "../styles/pages/payment-cancel.scss";
import { X } from "lucide-react";

function PaymentCancel() {
  return (
    <main className="pc-page">
      <X size={150} />
      <header className="pc-hero">
        <h1 className="pc-title">Płatność odrzucona!</h1>
        <p className="pc-text">
          Transakcja została anulowana. Jeśli to nie Ty anulowałeś płatność
          skontaktuj się z nami
        </p>
        <div className="pc-buttons">
          <Button className="pc-button" to="/">
            Strona główna
          </Button>
          <Button className="pc-button-contact" to="contact" variant="olive">
            Kontakt
          </Button>
        </div>
      </header>
    </main>
  );
}

export default PaymentCancel;
