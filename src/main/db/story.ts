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