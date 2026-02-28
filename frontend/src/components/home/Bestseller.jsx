import Button from "../ui/Button";
import "../../styles/components/home/bestseller.scss";

const Bestseller = () => {
  return (
    <section className="bestseller">
      <div className="bestseller__container bestseller__grid">
        <div className="bestseller__text">
          <span className="bestseller__badge">Bestseller Miesiąca</span>
          <h2>Sofa Velvet Comfort</h2>
          <p>
            Najwyższej jakości welur, głębokie siedzisko i nowoczesny,
            minimalistyczny design. Odkryj nasz najczęściej wybierany produkt,
            który odmieni Twój salon.
          </p>
          <p className="bestseller__price">od 3 499 zł</p>
          <Button to="/strefa-komfortu/sofy" variant="light">
            Zobacz produkt
          </Button>
        </div>
        <div className="bestseller__image">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop"
            alt="Sofa Velvet Comfort"
          />
        </div>
      </div>
    </section>
  );
};

export default Bestseller;
