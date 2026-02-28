import { Link } from "react-router-dom";
import { FaInstagram, FaFacebook } from "react-icons/fa";
// Upewnij się, że ścieżka i nazwa pliku z jasnym logo są poprawne
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
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <FaInstagram />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FaFacebook />
            </a>
          </div>
        </div>

        {/* Kolumna 2: Obsługa klienta */}
        <div className="footer__links-group">
          <h4 className="footer__title">Obsługa klienta</h4>
          <ul className="footer__list">
            <li>
              <Link to="/kontakt">Kontakt</Link>
            </li>
            <li>
              <Link to="/zwroty-i-reklamacje">Zwroty i reklamacje</Link>
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
              <Link to="/regulamin">Regulamin</Link>
            </li>
            <li>
              <Link to="/polityka-prywatnosci">Polityka prywatności</Link>
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
