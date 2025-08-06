import { Database } from "sqlite3";

export interface SessionInterface {
    session_id: string;
    token?: string;
}

export function addSession(db: Database, sessionId: string, token?: string): Promise<SessionInterface> {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO Sessions (session_id, token) VALUES (?, ?)`;
        db.run(sql, [sessionId, token || null], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ session_id: sessionId, token });
            }
        });
    });
}

export function deleteSession(db: Database, sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM Sessions WHERE session_id = ?`;
        db.run(sql, [sessionId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
