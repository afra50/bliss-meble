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
import SearchBar from "./ui/search/SearchBar";
import { useCart } from "../context/CartContext";
import MiniCart from "./cart/MiniCart";

// NOWOŚĆ: Importujemy nasze dane
import { CATEGORIES, SUBCATEGORIES } from "../utils/categories";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount } = useCart();

  // NOWOŚĆ: Dynamiczne budowanie menu
  const menuData = CATEGORIES.map((category) => {
    // Szukamy tylko tych podkategorii, których category_id pasuje do aktualnej kategorii
    const categorySubs = SUBCATEGORIES.filter(
      (sub) => sub.category_id === category.id,
    );

    return {
      title: category.name,
      path: `/${category.slug}`, // np. "/kolekcja-snu"
      sub: categorySubs, // Zapisujemy całą tablicę znalezionych podkategorii
    };
  });

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
          <SearchBar className="header__search-mobile" />

          <ul className="header__menu">
            {menuData.map((item, index) => (
              <li key={index} className="header__menu-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `header__menu-link ${isActive ? "header__menu-link--active" : ""}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="header__menu-text">{item.title}</span>

                  {item.sub.length > 0 && (
                    <FaChevronDown className="header__chevron" />
                  )}
                </NavLink>

                {/* KLASYCZNE PODMENU */}
                {item.sub.length > 0 && (
                  <ul className="header__dropdown">
                    {/* Tutaj mapujemy po naszych obiektach z utils/categories.js */}
                    {item.sub.map((subItem) => (
                      <li key={subItem.id}>
                        <NavLink
                          to={`${item.path}/${subItem.slug}`} // O wiele bezpieczniejsze niż .replace() !
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem.name}
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
          <SearchBar className="header__search-desktop" />

          <div className="header__socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <FaInstagram />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FaFacebook />
            </a>
          </div>

          <button
            className="header__cart"
            onClick={() => setIsCartOpen(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <FaShoppingBasket />
            {cartCount > 0 && (
              <span className="header__cart-count">{cartCount}</span>
            )}
          </button>

          {/* BURGER ICON */}
          <div
            className="header__burger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>
      <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;
