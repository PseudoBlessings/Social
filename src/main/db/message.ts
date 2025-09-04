import { Database } from "sqlite3";

export interface MessageInterface{
    message_id:string;
    conversation_id:string;
    sender:string;
    timestamp:string;
    has_sent?:boolean;
    has_received?:boolean;
    media_urls?:string;
    text?:string;
}

export function addMessage(db:Database, new_message:MessageInterface):Promise<MessageInterface>{
    return new Promise((resolve, reject)=>{
        const sql:string = `INSERT INTO Messages (message_id, conversation_id, sender, timestamp, has_sent, has_received, media_urls, text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [new_message.message_id, new_message.conversation_id, new_message.sender, new_message.timestamp, new_message.has_sent ? 1 : 0, new_message.has_received ? 1 : 0, new_message.media_urls || null, new_message.text || null], function(err){
            if(err){
                reject(err);
            }
            else{
                db.get(`SELECT * FROM Messages WHERE message_id = ?`, [new_message.message_id], (err, row:MessageInterface)=>{
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(row);
                    }
                });
            }
        });
    });
}

export function removeMessage(db:Database, message_id:string):Promise<boolean>{
    return new Promise((resolve, reject)=>{
        const sql:string = `DELETE FROM Messages WHERE message_id = ?`;
        db.run(sql, [message_id], function(err){
            if(err){
                reject(err);
            }
            else{
                resolve(this.changes > 0);
            }
        });
    });
}

export function updateMessage(db:Database, message_id:string, updated_fields:Partial<MessageInterface>):Promise<MessageInterface>{
    return new Promise((resolve, reject)=>{
        const fields = Object.keys(updated_fields);
        const values = Object.values(updated_fields);
        if(fields.length === 0){
            return reject(new Error("No fields to update"));
        }
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const sql:string = `UPDATE Messages SET ${setClause} WHERE message_id = ?`;
        db.run(sql, [...values, message_id], function(err){
            if(err){
                reject(err);
            }
            else{
                db.get(`SELECT * FROM Messages WHERE message_id = ?`, [message_id], (err, row:MessageInterface)=>{
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(row);
                    }
                });
            }
        });
    });
}

export function getMessage(db:Database, message_id:string):Promise<MessageInterface>{
    return new Promise((resolve, reject)=>{
        const sql:string = `SELECT * FROM Messages WHERE message_id = ?`;
        db.get(sql, [message_id], (err, row:MessageInterface)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(row);
            }
        });
    });
}