import { Data } from "electron";
import { Database } from "sqlite3";

export interface PostInterface {
    post_id: string;
    account_id: string;
    platform_id: string;
    author: string;
    description?: string;
    timestamp: string;
    media_urls: string;
}

export function addPost(db:Database,  new_post: PostInterface): Promise<PostInterface>{
        return new Promise((resolve, reject)=>{
            const sql = `INSERT INTO Posts (post_id, account_id, platform_id, author, description, timestamp, media_urls) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            db.run(sql, [new_post.post_id, new_post.account_id, new_post.platform_id, new_post.author, new_post.description ?? null, new_post.timestamp, new_post.media_urls], (err:Error) =>{
                if(err){
                    reject(err);
                }
                else{
                    const sql = `SELECT * FROM Posts WHERE post_id = ?`
                    db.get(sql, [new_post.post_id], (err:Error, row:PostInterface) =>{
                        if(err){
                            reject(err)
                        }
                        else{
                            resolve(row);
                        }
                    });
                }
        });
    });
}

export function removePost(db:Database, post_id: string): Promise<boolean>{
    return new Promise((resolve, reject) => {
        const sql = `DELETE FROM Posts WHERE post_id = ?`;
        db.run(sql, [post_id], function(err){
            if(err){
                reject(err);
            }
            else{
                resolve(this.changes > 0);
            }
        });
    });
}

export function updatePost(db: Database, post_id: string, new_post: Partial<PostInterface>): Promise<PostInterface>{
    return new Promise((resolve, reject) => {
        if (!new_post || Object.keys(new_post).length === 0) {
            return reject(new Error('At least one field must be updated'));
        }
        const fields = Object.keys(new_post).map(key => `${key} = ?`).join(', ');
        const values = Object.values(new_post);
    
        const sql = `UPDATE Posts SET ${fields} WHERE post_id = ?`;

        db.run(sql, [...values, post_id], function(err) {
            if (err) {
                reject(err);
            } else {
                const sql = `SELECT * FROM Posts WHERE post_id = ?`;
                db.get(sql, [post_id], (err, row: PostInterface) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            }
        });
    })
}

export function getPost(db: Database, post_id: string): Promise<PostInterface>{
    return new Promise((resolve, reject) => {
        const sql: string = `SELECT * FROM Posts WHERE post_id = ?`
        db.get(sql, (err, row : PostInterface) => {
            if (err){
                reject(err);
            }
            else{
                resolve(row);
            }
        });
    });
}