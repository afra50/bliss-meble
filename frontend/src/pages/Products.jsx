import { useParams, Link, useLocation, Navigate } from "react-router-dom";
import ProductCard from "../components/ui/ProductCard"; // Importujemy kartę!
import "../styles/pages/products.scss";

// 1. Słownik poprawnych adresów URL (teraz Z POLSKIMI ZNAKAMI)
const validCategories = {
  zestawy: [],
  "kolekcja-snu": ["materace", "łóżka-kontynentalne", "łóżka-tapicerowane"],
  "strefa-komfortu": ["narożniki", "narożniki-u", "sofy", "fotele"],
  dodatki: ["kołdry", "poduszki", "inne-akcesoria"],
};

// 2. Słownik do ładnego wyświetlania nazw (Rozwiązuje problem z formatowaniem!)
const categoryNames = {
  zestawy: "Zestawy",
  "kolekcja-snu": "Kolekcja SNU",
  "strefa-komfortu": "Strefa KOMFORTU",
  dodatki: "Dodatki",
  materace: "Materace",
  "łóżka-kontynentalne": "Łóżka kontynentalne",
  "łóżka-tapicerowane": "Łóżka tapicerowane",
  narożniki: "Narożniki",
  "narożniki-u": "Narożniki U",
  sofy: "Sofy",
  fotele: "Fotele",
  kołdry: "Kołdry",
  poduszki: "Poduszki",
  "inne-akcesoria": "Inne akcesoria",
};

// Makieta danych
const dummyProducts = [
  {
    id: 1,
    name: "Fotel Leniwy Boucle",
    price: "1 499 zł",
    img: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Sofa Velvet Comfort",
    price: "3 499 zł",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Stolik Kawowy Dąb",
    price: "699 zł",
    img: "https://images.unsplash.com/photo-1567016526105-22da7c13161a?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Łóżko Cloud Nine",
    price: "4 299 zł",
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600&auto=format&fit=crop",
  },
];

