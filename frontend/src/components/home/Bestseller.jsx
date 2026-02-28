import Button from "../ui/Button";
import "../../styles/components/home/bestseller.scss";

const Bestseller = () => {
  // W przyszłości te dane przyjdą z bazy danych
  const featuredProducts = [
    {
      id: 1,
      badge: "Bohater Miesiąca",
      title: "Sofa Velvet Comfort",
      desc: "Najwyższej jakości welur, głębokie siedzisko i nowoczesny, minimalistyczny design. Odkryj nasz najczęściej wybierany produkt, który odmieni Twój salon.",
      price: "od 3 499 zł",
      link: "/strefa-komfortu/sofy",
      img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop",
      theme: "slate", // Tło slate (niebieskie)
    },
    {
      id: 2,
      badge: "Wyjątkowa Oferta",
      title: "Łóżko Cloud Nine",
      desc: "Zanurz się w luksusie każdej nocy. Nasze flagowe łóżko tapicerowane to synonim elegancji i niesamowitej wygody. Dostępne w 5 odcieniach.",
      price: "od 4 299 zł",
      link: "/kolekcja-snu",
      img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1000&auto=format&fit=crop",
      theme: "olive", // ZMIANA: Tło oliwkowe!
    },
  ];

  return (
    <section className="bestseller-wrapper">
      {featuredProducts.map((product, index) => {
        const isReversed = index % 2 !== 0;

        return (
          <article
            key={product.id}
            className={`bestseller bestseller--${product.theme} ${isReversed ? "bestseller--reversed" : ""}`}
          >
            <div className="bestseller__container bestseller__grid">
              <div className="bestseller__text">
                <span className="bestseller__badge">{product.badge}</span>
                <h2>{product.title}</h2>
                <p>{product.desc}</p>
                <p className="bestseller__price">{product.price}</p>
                <Button to={product.link} variant={`outline-${product.theme}`}>
                  Zobacz produkt
                </Button>
              </div>
              <div className="bestseller__image">
                <img src={product.img} alt={product.title} />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default Bestseller;
