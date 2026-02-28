import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import Bestseller from "../components/home/Bestseller";
import FeaturedProducts from "../components/home/FeaturedProducts";

const Home = () => {
  return (
    <main>
      <Hero />
      <Categories />
      <Bestseller />
      <FeaturedProducts />
    </main>
  );
};

export default Home;
