import {Database} from 'sqlite3'

export interface ContactInterface {
    contact_id:string;
    first_name:string;
    last_name:string;
    nickname:string;
    label:string;
    address:string;
    is_favorite:boolean;
}

