import {Database} from 'sqlite3';

export interface StoryInterface{
    story_id: string;
    account_id: string;
    platform_id: string;
    author: string;
    expire_by: string;
    timestamp: string;
    media_urls: string;
}

export function addStory(db : Database, new_story : StoryInterface) : Promise<StoryInterface>{
    return new Promise((resolve, reject) => {
        const sql : string = `INSERT INTO Stories (story_id, account_id, platform_id, author, expire_by, timestamp, media_urls) VALUES (?, ?, ?, ?, ?, ?, ?);`;
        db.run(sql, [new_story.story_id,new_story.account_id,new_story.platform_id,new_story.author,new_story.expire_by,new_story.timestamp,new_story.media_urls],(err) =>{
            if(err){
                reject(err);
            }
            else{
                const sql:string = `SELECT * FROM Stories WHERE story_id = ?`
                db.get(sql, [new_story.story_id], (err, row:StoryInterface) =>{
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(row);
                    }
                })
            }
        })
    })
}

export function removeStory(db: Database, story_id: string): Promise<boolean>{
    return new Promise((resolve, reject) => {
        const sql : string = `DELETE FROM Stories WHERE story_id = ?`;
        db.run(sql, [story_id], function (err){
            if(err){
                reject(err);
            }
            else{
                resolve(this.changes > 0)
            }
        })
    })
}

export function updateStory(db: Database, story_id:string, new_story:Partial<StoryInterface>): Promise<StoryInterface>{
    return new Promise((resolve, reject) =>{
        if (!new_story || Object.keys(new_story).length === 0) {
            return reject(new Error('At least one field must be updated'));
        }
        const fields = Object.keys(new_story).map(key => `${key} = ?`).join(', ');
        const values = Object.values(new_story);
    
        const sql = `UPDATE Stories SET ${fields} WHERE story_id = ?`;

        db.run(sql, [...values, story_id], function(err) {
            if (err) {
                reject(err);
            } else {
                const sql = `SELECT * FROM Stories WHERE story_id = ?`;
                db.get(sql, [story_id], (err, row: StoryInterface) => {
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

export function getStory(db: Database, story_id:string): Promise<StoryInterface>{
    return new Promise((resolve, reject) =>{
        const sql : string = `SELECT * FROM Stories WHERE story_id = ?`;
        db.get(sql, [story_id], (err, row:StoryInterface) =>{
            if(err){
                reject(err);
            }
            else{
                resolve(row);
            }
        });
    });
}