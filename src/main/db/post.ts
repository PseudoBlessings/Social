import { Data } from "electron";
import { Database } from "sqlite/build";

export interface PostInterface {
    post_id: string;
    account_id: string;
    platform_id: string;
    author: string;
    description?: string;
    timestamp: Date;
    media_urls: string;
}

export function addPost(db:Database,  new_post:Partial<PostInterface>): Promise<PostInterface>{
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