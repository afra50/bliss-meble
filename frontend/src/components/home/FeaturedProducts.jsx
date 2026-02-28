import "../../styles/components/home/featured-products.scss";

const FeaturedProducts = () => {
  return (
    <section className="featured">
      <div className="featured__container">
        <h2 className="featured__title">Wybrane produkty</h2>
        <div className="featured__grid">
          <div className="featured__card">
            {/* Zostawiamy możliwość dodania plakietki "Nowość" */}
            <div className="featured__badge featured__badge--new">Nowość</div>
            <div className="featured__img">
              <img
                src="https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=600&auto=format&fit=crop"
                alt="Fotel Boucle"
              />
            </div>
            <div className="featured__info">
              <h4>Fotel Leniwy Boucle</h4>
              <div className="featured__price">1 499 zł</div>
            </div>
          </div>

          <div className="featured__card">
            <div className="featured__img">
              <img
                src="https://images.unsplash.com/photo-1532372320572-cda25653a26d?q=80&w=600&auto=format&fit=crop"
                alt="Łóżko"
              />
            </div>
            <div className="featured__info">
              <h4>Łóżko Kontynentalne Sen</h4>
              <div className="featured__price">3 899 zł</div>
            </div>
          </div>

          <div className="featured__card">
            <div className="featured__img">
              <img
                src="https://images.unsplash.com/photo-1567016526105-22da7c13161a?q=80&w=600&auto=format&fit=crop"
                alt="Stolik Kawowy Dąb"
              />
            </div>
            <div className="featured__info">
              <h4>Stolik Kawowy Dąb</h4>
              {/* Uproszczona cena, bez promocji */}
              <div className="featured__price">699 zł</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
