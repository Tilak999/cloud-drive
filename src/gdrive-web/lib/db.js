import registerService from "./registerService";
import { Pool } from "pg";
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("Database url is empty, set env variable 'DATABASE_URL'");
    process.exit(1);
}

const pool = registerService("db", () => {
    const pool = new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false,
        },
    });
    createTables(pool);
    return pool;
});

async function createTables(pool) {
    await pool.connect();
    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id serial PRIMARY KEY,
        uuid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        key JSON NOT NULL
     )`);
}

export default {
    query: (text, params) => pool.query(text, params),
};
