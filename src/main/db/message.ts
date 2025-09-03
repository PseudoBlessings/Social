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