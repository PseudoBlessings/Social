import {Database} from 'sqlite3';

interface UserInterface {
    user_id: string;
    account_id: string;
    platform_id: string;
    display_name: string;
}

function addUser(db: Database, user: UserInterface): Promise<void> {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO Users (user_id, account_id, platform_id, display_name)
                     VALUES (?, ?, ?, ?)`;
        db.run(sql, [user.user_id, user.account_id, user.platform_id, user.display_name], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}