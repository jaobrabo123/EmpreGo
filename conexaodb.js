import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let dbInstance;

export async function getDatabase() {
    if (!dbInstance) {
        dbInstance = await open({
            filename: './database.db',
            driver: sqlite3.Database
        });
    }
    return dbInstance;
}
