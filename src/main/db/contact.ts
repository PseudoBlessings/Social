import { Data } from 'electron';
import {Database} from 'sqlite3'

export interface ContactInterface {
    contact_id:string;
    first_name:string;
    last_name?:string;
    nickname?:string;
    label?:string;
    address?:string;
    is_favorite?:boolean;
}

export function addContact(db:Database, new_contact : Partial<ContactInterface>):Promise<ContactInterface>{
    return new Promise((resolve, reject) =>{
        if(new_contact.contact_id == undefined || new_contact.contact_id.length === 0){
            reject(new Error('Contact ID is required'));
        }
        
        if(new_contact.first_name == undefined || new_contact.first_name.length === 0){
            reject(new Error('First Name is required'));
        }

        const sql = `INSERT INTO Contacts (contact_id, first_name, last_name, nickname, label, address, is_favorite)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`
        db.run(sql, [new_contact.contact_id, new_contact.first_name, new_contact.last_name ?? null, new_contact.nickname ?? null, new_contact.label ?? null, new_contact.address ?? null, new_contact.is_favorite ?? null], function(err){
            if(err){
                reject(err);
            }
            else{
                db.get(`SELECT * FROM Contacts WHERE contact_id = ?`,[new_contact.contact_id], (err, row:ContactInterface) => {
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(row);
                    }
                })
            }
        })
    })
}

export function deleteContact(db:Database, contact_id:string):Promise<void>{
    return new Promise((resolve, reject) =>{
        const sql = `DELETE FROM Contacts WHERE contact_id = ?`
        db.run(sql, [contact_id], (err) =>{
            if(err){
                reject(err);
            }
            else{
                resolve();
            }
        })
    })
}

export function getContact(db:Database, contact_id:string):Promise<ContactInterface | null>{
    return new Promise((resolve, reject) =>{
        const sql = `SELECT * FROM Contact WHERE contact_id = ?`;
        db.get(sql, [contact_id], (err, row: ContactInterface) =>{
            if(err){
                reject(err);
            }
            else{
                resolve(row || null);
            }
        })
    })
}