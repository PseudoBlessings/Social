import { Database } from "sqlite3";
import { Conversation } from ".";

export interface ConversationInterface{
    conversation_id: string;
    account_id: string;
    platform_id: string;
    conversation_name: string;
    most_recent_message?: string;
    is_group_chat: boolean;
    most_recent_sender?: string;
}

export function addConversation(db: Database, new_conversation:ConversationInterface): Promise<ConversationInterface> {
    return new Promise((resolve, reject) => {
        const sql:string = `INSERT INTO Conversations (conversation_id, account_id, platform_id, conversation_name, most_recent_message, is_group_chat, most_recent_sender) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [new_conversation.conversation_id, new_conversation.account_id, new_conversation.platform_id,new_conversation.conversation_name,new_conversation.most_recent_message||null,new_conversation.is_group_chat,new_conversation.most_recent_sender||null], function (err) {
            if (err) {
                reject(err);
            } else {
                const sql:string = `SELECT * FROM Conversations WHERE conversation_id = ?`;
                db.get(sql,[new_conversation.conversation_id], (err, row:ConversationInterface) =>{
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(row);
                    }
                })
            }
        });
    });
}

export function removeConversation(db: Database, conversation_id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const sql:string = `DELETE FROM Conversations WHERE conversation_id = ?`;
        db.run(sql, [conversation_id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });
    });
}

export function updateConversation(db:Database, conversation_id:string, new_conversation:Partial<ConversationInterface>): Promise<ConversationInterface>{
    return new Promise((resolve, reject) => {
        if (!new_conversation || Object.keys(new_conversation).length === 0) {
                return reject(new Error('At least one field must be updated'));
        }
        const fields = Object.keys(new_conversation).map(key => `${key} = ?`).join(', ');
        const values = Object.values(new_conversation);
        const sql = `UPDATE Conversations SET ${fields} WHERE conversation_id = ?`;
        db.run(sql, [...values, conversation_id], function (err) {
            if (err) {
                reject(err);
            }
            else {
                const sql:string = `SELECT * FROM Conversations WHERE conversation_id = ?`;
                db.get(sql,[conversation_id], (err, row:ConversationInterface) =>{
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(row);
                    }
                })
            }
        });
    })
}

export function getConversation(db:Database, conversation_id:string): Promise<ConversationInterface | null>{
    return new Promise((resolve, reject) => {
        const sql:string = `SELECT * FROM Conversations WHERE conversation_id = ?`;
        db.get(sql,[conversation_id], (err, row:ConversationInterface) =>{
            if(err){
                reject(err);
            }
            else{
                resolve(row || null);
            }
        });
    });
}