const Products = () => {
  // DecodeURI odkodowuje polskie znaki z paska przeglądarki (np. %C5%82 na ł)
  const category = useParams().category
    ? decodeURI(useParams().category)
    : undefined;
  const subcategory = useParams().subcategory
    ? decodeURI(useParams().subcategory)
    : undefined;
  const location = useLocation();

  const isAllProducts = location.pathname === "/sklep";
  const isSearch = location.pathname === "/szukaj";

  // LOGIKA ZABEZPIECZAJĄCA
  if (!isAllProducts && !isSearch && category) {
    if (!validCategories[category]) {
      return <Navigate to="/sklep" replace />;
    }
    if (subcategory && !validCategories[category].includes(subcategory)) {
      return <Navigate to={`/${category}`} replace />;
    }
  }

  // Funkcja pobierająca ładną nazwę
  const formatName = (slug) => categoryNames[slug] || slug;

  let pageTitle = "Wszystkie produkty";
  if (isSearch) pageTitle = "Wyniki wyszukiwania";
  if (category && !subcategory) pageTitle = formatName(category);
  if (subcategory) pageTitle = formatName(subcategory);

  return (
    <main className="products-page">
      {/* HEADER Z BŁĘKITNĄ / OLIWKOWĄ TARCZĄ (Zostaje Twoje tło) */}
      <section className="products-page__header">
        <div className="products-page__container">
          {/* Cale Menu Breadcrumbs zostawiamy z oryginalnego kodu */}
          <nav className="products-page__breadcrumb">
            <Link to="/">Strona główna</Link>

            {!isAllProducts && !isSearch && (
              <>
                <span className="separator">/</span>
                <Link to="/sklep">Sklep</Link>
              </>
            )}

            {isSearch && (
              <>
                <span className="separator">/</span>
                <span className="current">Szukaj</span>
              </>
            )}

            {isAllProducts && (
              <>
                <span className="separator">/</span>
                <span className="current">Sklep</span>
              </>
            )}

            {category && (
              <>
                <span className="separator">/</span>
                {subcategory ? (
                  <Link to={`/${category}`}>{formatName(category)}</Link>
                ) : (
                  <span className="current">{formatName(category)}</span>
                )}
              </>
            )}

            {subcategory && (
              <>
                <span className="separator">/</span>
                <span className="current">{formatName(subcategory)}</span>
              </>
            )}
          </nav>

          <h1 className="products-page__title">{pageTitle}</h1>
        </div>
      </section>

      {/* GŁÓWNA ZAWARTOŚĆ */}
      <section className="products-page__content">
        <div className="products-page__container products-page__layout">
          {/* LEWA KOLUMNA: Filtry */}
          <aside className="products-page__sidebar">
            <div className="filter-group">
              <h3>Kategorie</h3>
              <div className="filter-accordion">
                <div className="filter-accordion-item">
                  <Link to="/zestawy" className="filter-accordion-link">
                    Zestawy
                  </Link>
                </div>

                <details
                  className="filter-accordion-item"
                  open={category === "kolekcja-snu"}
                >
                  <summary>Kolekcja SNU</summary>
                  <ul>
                    <li className="view-all">
                      <Link to="/kolekcja-snu">Pokaż wszystko</Link>
                    </li>
                    <li>
                      <Link to="/kolekcja-snu/materace">Materace</Link>
                    </li>
                    <li>
                      <Link to="/kolekcja-snu/łóżka-kontynentalne">
                        Łóżka kontynentalne
                      </Link>
                    </li>
                    <li>
                      <Link to="/kolekcja-snu/łóżka-tapicerowane">
                        Łóżka tapicerowane
                      </Link>
                    </li>
                  </ul>
                </details>

                <details
                  className="filter-accordion-item"
                  open={category === "strefa-komfortu"}
                >
                  <summary>Strefa KOMFORTU</summary>
                  <ul>
                    <li className="view-all">
                      <Link to="/strefa-komfortu">Pokaż wszystko</Link>
                    </li>
                    <li>
                      <Link to="/strefa-komfortu/narożniki">Narożniki</Link>
                    </li>
                    <li>
                      <Link to="/strefa-komfortu/narożniki-u">Narożniki U</Link>
                    </li>
                    <li>
                      <Link to="/strefa-komfortu/sofy">Sofy</Link>
                    </li>
                    <li>
                      <Link to="/strefa-komfortu/fotele">Fotele</Link>
                    </li>
                  </ul>
                </details>

                <details
                  className="filter-accordion-item"
                  open={category === "dodatki"}
                >
                  <summary>Dodatki</summary>
                  <ul>
                    <li className="view-all">
                      <Link to="/dodatki">Pokaż wszystko</Link>
                    </li>
                    <li>
                      <Link to="/dodatki/kołdry">Kołdry</Link>
                    </li>
                    <li>
                      <Link to="/dodatki/poduszki">Poduszki</Link>
                    </li>
                    <li>
                      <Link to="/dodatki/inne-akcesoria">Inne akcesoria</Link>
                    </li>
                  </ul>
                </details>
              </div>
            </div>

            <div className="filter-group">
              <h3>Filtruj</h3>

              <div className="filter-subgroup">
                <h4>Cena</h4>
                <div className="filter-checkbox">
                  <input type="checkbox" id="price1" />{" "}
                  <label htmlFor="price1">Poniżej 1000 zł</label>
                </div>
                <div className="filter-checkbox">
                  <input type="checkbox" id="price2" />{" "}
                  <label htmlFor="price2">1000 zł - 3000 zł</label>
                </div>
                <div className="filter-checkbox">
                  <input type="checkbox" id="price3" />{" "}
                  <label htmlFor="price3">Powyżej 3000 zł</label>
                </div>
              </div>

              <div className="filter-subgroup">
                <h4>Materiał</h4>
                <div className="filter-checkbox">
                  <input type="checkbox" id="mat1" />{" "}
                  <label htmlFor="mat1">Welur</label>
                </div>
                <div className="filter-checkbox">
                  <input type="checkbox" id="mat2" />{" "}
                  <label htmlFor="mat2">Boucle</label>
                </div>
                <div className="filter-checkbox">
                  <input type="checkbox" id="mat3" />{" "}
                  <label htmlFor="mat3">Tkanina strukturalna</label>
                </div>
              </div>

              <div className="filter-subgroup">
                <h4>Kolor</h4>
                <div className="filter-colors">
                  <button
                    className="color-btn color-btn--beige"
                    title="Beżowy"
                  ></button>
                  <button
                    className="color-btn color-btn--brown"
                    title="Brązowy"
                  ></button>
                  <button
                    className="color-btn color-btn--slate"
                    title="Zgaszony błękit"
                  ></button>
                  <button
                    className="color-btn color-btn--olive"
                    title="Oliwkowy"
                  ></button>
                  <button
                    className="color-btn color-btn--grey"
                    title="Szary"
                  ></button>
                  <button
                    className="color-btn color-btn--black"
                    title="Czarny"
                  ></button>
                </div>
              </div>
            </div>
          </aside>

          {/* PRAWA KOLUMNA: Siatka produktów */}
          <div className="products-page__main">
            <div className="products-page__toolbar">
              <span className="products-count">
                Pokazano {dummyProducts.length} produkty
              </span>
              <select className="sort-select">
                <option>Sortuj: Domyślnie</option>
                <option>Cena: od najniższej</option>
                <option>Cena: od najwyższej</option>
                <option>Najnowsze</option>
              </select>
            </div>

            <div className="products-page__grid">
              {/* UŻYWAMY KOMPONENTU KARTY PRODUKTU */}
              {dummyProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Products;
