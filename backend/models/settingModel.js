const pool = require("../config/db");

const Setting = {
	// Pobieranie wszystkich ustawień (jako tablica obiektów)
	getAll: async () => {
		const [rows] = await pool.execute(
			"SELECT setting_key, setting_value FROM settings",
		);
		return rows;
	},

	// Zapisywanie wielu ustawień naraz (tablica obiektów {key, value})
	saveMultiple: async (settingsArray) => {
		if (!settingsArray || settingsArray.length === 0) return true;

		const connection = await pool.getConnection();
		try {
			await connection.beginTransaction();

			const query = `
        INSERT INTO settings (setting_key, setting_value) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `;

			for (const item of settingsArray) {
				await connection.execute(query, [item.key, item.value]);
			}

			await connection.commit();
			return true;
		} catch (error) {
			await connection.rollback();
			throw error;
		} finally {
			connection.release();
		}
	},
};

module.exports = Setting;
