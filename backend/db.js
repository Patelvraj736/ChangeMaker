const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "changemaker",
    password: "Vraj@01022004",
    port: 5432,
});

module.exports = pool;
