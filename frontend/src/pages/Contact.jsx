import React from "react";
import Button from "../components/ui/Button";
import mapka from "../assets/mapka.jpg";
import { Facebook, Instagram } from "lucide-react"; // Nowe importy
import "../styles/pages/contact.scss"; // <- PRZYWRÓCONY IMPORT STYLÓW

function Contact() {
	return (
		<main className="contact-page">
			<header className="contact-header">
				<h1>Kontakt</h1>
				<p>Masz pytania? Napisz do nas lub zadzwoń – chętnie pomożemy.</p>
			</header>

			<div className="contact-grid">
				<section className="contact-form-column form-section">
					<h3>Napisz do nas</h3>
					<form>
						<div className="form-row">
							<div className="form-group">
								<label className="form-group__label" htmlFor="name">
									Imię i nazwisko
								</label>
								<input type="text" id="name" className="form-group__input" />
							</div>
							<div className="form-group">
								<label className="form-group__label" htmlFor="phone">
									Telefon
								</label>
								<input type="tel" id="phone" className="form-group__input" />
							</div>
						</div>

						<div className="form-group">
							<label className="form-group__label" htmlFor="email">
								E-mail
							</label>
							<input type="email" id="email" className="form-group__input" />
						</div>

						<div className="form-group">
							<label className="form-group__label" htmlFor="subject">
								Temat
							</label>
							<input type="text" id="subject" className="form-group__input" />
						</div>

						<div className="form-group">
							<label className="form-group__label" htmlFor="message">
								Wiadomość
							</label>
							<textarea
								id="message"
								rows="6"
								className="form-group__input"></textarea>
						</div>

						<div className="custom-checkbox">
							<input type="checkbox" id="privacy" />
							<label htmlFor="privacy">
								Zapoznałem/am się i akceptuję{" "}
								{/* ZMIANA: Link do polityki prywatności w nowej karcie */}
								<a
									href="/polityka_prywatnosci.pdf"
									target="_blank"
									rel="noopener noreferrer"
									className="highlight">
									politykę prywatności
								</a>
								.
							</label>
						</div>

						<div className="form-actions">
							<Button type="submit">Wyślij</Button>
						</div>
					</form>
				</section>

				<aside className="contact-info-column">
					<div className="contact-info-box">
						<h3 className="info-title">Dane firmy</h3>

						<div className="info-block">
							{/* ZMIANA: Prawdziwe dane Bliss Meble */}
							<strong>BLISS MEBLE Rafał Redes</strong>
							<p>ul. Słoneczna 62, 98-420 Walichnowy</p>
							<p>NIP: 9970163635</p>
						</div>

						<div className="info-block">
							<strong>Kontakt</strong>
							<p>Tel: +48 730 184 838</p>
							<p>E-mail: kontakt@blissmeble.pl</p>
						</div>

						{/* Nowa sekcja Social Media */}
						<div className="info-block social-block">
							<strong>Odwiedź nas</strong>
							<div className="social-links">
								<a
									href="https://facebook.com"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Facebook">
									<Facebook size={26} />
								</a>
								<a
									href="https://instagram.com"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Instagram">
									<Instagram size={26} />
								</a>
							</div>
						</div>
					</div>

					<div className="contact-image-wrapper">
						<img src={mapka} alt="Siedziba firmy" />
					</div>
				</aside>
			</div>
		</main>
	);
}

export default Contact;
