import { Link } from "react-router-dom";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import logoLight from "../assets/logos/bliss_logo_Beige_Bliss_poziom.svg";
import "../styles/components/footer.scss";

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="footer">
			<div className="footer__container">
				{/* Kolumna 1: Logo i opis */}
				<div className="footer__brand">
					<Link to="/" className="footer__logo">
						<img src={logoLight} alt="Bliss Meble" />
					</Link>
					<p className="footer__description">
						Tworzymy meble, które wprowadzają harmonię, spokój i luksus do
						Twojego wnętrza.
					</p>
					<div className="footer__socials">
						<a
							href="https://www.instagram.com/blissmeble"
							target="_blank"
							rel="noreferrer">
							<FaInstagram />
						</a>
						<a
							href="https://www.facebook.com/profile.php?id=61585843586803&rdid=1muYW7nZuCsrWVan&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BsCWMh6zr#"
							target="_blank"
							rel="noreferrer">
							<FaFacebook />
						</a>

						<a
							href="https://www.tiktok.com/@bliss.meble?_r=1&_t=ZN-94zWs1rmuCA"
							target="_blank"
							rel="noreferrer">
							<FaTiktok />
						</a>
					</div>
				</div>

				{/* Kolumna 2: Obsługa klienta */}
				<div className="footer__links-group">
					<h4 className="footer__title">Obsługa klienta</h4>
					<ul className="footer__list">
						<li>
							<Link to="/koszyk">Twój koszyk</Link>
						</li>
						<li>
							<Link to="/kontakt">Kontakt</Link>
						</li>
						<li>
							<Link to="/zwroty-reklamacje">Zwroty i reklamacje</Link>
						</li>
					</ul>
				</div>

				{/* Kolumna 3: Informacje */}
				<div className="footer__links-group">
					<h4 className="footer__title">Informacje</h4>
					<ul className="footer__list">
						<li>
							<Link to="/o-marce">O marce</Link>
						</li>
						<li>
							{/* Regulamin jako link do PDF otwieranego w nowej karcie */}
							<a
								href="/regulamin.pdf"
								target="_blank"
								rel="noopener noreferrer">
								Regulamin
							</a>
						</li>
						<li>
							<a
								href="/polityka_prywatnosci.pdf"
								target="_blank"
								rel="noopener noreferrer">
								Polityka prywatności
							</a>
						</li>
					</ul>
				</div>
			</div>

			{/* Pasek na samym dole */}
			<div className="footer__bottom">
				<p>&copy; {currentYear} Bliss Meble. Wszelkie prawa zastrzeżone.</p>
			</div>
		</footer>
	);
};

export default Footer;
