import React, { useState } from "react";
import Button from "../components/ui/Button";
// ZMIANA 1: Usunięto import zdjęcia mapka
// import mapka from "../assets/mapka.jpg";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa"; // <--- DODANY IMPORT
import { contactApi } from "../utils/api";
import ToastAlert from "../components/ui/ToastAlert";
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
								required
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
									href="https://www.facebook.com/profile.php?id=61585843586803&rdid=1muYW7nZuCsrWVan&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BsCWMh6zr#"
									target="_blank"
									rel="noopener noreferrer">
									<FaFacebook size={26} />
								</a>
								<a
									href="https://www.instagram.com/blissmeble"
									target="_blank"
									rel="noopener noreferrer">
									<FaInstagram size={26} />
								</a>

								<a
									href="https://www.tiktok.com/@bliss.meble?_r=1&_t=ZN-94zWs1rmuCA"
									target="_blank"
									rel="noopener noreferrer">
									<FaTiktok size={26} />
								</a>
							</div>
						</div>
					</div>
					{/* ZMIANA 2: Zastąpienie <img> tagiem <iframe> */}
					<div className="contact-image-wrapper">
						<iframe
							src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2524.4984180410497!2d18.337488077156933!3d51.365311022879684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471a6e0df0df0dfd%3A0x7d2874136611388b!2sul.%20S%C5%82oneczna%2062%2C%2098-420%20Walichnowy!5e0!3m2!1spl!2spl!4v1710368000000!5m2!1spl!2spl"
							width="100%"
							height="100%"
							style={{ border: 0 }}
							allowFullScreen=""
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
							title="Mapa dojazdu do BLISS MEBLE"></iframe>
					</div>
				</aside>
			</div>
		</main>
	);
}

export default Contact;
