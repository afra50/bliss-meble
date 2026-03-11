import React from "react";
import Button from "../components/ui/Button";
import mapka from "../assets/mapka.jpg";
import { Facebook, Instagram } from "lucide-react"; // Nowe importy
import "../styles/pages/contact.scss";
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
								<span className="highlight">politykę prywatności</span>.
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
							<strong>Mebloo Sp. z o.o.</strong>
							<p>ul. Przykładowa 12, 00-000 Warszawa</p>
							<p>NIP: 0000000000</p>
							<p>REGON: 000000000</p>
						</div>

						<div className="info-block">
							<strong>Kontakt</strong>
							<p>Tel: +48 000 000 000</p>
							<p>E-mail: kontakt@twojsklep.pl</p>
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

// 4. social media - ig i fb
// 5. Nie musisz importować zadnych plikow scss
// 6. strona pod adresem /kontakt
