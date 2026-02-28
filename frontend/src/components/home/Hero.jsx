import Button from "../ui/Button";
import "../../styles/components/home/hero.scss";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1>Odkryj harmonię Bliss</h1>
        <p>
          Kolekcje SNU i Strefa KOMFORTU, które wprowadzą luksus i spokój do
          Twojego wnętrza.
        </p>
        <Button to="/zestawy" variant="primary">
          Zobacz produkty
        </Button>
      </div>
    </section>
  );
};

export default Hero;
