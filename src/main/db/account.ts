import {Database} from 'sqlite3';
import * as dbFunctions from './index';
import crypto from 'crypto';
export interface AccountInterface {
    account_id: string;
    social_account_id: string;
    platform_id: string;
    session_id: string;
    display_name: string;
}

export function addAccount(db: Database, account_id: string, social_account_id: string, platform_id: string, session_id: string, display_name?: string): Promise<AccountInterface> {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO Accounts (account_id, social_account_id, platform_id, session_id, display_name)
                    VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [account_id, social_account_id, platform_id, session_id, display_name], function (err) {
            if (err) {
                reject(err);
            } else {
                // combine account_id and platform_id to create a unique identifier
                db.get(`SELECT * FROM Accounts WHERE account_id = ? AND platform_id = ?`, [account_id, platform_id], (err, row: AccountInterface) => {
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

export function deleteAccount(db: Database, account_id: string, platform_id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM Accounts WHERE account_id = ? AND platform_id = ?`;
        db.run(sql, [account_id, platform_id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
