import {Database} from 'sqlite3';
import crypto from 'crypto';

export function initializeDatabase(databasePath: string): Promise<Database> {
    return new Promise((resolve, reject) => {
        const db = new Database(databasePath, (err) =>{
            if (err) {
                reject(err);
            }
            else{
                resolve(db);
            }
        })
    })
}

