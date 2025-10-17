export interface Conversation {
    conversation_id: string;
    account_id: string;
    platform_id: string;
    conversation_name?: string | null;
    is_group_chat?: boolean;
    most_recent_message?: string | null;
    most_recent_sender?: string | null;
}

export interface Message{
    message_id:string;
    conversation_id:string;
    sender:string;
    timestamp:string;
    has_sent?:boolean;
    has_received?:boolean;
    media_urls?:string;
    text?:string;
}