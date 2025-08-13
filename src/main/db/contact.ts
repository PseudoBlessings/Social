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