import React from "react";
import Button from "../components/ui/Button";
import { RotateCcw, Wrench, Truck, Phone } from "lucide-react";
import "../styles/pages/complaints.scss";

function Complaints() {
	return (
		<main className="complaints-page">
			<header className="complaints-header">
				<h1 className="complaints-title">Zwroty i Reklamacje</h1>
				<p className="complaints-intro">
					Zadowolenie naszych Klientów jest dla nas priorytetem. Dbamy o to, aby
					procesy zwrotów i zgłoszeń reklamacyjnych przebiegały sprawnie,
					transparentnie i w pełnej zgodności z obowiązującymi przepisami prawa,
					w tym z naszym Regulaminem Sklepu.
				</p>
			</header>

			<section className="complaints-section">
				<h2 className="complaints-subtitle">
					<RotateCcw size={28} />
					1. Prawo odstąpienia od umowy (Zwroty)
				</h2>
				<p className="complaints-text">
					Zgodnie z §7 Regulaminu, jako Konsument masz prawo odstąpić od umowy
					zawartej na odległość bez podania przyczyny.
				</p>
				<ul className="complaints-list">
					<li className="complaints-list-text">
						<strong>Termin:</strong> Czas na odstąpienie od umowy wynosi{" "}
						<strong>14 dni</strong> i jest liczony od dnia objęcia Towaru w
						posiadanie.
					</li>
					<li className="complaints-list-text">
						<strong>Jak zgłosić zwrot?</strong> W celu skorzystania z prawa
						odstąpienia, wyślij oświadczenie drogą elektroniczną na adres
						e-mail: <strong>kontakt@blissmeble.pl</strong>.
					</li>
					<li className="complaints-list-text">
						<strong>Koszty zwrotu:</strong> Bezpośrednie koszty zwrotu Towaru
						ponosi Klient, chyba że Sprzedawca postanowi inaczej.
					</li>
					<li className="complaints-list-text">
						<strong>Zwrot środków:</strong> Sprzedawca zwróci wszystkie
						otrzymane płatności nie później niż w terminie 14 dni od dnia
						otrzymania towaru. Zwrot środków może zostać wstrzymany do czasu
						otrzymania Towaru lub dowodu jego odesłania.
					</li>
					<li className="complaints-list-text">
						<strong>Wyłączenia prawa odstąpienia:</strong> Zgodnie z §8
						Regulaminu, prawo odstąpienia nie przysługuje m.in. w przypadku
						Towarów wykonanych na indywidualne zamówienie oraz treści cyfrowych
						dostarczanych bez nośnika materialnego (za zgodą Klienta).
					</li>
				</ul>
			</section>

			<section className="complaints-section">
				<h2 className="complaints-subtitle">
					<Wrench size={28} />
					2. Reklamacje (Niezgodność towaru z umową)
				</h2>
				<p className="complaints-text">
					Sprzedawca ponosi odpowiedzialność za zgodność Towaru z umową zgodnie
					z obowiązującymi przepisami prawa. Każda reklamacja rozpatrywana jest
					indywidualnie, z uwzględnieniem rodzaju wady oraz możliwości jej
					usunięcia.
				</p>
				<ul className="complaints-list">
					<li className="complaints-list-text">
						<strong>Procedura zgłoszenia:</strong> Reklamacje należy składać
						drogą elektroniczną na adres: <strong>kontakt@blissmeble.pl</strong>
					</li>
					<li className="complaints-list-text">
						<strong>Co powinno zawierać zgłoszenie?</strong> Aby usprawnić
						proces, reklamacja powinna zawierać:
						<ul className="complaints-list">
							<li className="complaints-list-text">
								Dane Klienta (imię i nazwisko, adres, telefon kontaktowy).
							</li>
							<li className="complaints-list-text">
								Numer zamówienia lub fakturę.
							</li>
							<li className="complaints-list-text">
								Dokładny opis niezgodności.
							</li>
							<li className="complaints-list-text">Zdjęcie wady.</li>
							<li className="complaints-list-text">Twoje żądanie.</li>
						</ul>
					</li>
					<li className="complaints-list-text">
						<strong>Rozwiązanie reklamacji:</strong> Możliwe rozwiązania to
						m.in.: obniżenie ceny, wymiana konkretnego elementu, naprawa
						produktu lub inne rozwiązanie satysfakcjonujące obie strony.
					</li>
					<li className="complaints-list-text">
						<strong>Rozpatrzenie:</strong> Sprzedawca rozpatrzy reklamację w
						terminie do <strong>14 dni</strong> od dnia otrzymania zgłoszenia.
					</li>
				</ul>
			</section>

			<section className="complaints-section">
				<h2 className="complaints-subtitle">
					<Truck size={28} />
					3. Uszkodzenia w transporcie
				</h2>
				<p className="complaints-text">
					Dostawa realizowana jest na terytorium Polski (kurier lub paczkomaty).
					W przypadku stwierdzenia uszkodzenia towaru w trakcie dostawy zaleca
					się podjęcie poniższych kroków, co znacznie usprawnia proces
					rozpatrywania reklamacji.
				</p>
				<ul className="complaints-list">
					<li className="complaints-list-text">
						<strong>Dokumentacja:</strong> Zalecamy, aby Klient – w miarę
						możliwości – udokumentował szkodę (wykonał zdjęcia).
					</li>
					<li className="complaints-list-text">
						<strong>Protokół szkody:</strong> Sporządzenie protokołu szkody w
						obecności kuriera (lub zgłoszenie uszkodzenia w aplikacji
						paczkomatu) pomaga w szybkim rozwiązaniu problemu.
					</li>
				</ul>
			</section>

			<section className="complaints-section">
				<h2 className="complaints-subtitle">
					<Phone size={28} />
					4. Dane kontaktowe
				</h2>
				<ul className="complaints-list">
					<li className="complaints-list-text">
						<strong>Nazwa firmy:</strong> BLISS MEBLE Rafał Redes
					</li>
					<li className="complaints-list-text">
						<strong>Adres siedziby:</strong> Walichnowy, ul. Słoneczna 62,
						98-420 Sokolniki
					</li>
					<li className="complaints-list-text">
						<strong>Telefon:</strong> 730 184 838
					</li>
					<li className="complaints-list-text">
						<strong>NIP / REGON:</strong> 9970163635 / 522740550
					</li>
					<li className="complaints-list-text">
						<strong>E-mail:</strong> kontakt@blissmeble.pl
					</li>
				</ul>
			</section>
		</main>
	);
}

export default Complaints;
