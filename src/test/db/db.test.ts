import * as dbFunctions from '../../main/db/index';
import { SocialAccountInterface } from '../../main/db/index';
import fs from 'fs';
import {Database} from 'sqlite3';  
const dbPath = __dirname + '/db_test.sqlite';
let db: Database;

beforeAll(async () => {
    if(fs.existsSync(dbPath))
        fs.unlinkSync(dbPath);
    db = await dbFunctions.initializeDatabase(dbPath);
    await dbFunctions.createTables(db);
});

afterAll((done) => {
        db.close((err) =>{
        if (fs.existsSync(dbPath)){
            try{
                fs.unlinkSync(dbPath);
            }catch(err){
                console.error("Error deleting test database file:", err);
            }
        }
        done();
    });
});

test('Database Initialization Test', (done) => {
    expect(db).toBeDefined();
    done();
});

test('Create Tables Test', (done) => {
    // Check if tables were created successfully
    db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, rows) => {
        expect(err).toBeNull();
        expect(rows.length).toBeGreaterThan(0);
        done();
    });
});

describe('Database Social Accounts Table Functionality', () => {
    beforeEach(()=>{
        // Ensure the "Social Accounts" table is empty before each test
        db.run(`DELETE FROM "Social Accounts"`, [], (err) => {
            expect(err).toBeNull();
        });
    });
    test('Adding Social Account to Database', (done) => {
        dbFunctions.SocialAccount.addSocialAccount(db, 'testuser', 'testpassword').then((account_id) => {
            expect(account_id).toBeDefined();
            db.get(`SELECT * FROM "Social Accounts" WHERE account_id = ?`, [account_id], (err, row: SocialAccountInterface) => {
            expect(err).toBeNull();
            expect(row).toBeDefined();
            expect(row.account_id).toBe(account_id);
            expect(row.username).toBe('testuser');
            expect(row.password).toBe('testpassword');
            done();
        });
        }).catch((err) => {
            console.error("Error adding social account:", err);
        });
    });

    test('Adding Social Account with Empty Password', (done) => {
        dbFunctions.SocialAccount.addSocialAccount(db, 'testuser').then((account_id) => {
            expect(account_id).toBeDefined();
            db.get(`SELECT * FROM "Social Accounts" WHERE account_id = ?`, [account_id], (err, row: SocialAccountInterface) => {
                expect(err).toBeNull();
                expect(row).toBeDefined();
                expect(row.account_id).toBe(account_id);
                expect(row.username).toBe('testuser');
                expect(row.password).toBeNull();
                done();
            });
        }).catch((err) => {
            console.error("Error adding social account:", err);
        });
    });

    test('Deleting Social Account from Database', (done) => {
        let account_id: any;
        dbFunctions.SocialAccount.addSocialAccount(db, 'testuser', 'testpassword').then((id) => {
            account_id = id;
            return dbFunctions.SocialAccount.deleteSocialAccount(db, account_id);
        }).then(() => {
            db.get(`SELECT * FROM "Social Accounts" WHERE account_id = ?`, [account_id], (err, row: SocialAccountInterface) => {
                expect(err).toBeNull();
                expect(row).toBeUndefined();
                done();
            });
        }).catch((err) => {
            console.error("Error deleting social account:", err);
        });
    });

    test('Deleting Non-Existent Social Account from Database', (done) => {
        dbFunctions.SocialAccount.deleteSocialAccount(db, 'nonexistent_id').then(() => {
            done(new Error("Expected error for non-existent account"));
        }).catch((err) => {
            expect(err).toBeDefined();
            expect(err.message).toBe('No rows deleted');
            done();
        });
    });

    test('Getting Social Account from Database', (done) => {
        let account_id: any;
        dbFunctions.SocialAccount.addSocialAccount(db, 'testuser', 'testpassword').then((id) => {
            account_id = id;
            return dbFunctions.SocialAccount.getSocialAccount(db, account_id);
        }).then((row: SocialAccountInterface) => {
            expect(row).toBeDefined();
            expect(row.account_id).toBe(account_id);
            expect(row.username).toBe('testuser');
            expect(row.password).toBe('testpassword');
            done();
        }).catch((err) => {
            console.error("Error getting social account:", err);
        });
    });

    test('Getting Non-Existent Social Account from Database', (done) => {
        dbFunctions.SocialAccount.getSocialAccount(db, 'nonexistent_id').then(() => {
            done(new Error("Expected error for non-existent account"));
        }).catch((err) => {
            expect(err).toBeDefined();
            expect(err.message).toBe('No account found');
            done();
        });
    });

    test('Getting Social Account with Empty ID', (done) => {
        dbFunctions.SocialAccount.getSocialAccount(db, '').then(() => {
            done(new Error("Expected error for empty account ID"));
        }).catch((err) => {
            expect(err).toBeDefined();
            expect(err.message).toBe('accountId must be provided');
            done();
        });
    });

    test('Updating Social Account in Database', (done) => {
        let account_id: string;
        dbFunctions.SocialAccount.addSocialAccount(db, 'testuser', 'testpassword').then((id) => {
            account_id = id;
            return dbFunctions.SocialAccount.updateSocialAccount(db, account_id, 'newuser', 'newpassword');
        }).then(() => {
            return dbFunctions.SocialAccount.getSocialAccount(db, account_id);
        }).then((row: SocialAccountInterface) => {
            expect(row).toBeDefined();
            expect(row.account_id).toBe(account_id);
            expect(row.username).toBe('newuser');
            expect(row.password).toBe('newpassword');
            done();
        }).catch((err) => {
            console.error("Error updating social account:", err);
        });
    });
    test('Updating Social Account with Empty ID', (done) => {
        dbFunctions.SocialAccount.updateSocialAccount(db, '', 'newuser', 'newpassword').then(() => {
            done(new Error("Expected error for empty account ID"));
        }).catch((err) => {
            expect(err).toBeDefined();
            expect(err.message).toBe('accountId must be provided');
            done();
        });
    });

    test('Login Social Account with Valid Credentials', (done) => {
        dbFunctions.SocialAccount.addSocialAccount(db, 'testuser', 'testpassword').then((account_id) => {
            return dbFunctions.SocialAccount.loginSocialAccount(db, 'testuser', 'testpassword');
        }).then((row: SocialAccountInterface) => {
            expect(row).toBeDefined();
            expect(row.username).toBe('testuser');
            expect(row.password).toBe('testpassword');
            done();
        }).catch((err) => {
            console.error("Error logging in social account:", err);
        });
    });

    test('Login Social Account with Invalid Credentials', (done) => {
        dbFunctions.SocialAccount.addSocialAccount(db, 'testuser', 'testpassword').then(() => {
            return dbFunctions.SocialAccount.loginSocialAccount(db, 'testuser', 'wrongpassword');
        }).then(() => {
            done(new Error("Expected error for invalid credentials"));
        }).catch((err) => {
            expect(err).toBeDefined();
            expect(err.message).toBe('Invalid username or password');
            done();
        });
    });
});

