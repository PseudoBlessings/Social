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

export function deleteAccount(db: Database, account_id: string, platform_id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM Accounts WHERE account_id = ? AND platform_id = ?`;
        db.run(sql, [account_id, platform_id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes > 0 ? true : false); // Return the number of rows deleted
            }
        });
    });
}

export function getAccount(db: Database, account_id: string, platform_id: string): Promise<AccountInterface | null> {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM Accounts WHERE account_id = ? AND platform_id = ?`;
        db.get(sql, [account_id, platform_id], (err, row: AccountInterface) => {
            if (err) {
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
}

export function updateAccount(db: Database, account_id: string, platform_id: string, new_account: Partial<AccountInterface>): Promise<AccountInterface> {
    return new Promise((resolve, reject) => {
        if (!new_account) {
            return reject(new Error('At least one field must be updated'));
        }

        if (!account_id || !platform_id) {
            return reject(new Error('account_id and platform_id must be provided'));
        }

        const updates: string[] = [];
        const params: Array<string | null> = [];
        if (new_account.display_name) {
            updates.push('display_name = ?');
            params.push(new_account.display_name);
        }
        if (new_account.session_id) {
            updates.push('session_id = ?');
            params.push(new_account.session_id);
        }
        if (new_account.platform_id) {
            updates.push('platform_id = ?');
            params.push(new_account.platform_id);
        }
        if (new_account.account_id) {
            updates.push('account_id = ?');
            params.push(new_account.account_id);
        }
        if (new_account.social_account_id) {
            updates.push('social_account_id = ?');
            params.push(new_account.social_account_id);
        }

        const sql = `UPDATE Accounts SET ${updates.join(', ')} WHERE account_id = ? AND platform_id = ?`;
        db.run(sql, [...params, account_id, platform_id], function (err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                reject(new Error('No rows updated'));
            } else {
                // Return the updated account
                getAccount(db, account_id, platform_id).then(resolve).catch(reject);
            }
        });
    });
}