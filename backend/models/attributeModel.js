const pool = require("../config/db");

const Attribute = {
  findAllGroupsWithValues: async () => {
    const [groups] = await pool.execute(
      "SELECT * FROM attribute_groups ORDER BY name ASC",
    );

    // ZMIANA: Pobieramy też color_hex z bazy
    const [allValues] = await pool.execute(
      "SELECT id, group_id, value, color_hex FROM attribute_values ORDER BY value ASC",
    );

    const formattedGroups = groups.map((group) => {
      return {
        ...group,
        values: allValues
          .filter((v) => v.group_id === group.id)
          // ZMIANA: Zwracamy color_hex w obiekcie
          .map((v) => ({ id: v.id, value: v.value, color_hex: v.color_hex })),
      };
    });

    return formattedGroups;
  },

  // ZMIANA: Dodajemy trzeci parametr (colorHex) do zapytania INSERT
  createValue: async (groupId, value, colorHex) => {
    const [result] = await pool.execute(
      "INSERT INTO attribute_values (group_id, value, color_hex) VALUES (?, ?, ?)",
      [groupId, value, colorHex],
    );
    return result.insertId;
  },

  deleteValue: async (id) => {
    await pool.execute("DELETE FROM attribute_values WHERE id = ?", [id]);
  },
};

module.exports = Attribute;
