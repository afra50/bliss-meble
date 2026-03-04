const pool = require("../config/db");

const Attribute = {
  // Pobiera wszystkie grupy wraz z ich wartościami (np. do formularza produktu)
  findAllGroupsWithValues: async () => {
    const queryGroups = "SELECT * FROM attribute_groups ORDER BY name ASC";
    const [groups] = await pool.execute(queryGroups);

    for (let group of groups) {
      const [values] = await pool.execute(
        "SELECT id, value FROM attribute_values WHERE group_id = ? ORDER BY value ASC",
        [group.id],
      );
      group.values = values;
    }

    return groups;
  },

  createValue: async (groupId, value) => {
    const [result] = await pool.execute(
      "INSERT INTO attribute_values (group_id, value) VALUES (?, ?)",
      [groupId, value],
    );
    return result.insertId;
  },

  deleteValue: async (id) => {
    await pool.execute("DELETE FROM attribute_values WHERE id = ?", [id]);
  },
};

module.exports = Attribute;
