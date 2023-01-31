import * as fs from "fs";
import { Pool } from "pg";
import registerService from "./registerService";

let password = process.env.DB_PASSWORD;

if (process.env.DB_PASSWORD_FILE) {
    password = fs.readFileSync(process.env.DB_PASSWORD_FILE, "utf-8");
}

if (!password) {
    console.error(`Database Password Invalid: '${process.env.DB_PASSWORD}'`);
    process.exit(1);
}

const pool = registerService("db", () => {
    const pool = new Pool({
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || "5432"),
        host: process.env.DB_HOST || "db",
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
    query: (text: any, params?: any) => pool.query(text, params),
};
