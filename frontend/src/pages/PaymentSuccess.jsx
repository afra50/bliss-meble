import React from "react";
import Button from "../components/ui/Button";
import "../styles/pages/payment-success.scss";
import { Check } from "lucide-react";

function PaymentSuccess() {
	return (
		<main className="ps-page">
			<Check size={150} />
			<header className="ps-hero">
				<h1 className="ps-title">Płatność zaakceptowana!</h1>
				<p className="ps-text">Dziękujemy za dokonanie wpłaty.</p>
				<Button className="ps-button" to="/">
					Powrót do strony głównej
				</Button>
			</header>
		</main>
	);
}

export default PaymentSuccess;
