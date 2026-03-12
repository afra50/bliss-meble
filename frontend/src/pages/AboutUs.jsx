import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import "../styles/pages/about-us.scss";
import aboutus3 from "../assets/aboutus3.jpg";
import aboutus2 from "../assets/aboutus2.jpg";

function AboutUs() {
	const navigate = useNavigate();

	return (
		<main className="about-page">
			{/* SEKCJA 1: Nachodzący Box */}
			<section className="about-block about-block--hero">
				<div className="about-image">
					<img src={aboutus3} alt="dzieci bawiące się na kanapie" />
				</div>
				<div className="about-contener about-overlap-box">
					<span className="about-label">Nasza filozofia</span>
					<h2 className="about-subtitle">
						Pasja, która stała się <em>Twoim komfortem</em>
					</h2>
					<p className="about-text">
						W Bliss Meble wierzymy, że design to nie tylko wygląd, ale przede
						wszystkim uczucie spokoju, gdy siadasz na ulubionej sofie po długim
						dniu.
					</p>
				</div>
			</section>

			{/* SEKCJA 2: Plakietka 15 lat */}
			<section className="about-block">
				<div className="about-image about-image--with-badge">
					<div className="about-badge">
						<span className="badge-number">15</span>
						<span className="badge-text">Lat rzemiosła</span>
					</div>
					<img src={aboutus2} alt="dziecięce nogi na tle kanapy" />
				</div>
				<div className="about-contener">
					<span className="about-label">Bliss story</span>
					<h2 className="about-subtitle">Od warsztatu do Twojego salonu</h2>
					<p className="about-text" style={{ marginBottom: "1.5rem" }}>
						Nasza droga zaczęła się od fascynacji naturalnymi materiałami.
						Chcieliśmy stworzyć meble, które przetrwają próbę czasu – nie tylko
						pod kątem wytrzymałości, ale i estetyki.
					</p>
					<p className="about-text">
						Każdy projekt Bliss to efekt setek godzin rozmów, szkiców i testów
						wygody. Wybieramy tylko te tkaniny, które chcielibyśmy mieć we
						własnych domach.
					</p>
				</div>
			</section>

			{/* SEKCJA 3: Trzy kolumny z tłem (Wyśrodkowane i rozciągnięte) */}
			<section className="about-features">
				<div className="features-grid">
					<div className="feature-item">
						<h3 className="feature-title">Jakość bez kompromisów</h3>
						<p className="feature-desc">
							Stosujemy stelaże z litego drewna i najwyższej klasy pianki
							wysokoelastyczne.
						</p>
					</div>
					<div className="feature-item">
						<h3 className="feature-title">Lokalna produkcja</h3>
						<p className="feature-desc">
							Wspieramy polskie rzemiosło. Każdy mebel powstaje w naszej
							lokalnej manufakturze.
						</p>
					</div>
					<div className="feature-item">
						<h3 className="feature-title">Ekologia i Troska</h3>
						<p className="feature-desc">
							Wybieramy dostawców tkanin posiadających certyfikaty OEKO-TEX i
							dbamy o środowisko.
						</p>
					</div>
				</div>
			</section>

			{/* SEKCJA 4: Wezwanie do akcji (Taka sama wysokość jak pasek wyżej) */}
			<section className="about-cta">
				<h2 className="cta-title">Gotowy na nową definicję wygody?</h2>
				<Button variant="primary" onClick={() => navigate("/")}>
					ZOBACZ NASZE KOLEKCJE
				</Button>
			</section>
		</main>
	);
}

export default AboutUs;
