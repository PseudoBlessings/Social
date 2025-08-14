import { Database } from "sqlite/build";

export interface PostInterface {
    post_id: string;
    account_id: string;
    platform_id: string;
    author: string;
    description?: string;
    timestamp: Date;
    media_url: string;
}