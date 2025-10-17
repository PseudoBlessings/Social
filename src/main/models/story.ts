export interface Story {
    story_id: string;
    account_id: string;
    platform_id: string;
    author: string;
    expire_by: string; // ISO string
    timestamp: string; // ISO string
    media_urls?: string | null;
}