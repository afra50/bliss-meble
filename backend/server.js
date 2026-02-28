// Ładowanie zmiennych środowiskowych z pliku .env
require("dotenv").config();

const app = require("./app");
const http = require("http");

// Pobieranie portu z .env lub ustawienie domyślnego na 5000
const PORT = process.env.PORT || 5000;

// Tworzenie serwera
const server = http.createServer(app);

// Uruchamianie nasłuchiwania
server.listen(PORT, () => {
  console.log(`
  ################################################
  🛡️  Serwer uruchomiony na porcie: ${PORT} 🛡️
  ################################################
  `);
});

// Obsługa błędów podczas startu serwera
server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  console.error("Błąd serwera:", error);
  process.exit(1);
});
