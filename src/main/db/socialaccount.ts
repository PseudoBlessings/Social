import {Database} from 'sqlite3';
import crypto from 'crypto';

export interface SocialAccountInterface {
    account_id: string;
    username: string;
    password: string|null;
}

export function addSocialAccount(db: Database, username: string, password?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const accountId = crypto.randomUUID();
        const sql = `INSERT INTO "Social Accounts" (account_id, username, password) VALUES (?, ?, ?)`;
        db.run(sql, [accountId, username, password], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(accountId);
            }
        });
    });
}

export function deleteSocialAccount(db: Database, accountId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM "Social Accounts" WHERE account_id = ?`;
        db.run(sql, [accountId], function(err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                reject(new Error('No rows deleted'));
            } else {
                resolve();
            }
        });
    });
}

export function getSocialAccount(db: Database, accountId: string): Promise<SocialAccountInterface> {
    return new Promise((resolve, reject) => {
        if (!accountId) {
            return reject(new Error('accountId must be provided'));
        }

        const sql = `SELECT * FROM "Social Accounts" WHERE account_id = ?`;
        db.get(sql, [accountId], (err, row: SocialAccountInterface) => {
            if (err) {
                reject(err);
            } else if (!row) {
                reject(new Error('No account found'));
            } else {
                resolve(row);
            }
        });
    });
}

export function updateSocialAccount(db: Database, accountId: string, username?: string, password?: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!accountId) {
            return reject(new Error('accountId must be provided'));
        }

        const updates = [];
        const params = [];

        if (username) {
            updates.push('username = ?');
            params.push(username);
        }
        if (password) {
            updates.push('password = ?');
            params.push(password);
        }

        if (updates.length === 0) {
            return resolve(); // No updates to perform
        }

        params.push(accountId); // accountId should be last

        const sql = `UPDATE "Social Accounts" SET ${updates.join(', ')} WHERE account_id = ?`;
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                reject(new Error('No rows updated'));
            } else {
                resolve();
            }
        });
    });
}

export function loginSocialAccount(db: Database, username: string, password?: string): Promise<SocialAccountInterface> {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM "Social Accounts" WHERE username = ? AND password = ?`;
        db.get(sql, [username, password], (err, row: SocialAccountInterface) => {
            if (err) {
                reject(err);
            } else if (!row) {
                reject(new Error('Invalid username or password'));
            } else {
                resolve(row);
            }
        });
    });
}