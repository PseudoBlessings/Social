export interface Post {
    post_id: string;
    account_id: string;
    platform_id: string;
    author: string;
    description?: string | null;
    timestamp: string; // ISO string
    media_urls?: string | null;
}