const pool = require("../config/db");

const Attribute = {
  findAllGroupsWithValues: async () => {
    const [groups] = await pool.execute(
      "SELECT * FROM attribute_groups ORDER BY name ASC",
    );

    // ZMIANA: Pobieramy też image_url z bazy
    const [allValues] = await pool.execute(
      "SELECT id, group_id, value, color_hex, image_url FROM attribute_values ORDER BY value ASC",
    );

    const formattedGroups = groups.map((group) => {
      return {
        ...group,
        values: allValues
          .filter((v) => v.group_id === group.id)
          // ZMIANA: Zwracamy image_url w obiekcie
          .map((v) => ({
            id: v.id,
            value: v.value,
            color_hex: v.color_hex,
            image_url: v.image_url,
          })),
      };
    });

    return formattedGroups;
  },

  // ZMIANA: Dodajemy imageUrl do zapytania INSERT
  createValue: async (groupId, value, colorHex, imageUrl) => {
    const [result] = await pool.execute(
      "INSERT INTO attribute_values (group_id, value, color_hex, image_url) VALUES (?, ?, ?, ?)",
      [groupId, value, colorHex, imageUrl],
    );
    return result.insertId;
  },

  deleteValue: async (id) => {
    await pool.execute("DELETE FROM attribute_values WHERE id = ?", [id]);
  },

  getValueById: async (id) => {
    const [rows] = await pool.execute(
      "SELECT image_url FROM attribute_values WHERE id = ?",
      [id],
    );
    return rows[0]; // Zwraca { image_url: "nazwa.webp" } lub undefined
  },
};

module.exports = Attribute;
