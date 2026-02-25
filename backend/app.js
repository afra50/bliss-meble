const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors()); // Pozwala frontendowi (np. React) na komunikację z tym API
app.use(express.json()); // Pozwala Expressowi czytać dane w formacie JSON

// Przykładowy endpoint (trasa)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Backend is working! 🚀",
    timestamp: new Date().toISOString(),
  });
});

// Obsługa nieistniejących tras (404)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

module.exports = app;
