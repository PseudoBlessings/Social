import { Database } from "sqlite3";

export interface ConversationInterface{
    coversation_id: string;
    account_id: string;
    platform_id: string;
    conversation_name: string;
    most_recent_message: string;
    is_group_chat: boolean;
    most_recent_sender: string;
}