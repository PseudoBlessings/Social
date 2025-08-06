import {Database} from 'sqlite3';

    export interface PlatformInterface {
        platform_id: string;
        platform_name: string;
        session_id: string;
    }

    export function addPlatform(db: Database, platform_id: string, platform_name: string, session_id: string): Promise<PlatformInterface> {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO Platforms (platform_id, platform_name, session_id)
                        VALUES (?, ?, ?)`;
            db.run(sql, [platform_id, platform_name, session_id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    db.get(`SELECT * FROM Platforms WHERE platform_id = ?`, [platform_id], (err, row: PlatformInterface) => {
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
    
    export function deletePlatform(db: Database, platform_id: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM Platforms WHERE platform_id = ?`;
            db.run(sql, [platform_id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }
    
    export function getPlatform(db: Database, platform_id: string): Promise<PlatformInterface | null> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM Platforms WHERE platform_id = ?`;
            db.get(sql, [platform_id], (err, row: PlatformInterface) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row || null);
                }
            });
        });
    }
    
    export function updatePlatform(db: Database, platform_id: string, new_platform: Partial<PlatformInterface>): Promise<PlatformInterface> {
        return new Promise((resolve, reject) => {
            if (!new_platform || Object.keys(new_platform).length === 0) {
                return reject(new Error('At least one field must be updated'));
            }
    
            const fields = Object.keys(new_platform).map(key => `${key} = ?`).join(', ');
            const values = Object.values(new_platform);
    
            const sql = `UPDATE Platforms SET ${fields} WHERE platform_id = ?`;
            db.run(sql, [...values, platform_id], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    db.get(`SELECT * FROM Platforms WHERE platform_id = ?`, [platform_id], (err, row: PlatformInterface) => {
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