import "../../styles/components/home/promotions.scss";

const Promotions = () => {
  return (
    <section className="promotions">
      <div className="promotions__container">
        <h2 className="promotions__title">Wybrane promocje</h2>
        <div className="promotions__grid">
          <div className="promotions__card">
            <div className="promotions__badge">Promocja</div>
            <div className="promotions__img">
              <img
                src="https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=600&auto=format&fit=crop"
                alt="Fotel Boucle"
              />
            </div>
            <div className="promotions__info">
              <h4>Fotel Leniwy Boucle</h4>
              <div className="promotions__prices">
                <span className="promotions__price-old">1 899 zł</span>
                <span className="promotions__price-new">1 499 zł</span>
              </div>
            </div>
          </div>

          <div className="promotions__card">
            <div className="promotions__badge">Promocja</div>
            <div className="promotions__img">
              <img
                src="https://images.unsplash.com/photo-1532372320572-cda25653a26d?q=80&w=600&auto=format&fit=crop"
                alt="Łóżko"
              />
            </div>
            <div className="promotions__info">
              <h4>Łóżko Kontynentalne Sen</h4>
              <div className="promotions__prices">
                <span className="promotions__price-old">4 200 zł</span>
                <span className="promotions__price-new">3 899 zł</span>
              </div>
            </div>
          </div>

          <div className="promotions__card">
            <div className="promotions__badge">Promocja</div>
            <div className="promotions__img">
              <img
                src="https://images.unsplash.com/photo-1567016526105-22da7c13161a?q=80&w=600&auto=format&fit=crop"
                alt="Stolik"
              />
            </div>
            <div className="promotions__info">
              <h4>Stolik Kawowy Dąb</h4>
              <div className="promotions__prices">
                <span className="promotions__price-old">899 zł</span>
                <span className="promotions__price-new">699 zł</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Promotions;
