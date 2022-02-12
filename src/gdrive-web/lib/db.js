import registerService from "./registerService";
import { Pool } from "pg";

const connectionString =
    "postgres://vlvxpaivcnvreh:67207d05c17035f9b107be1f380d52c482b64ea6c0b27497a1bbd1f63c76fdaf@ec2-184-73-243-101.compute-1.amazonaws.com:5432/dcun694n4gepd4";

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
