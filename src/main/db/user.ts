import { resolve } from 'path';
import {Database} from 'sqlite3';

export interface UserInterface {
    user_id: string;
    account_id: string;
    platform_id: string;
    display_name: string;
}

export function addUser(db: Database, user_id: string, account_id: string, platform_id: string, display_name?: string): Promise<UserInterface> {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO Users (user_id, account_id, platform_id, display_name)
                     VALUES (?, ?, ?, ?)`;
        db.run(sql, [user_id, account_id, platform_id, display_name], function(err) {
            if (err) {
                reject(err);
            } else {
                db.get(`SELECT * FROM Users WHERE user_id = ?`, [user_id], (err, row: UserInterface) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            }
        });
    });
}

export function deleteUser(db: Database, user_id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM Users WHERE user_id = ?`;
        db.run(sql, [user_id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function getUser(db: Database, user_id: string): Promise<UserInterface>{
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM Users WHERE user_id = ?`, [user_id], (err, row: UserInterface) => {
            if(err){
                reject(err);
            }
            else{
                resolve(row);
            }
        });
    });
}