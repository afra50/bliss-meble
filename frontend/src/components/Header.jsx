import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FaInstagram,
  FaFacebook,
  FaSearch,
  FaShoppingBasket,
  FaBars,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";
import logo from "../assets/logos/bliss_logo_Black_Bliss_poziom.svg";
import "../styles/components/header.scss";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuData = [
    { title: "Zestawy", path: "/zestawy", sub: [] },
    {
      title: "Kolekcja SNU",
      path: "/kolekcja-snu",
      sub: ["Materace", "Łóżka kontynentalne", "Łóżka tapicerowane"],
    },
    {
      title: "Strefa KOMFORTU",
      path: "/strefa-komfortu",
      sub: ["Narożniki", "Narożniki U", "Sofy", "Fotele"],
    },
    {
      title: "Dodatki",
      path: "/dodatki",
      sub: ["Kołdry", "Poduszki", "Inne akcesoria"],
    },
  ];

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  return (
    <header className="header">
      <div className="header__container">
        {/* LOGO */}
        <Link to="/" className="header__logo">
          <img src={logo} alt="Bliss Meble" />
        </Link>

        {/* NAWIGACJA CENTRUM (Desktop + Mobile) */}
        <nav
          className={`header__nav ${isMobileMenuOpen ? "header__nav--active" : ""}`}
        >
          {/* WYSZUKIWARKA W MOBILE (Wewnątrz burgera) */}
          <div className="header__search-mobile">
            <input
              type="text"
              placeholder="Czego szukasz?"
              className="header__search-input"
            />
            <div className="header__action-icon">
              <FaSearch />
            </div>
          </div>

          <ul className="header__menu">
            {menuData.map((item, index) => (
              <li key={index} className="header__menu-item">
                {/* ZMIANA: Używamy NavLink i dynamicznej klasy */}
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `header__menu-link ${isActive ? "header__menu-link--active" : ""}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {/* DODAJEMY SPAN WOKÓŁ SAMEGO TEKSTU */}
                  <span className="header__menu-text">{item.title}</span>

                  {item.sub.length > 0 && (
                    <FaChevronDown className="header__chevron" />
                  )}
                </NavLink>

                {/* KLASYCZNE PODMENU */}
                {item.sub.length > 0 && (
                  <ul className="header__dropdown">
                    {item.sub.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <NavLink
                          to={`${item.path}/${subItem.toLowerCase().replace(/ /g, "-")}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* AKCJE (Prawa strona) */}
        <div className="header__actions">
          {/* WYSZUKIWARKA NA DESKTOPIE (Zawsze widoczna) */}
          <div className="header__search-desktop">
            <input
              type="text"
              placeholder="Czego szukasz?"
              className="header__search-input"
            />
            <div className="header__action-icon">
              <FaSearch />
            </div>
          </div>

          <div className="header__socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <FaInstagram />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FaFacebook />
            </a>
          </div>

          <Link to="/koszyk" className="header__cart">
            <FaShoppingBasket />
            <span className="header__cart-count">0</span>
          </Link>

          {/* BURGER ICON */}
          <div
            className="header__burger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
