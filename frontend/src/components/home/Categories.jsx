import { Link } from "react-router-dom";
import "../../styles/components/home/categories.scss";

const Categories = () => {
  return (
    <section className="categories">
      <div className="categories__container">
        <div className="categories__grid">
          <Link to="/kolekcja-snu" className="categories__card">
            <div className="categories__img-wrap">
              <img
                src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop"
                alt="Kolekcja Snu"
              />
              <div className="categories__overlay"></div>
              <div className="categories__ribbon">
                <h3>Kolekcja SNU</h3>
              </div>
            </div>
            <p className="categories__desc">
              Wygodne materace, łóżka tapicerowane i kontynentalne dla idealnego
              wypoczynku.
            </p>
          </Link>

          <Link to="/strefa-komfortu" className="categories__card">
            <div className="categories__img-wrap">
              <img
                src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop"
                alt="Strefa Komfortu"
              />
              <div className="categories__overlay"></div>
              <div className="categories__ribbon">
                <h3>Strefa KOMFORTU</h3>
              </div>
            </div>
            <p className="categories__desc">
              Eleganckie narożniki, miękkie sofy i fotele do Twojego salonu.
            </p>
          </Link>

          <Link to="/dodatki" className="categories__card">
            <div className="categories__img-wrap">
              <img
                src="https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800&auto=format&fit=crop"
                alt="Dodatki"
              />
              <div className="categories__overlay"></div>
              <div className="categories__ribbon">
                <h3>Dodatki</h3>
              </div>
            </div>
            <p className="categories__desc">
              Puszyste poduszki, kołdry i akcesoria dopełniające aranżację.
            </p>
          </Link>

          <Link to="/zestawy" className="categories__card">
            <div className="categories__img-wrap">
              <img
                src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=800&auto=format&fit=crop"
                alt="Zestawy"
              />
              <div className="categories__overlay"></div>
              <div className="categories__ribbon">
                <h3>Zestawy</h3>
              </div>
            </div>
            <p className="categories__desc">
              Gotowe, spójne kompozycje mebli dla perfekcyjnie urządzonego
              wnętrza.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
