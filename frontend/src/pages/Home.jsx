import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import Bestseller from "../components/home/Bestseller";
import Promotions from "../components/home/Promotions";

const Home = () => {
  return (
    <main>
      <Hero />
      <Categories />
      <Bestseller />
      <Promotions />
    </main>
  );
};

export default Home;
