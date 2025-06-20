const pool = require("../db");

const getNGOCategories = async () => {
    const result = await pool.query("SELECT * FROM ngo_categories");
    return result.rows;
};

const getNGOsByCategory = async (type_id) => {
    const result = await pool.query("SELECT * FROM ngos WHERE type_id = $1", [type_id]);
    return result.rows;
};




module.exports = { getNGOCategories, getNGOsByCategory  };