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
          {/* Zmieniamy cel na /koszyk */}
          <Button className="pc-button" to="/koszyk" variant="primary">
            Wróć do koszyka
          </Button>
          <Button className="pc-button-contact" to="/kontakt" variant="olive">
            Kontakt
          </Button>
        </div>
      </header>
    </main>
  );
}

export default PaymentCancel;
