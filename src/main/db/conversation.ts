import { Database } from "sqlite3";
import { Conversation } from ".";

export interface ConversationInterface{
    coversation_id: string;
    account_id: string;
    platform_id: string;
    conversation_name: string;
    most_recent_message?: string;
    is_group_chat: boolean;
    most_recent_sender?: string;
}

export function addConversation(db: Database, new_conversation:ConversationInterface): Promise<ConversationInterface> {
    return new Promise((resolve, reject) => {
        const sql:string = `INSERT INTO Conversation (conversation_id, account_id, platform_id, conversation_name, most_recent_message, is_group_chat, most_recent_sender) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [new_conversation.coversation_id, new_conversation.account_id, new_conversation.platform_id,new_conversation.conversation_name,new_conversation.most_recent_message,new_conversation.is_group_chat,new_conversation.most_recent_sender], function (err) {
            if (err) {
                reject(err);
            } else {
                const sql:string = `SELECT * FROM Conversation WHERE conversation_id = ?`;
                db.get(sql, (err, row:ConversationInterface) =>{
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