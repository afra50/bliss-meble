import Button from "../components/ui/Button";
import "../styles/pages/about-us.scss";
import aboutus1 from "../assets/aboutus1.jpg";
import aboutus2 from "../assets/aboutus2.jpg";

function AboutUs() {
  return (
    <main className="about-page">
      <header className="about-header">
        <h1 className="about-title">O nas</h1>
      </header>
      <section className="about-block">
        <div className="about-contener">
          <h2 className="about-subtitle">Tworzymy przestrzeń do życia...</h2>
          <p className="about-text">
            Wierzymy, że meble to coś więcej niż tylko przedmioty– to serce
            każdego domu i tło dla codziennych chwil z bliskimi. Naszą pasją
            jest tworzenie wnętrz, które inspirują i dają poczucie prawdziwego
            komfortu. Dlatego oferujemy starannie wyselekcjonowane projekty,
            które idealnie łączą nowoczesny, elegancki design z bezkompromisową
            wygodą i funkcjonalnością.
          </p>
        </div>
        <div className="about-image">
          <img src={aboutus1} alt="dzieci bawiące się na kanapie" />
        </div>
      </section>
      <section className="about-block-reverse">
        <div className="about-contener">
          <h2 className="about-subtitle">Jakość, która zostaje na lata...</h2>
          <p className="about-text">
            W kwestii wykonania nie uznajemy półśrodków. Stawiamy na solidne
            materiały, precyzję rzemiosła i dbałość o najmniejszy detal.
            Wybieramy trwałe tkaniny i niezawodne konstrukcje, aby nasze meble
            służyły przez długi czas, nie tracąc na swoim uroku. Twój dom to
            Twoja oaza– pomagamy urządzić go tak, by każdego dnia z
            przyjemnością do niego wracać.
          </p>
        </div>
        <div className="about-image">
          <img src={aboutus2} alt="dziecięce nogi na tle kanapy" />
        </div>
      </section>
    </main>
  );
}

export default AboutUs;
