import React, { useState } from "react";
import Button from "../components/ui/Button";
import mapka from "../assets/mapka.jpg";
import { Facebook, Instagram } from "lucide-react";
import { contactApi } from "../utils/api";
import ToastAlert from "../components/ui/ToastAlert"; // <--- Import ich gotowca
import "../styles/pages/contact.scss";

function Contact() {
	const [formData, setFormData] = useState({
		name: "",
		phone: "",
		email: "",
		subject: "",
		message: "",
		privacyAccepted: false,
	});

	const [isSubmitting, setIsSubmitting] = useState(false);

	// Stan dla ich ToastAlert
	const [alert, setAlert] = useState({
		isOpen: false,
		message: "",
		type: "success",
	});

	const handleCloseAlert = () => {
		setAlert((prev) => ({ ...prev, isOpen: false }));
	};

	const handleChange = (e) => {
		const { id, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.privacyAccepted) {
			setAlert({
				isOpen: true,
				message: "Musisz zaakceptować politykę prywatności.",
				type: "error",
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await contactApi.sendMessage(formData);
			if (response.data.success) {
				setAlert({
					isOpen: true,
					message: "Wiadomość wysłana pomyślnie!",
					type: "success",
				});
				// Czyścimy formularz
				setFormData({
					name: "",
					phone: "",
					email: "",
					subject: "",
					message: "",
					privacyAccepted: false,
				});
			}
		} catch (error) {
			setAlert({
				isOpen: true,
				message:
					error.response?.data?.message || "Błąd wysyłania. Spróbuj później.",
				type: "error",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="contact-page">
			{/* ICH GOTOWY ALERT - pojawi się na górze strony lub tam, gdzie mają go w CSS */}
			<ToastAlert
				isOpen={alert.isOpen}
				message={alert.message}
				type={alert.type}
				onClose={handleCloseAlert}
			/>

			<header className="contact-header">
				<h1>Kontakt</h1>
				<p>Masz pytania? Napisz do nas lub zadzwoń – chętnie pomożemy.</p>
			</header>

			<div className="contact-grid">
				<section className="contact-form-column form-section">
					<h3>Napisz do nas</h3>

					<form onSubmit={handleSubmit}>
						<div className="form-row">
							<div className="form-group">
								<label className="form-group__label" htmlFor="name">
									Imię i nazwisko *
								</label>
								<input
									type="text"
									id="name"
									value={formData.name}
									onChange={handleChange}
									className="form-group__input"
									required
								/>
							</div>
							<div className="form-group">
								<label className="form-group__label" htmlFor="phone">
									Telefon
								</label>
								<input
									type="tel"
									id="phone"
									value={formData.phone}
									onChange={handleChange}
									className="form-group__input"
								/>
							</div>
						</div>

						<div className="form-group">
							<label className="form-group__label" htmlFor="email">
								E-mail *
							</label>
							<input
								type="email"
								id="email"
								value={formData.email}
								onChange={handleChange}
								className="form-group__input"
								required
							/>
						</div>

						<div className="form-group">
							<label className="form-group__label" htmlFor="subject">
								Temat *
							</label>
							<input
								type="text"
								id="subject"
								value={formData.subject}
								onChange={handleChange}
								className="form-group__input"
								required // <--- TEMAT TERAZ JEST WYMAGANY
							/>
						</div>

						<div className="form-group">
							<label className="form-group__label" htmlFor="message">
								Wiadomość *
							</label>
							<textarea
								id="message"
								value={formData.message}
								onChange={handleChange}
								rows="6"
								className="form-group__input"
								required></textarea>
						</div>

						<div className="custom-checkbox">
							<input
								type="checkbox"
								id="privacyAccepted"
								checked={formData.privacyAccepted}
								onChange={handleChange}
							/>
							<label htmlFor="privacyAccepted">
								Zapoznałem/am się i akceptuję{" "}
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
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Wysyłanie..." : "Wyślij wiadomość"}
							</Button>
						</div>
					</form>
				</section>

				<aside className="contact-info-column">
					<div className="contact-info-box">
						<h3 className="info-title">Dane firmy</h3>
						<div className="info-block">
							<strong>BLISS MEBLE Rafał Redes</strong>
							<p>ul. Słoneczna 62, 98-420 Walichnowy</p>
							<p>NIP: 9970163635</p>
						</div>
						<div className="info-block">
							<strong>Kontakt</strong>
							<p>Tel: +48 730 184 838</p>
							<p>E-mail: kontakt@blissmeble.pl</p>
						</div>
						<div className="info-block social-block">
							<strong>Odwiedź nas</strong>
							<div className="social-links">
								<a
									href="https://facebook.com"
									target="_blank"
									rel="noopener noreferrer">
									<Facebook size={26} />
								</a>
								<a
									href="https://instagram.com"
									target="_blank"
									rel="noopener noreferrer">
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
