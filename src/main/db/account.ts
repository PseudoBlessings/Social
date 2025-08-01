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

export function addAccount(db: Database, account_id: string, social_account_id: string, platform_id: string, session_id: string, display_name?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO Accounts (account_id, social_account_id, platform_id, session_id, display_name)
                    VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [account_id, social_account_id, platform_id, session_id, display_name], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(account_id);
            }
        });
    });
}
