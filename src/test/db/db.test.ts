import * as dbFunctions from '../../main/db/index';
import { SocialAccountInterface } from '../../main/db/index';
import { AccountInterface } from '../../main/db/index';
import { PlatformInterface } from '../../main/db/index';
import { SessionInterface } from '../../main/db/index';
import { UserInterface } from '../../main/db/index';
import { ContactInterface } from '../../main/db/index';
import { PostInterface } from '../../main/db/index';
import { StoryInterface } from '../../main/db/index';
import { ConversationInterface } from '../../main/db/index';
import fs from 'fs';
import {Database} from 'sqlite3';  
const dbPath = ':memory:';
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
    afterEach(async () => {
        // Ensure the "Social Accounts" table is empty after each test
        await new Promise<void>((resolve, reject) => { 
            db.run(`DELETE FROM "Social Accounts"`, [], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
    test('Adding Social Account to Database', (done) => {
        dbFunctions.SocialAccount.addSocialAccount(db, 'testuser', 'testpassword').then((socialaccountinterface) => {
            expect(socialaccountinterface.account_id).toBeDefined();
            db.get(`SELECT * FROM "Social Accounts" WHERE account_id = ?`, [socialaccountinterface.account_id], (err, row: SocialAccountInterface) => {
            expect(err).toBeNull();
            expect(row).toBeDefined();
            expect(row.account_id).toBe(socialaccountinterface.account_id);
            expect(row.username).toBe('testuser');
            expect(row.password).toBe('testpassword');
            done();
        });
        }).catch((err) => {
            console.error("Error adding social account:", err);
            done(err);
        });
    });

    test('Adding Social Account with Empty Password', (done) => {
        dbFunctions.SocialAccount.addSocialAccount(db, 'testuser').then((socialaccountinterface) => {
            expect(socialaccountinterface.account_id).toBeDefined();
            db.get(`SELECT * FROM "Social Accounts" WHERE account_id = ?`, [socialaccountinterface.account_id], (err, row: SocialAccountInterface) => {
                expect(err).toBeNull();
                expect(row).toBeDefined();
                expect(row.account_id).toBe(socialaccountinterface.account_id);
                expect(row.username).toBe('testuser');
                expect(row.password).toBeNull();
                done();
            });
        }).catch((err) => {
            console.error("Error adding social account:", err);
            done(err);
        });
    });

    test('Deleting Social Account from Database', (done) => {
        let account_id: any;
        dbFunctions.SocialAccount.addSocialAccount(db, 'testuser', 'testpassword').then((socialaccountinterface) => {
            account_id = socialaccountinterface.account_id;
            return dbFunctions.SocialAccount.deleteSocialAccount(db, account_id);
        }).then(() => {
            db.get(`SELECT * FROM "Social Accounts" WHERE account_id = ?`, [account_id], (err, row: SocialAccountInterface) => {
                expect(err).toBeNull();
                expect(row).toBeUndefined();
                done();
            });
        }).catch((err) => {
            console.error("Error deleting social account:", err);
            done(err);
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
        dbFunctions.SocialAccount.addSocialAccount(db, 'testuser', 'testpassword').then((socialaccountinterface) => {
            account_id = socialaccountinterface.account_id;
            return dbFunctions.SocialAccount.getSocialAccount(db, account_id);
        }).then((row: SocialAccountInterface) => {
            expect(row).toBeDefined();
            expect(row.account_id).toBe(account_id);
            expect(row.username).toBe('testuser');
            expect(row.password).toBe('testpassword');
            done();
        }).catch((err) => {
            console.error("Error getting social account:", err);
            done(err);
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
        dbFunctions.SocialAccount.addSocialAccount(db, 'testuser', 'testpassword').then((socialaccountinterface) => {
            account_id = socialaccountinterface.account_id;
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
            done(err);
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

describe('Database Accounts Table Functionality', () => {
    beforeAll(async () => {
        // make sure foreign key constraints are fulfilled for " Accounts" table
        await new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS "Social Accounts" (
                account_id text NOT NULL,
                username   text NOT NULL UNIQUE,
                password   text,
                PRIMARY KEY (account_id)
            );`, (err) => err ? reject(err) : resolve());
        });
        await new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS Sessions (
                session_id text NOT NULL,
                token      text,
                PRIMARY KEY (session_id)
            );`, (err) => err ? reject(err) : resolve());
        });
        await new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS Platforms (
                platform_id   text NOT NULL,
                session_id    text NOT NULL,
                platform_name char(255) NOT NULL UNIQUE,
                PRIMARY KEY (platform_id),
                FOREIGN KEY(session_id) REFERENCES Sessions(session_id)
            );`, (err) => err ? reject(err) : resolve());
        });
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Sessions (session_id, token) VALUES (?, ?)`,
                ['session_1', 'token_1'], (err) => err ? reject(err) : resolve());
        });
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Platforms (platform_id, session_id, platform_name) VALUES (?, ?, ?)`,
                ['platform_1', 'session_1', 'Platform One'], (err) => err ? reject(err) : resolve());
        });
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO "Social Accounts" (account_id, username, password) VALUES (?, ?, ?)`,
                ['social_account_1', 'user1', 'pass1'], (err) => err ? reject(err) : resolve());
        });
    });
    afterEach(() => {
        // Ensure the "Accounts" table is empty before each test
        db.run(`DELETE FROM Accounts`, [], (err) => {
            expect(err).toBeNull();
        });
    });

    afterAll(() => {
        // Clean up the "Social Accounts" table after all tests
        db.run(`DELETE FROM "Social Accounts"`, [], (err) => {
            expect(err).toBeNull();
        });
        db.run(`DELETE FROM Platforms`, [], (err) => {
            expect(err).toBeNull();
        });
        db.run(`DELETE FROM Sessions`, [], (err) => {
            expect(err).toBeNull();
        });
    });
    test('Adding Account to Database', (done) => {
        dbFunctions.Account.addAccount(db, 'account_1', 'social_account_1', 'platform_1', 'session_1', 'Test User').then((accountinterface) => {
            expect(accountinterface).toBeDefined();
            db.get(`SELECT * FROM Accounts WHERE account_id = ?`, [accountinterface.account_id], (err, row: AccountInterface) => {
                expect(err).toBeNull();
                expect(row).toBeDefined();
                expect(row.account_id).toBe(accountinterface.account_id);
                expect(row.social_account_id).toBe('social_account_1');
                expect(row.platform_id).toBe('platform_1');
                expect(row.session_id).toBe('session_1');
                expect(row.display_name).toBe('Test User');
                done();
            });
        }).catch((err) => {
            console.error("Error adding account:", err);
        });
    });

    test('Adding Account with Empty Display Name', (done) => {
        dbFunctions.Account.addAccount(db, 'account_1', 'social_account_1', 'platform_1', 'session_1').then((accountinterface) => {
            expect(accountinterface).toBeDefined();
            db.get(`SELECT * FROM Accounts WHERE account_id = ?`, [accountinterface.account_id], (err, row: AccountInterface) => {
                expect(err).toBeNull();
                expect(row).toBeDefined();
                expect(row.account_id).toBe(accountinterface.account_id);
                expect(row.social_account_id).toBe('social_account_1');
                expect(row.platform_id).toBe('platform_1');
                expect(row.session_id).toBe('session_1');
                expect(row.display_name).toBeNull();
                done();
            });
        }).catch((err) => {
            console.error("Error adding account with empty display name:", err);
        });
    });
    test('Deleting Account from Database', (done) => {
        dbFunctions.Account.addAccount(db, 'account_1', 'social_account_1', 'platform_1', 'session_1').then((accountinterface) => {
            return dbFunctions.Account.deleteAccount(db, accountinterface.account_id, accountinterface.platform_id);
        }).then(() => {
            db.get(`SELECT * FROM Accounts WHERE account_id = ? AND platform_id = ?`, ['account_1', 'platform_1'], (err, row: AccountInterface) => {
                expect(err).toBeNull();
                expect(row).toBeUndefined();
                done();
            });
        }).catch((err) => {
            console.error("Error deleting account:", err);
            done(err);
        });
    });
    test('Deleting Non-Existent Account from Database', (done) => {
        dbFunctions.Account.deleteAccount(db, 'nonexistent_account', 'platform_1').then((accountDeleted) => {
            expect(accountDeleted).toBe(false);
            done();
        }).catch((err) => {
            console.error("Error deleting non-existent account:", err);
            done(err);
        });
    });
    test('Getting Account from Database', (done) => {
        let account_id: string;
        dbFunctions.Account.addAccount(db, 'account_1', 'social_account_1', 'platform_1', 'session_1').then((accountinterface) => {
            account_id = accountinterface.account_id;
            return dbFunctions.Account.getAccount(db, account_id, 'platform_1');
        }).then((row: AccountInterface) => {
            expect(row).toBeDefined();
            expect(row.account_id).toBe(account_id);
            expect(row.social_account_id).toBe('social_account_1');
            expect(row.platform_id).toBe('platform_1');
            expect(row.session_id).toBe('session_1');
            done();
        }).catch((err) => {
            console.error("Error getting account:", err);
            done(err);
        });
    });
    test('Getting Non-Existent Account from Database', (done) => {
        dbFunctions.Account.getAccount(db, 'nonexistent_account', 'platform_1').then((row: AccountInterface | null) => {
            expect(row).toBeNull();
            done();
        }).catch((err) => {
            console.error("Error getting non-existent account:", err);
            done(err);
        });
    });
    test('Updating Account in Database', (done) => {
        let account_id: string;
        dbFunctions.Account.addAccount(db, 'account_1', 'social_account_1', 'platform_1', 'session_1').then((accountinterface) => {
            account_id = accountinterface.account_id;
            return dbFunctions.Account.updateAccount(db, account_id, 'platform_1', { display_name: 'Updated User' });
        }).then((updatedAccount: AccountInterface) => {
            expect(updatedAccount).toBeDefined();
            expect(updatedAccount.account_id).toBe(account_id);
            expect(updatedAccount.display_name).toBe('Updated User');
            done();
        }).catch((err) => {
            console.error("Error updating account:", err);
            done(err);
        });
    });
});

describe('Database Platforms Table Functionality', () => {
    beforeAll(async () => {
        // make sure foreign key constraints are fulfilled for "Platforms" table
        await new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS Sessions (
                session_id text NOT NULL,
                token      text,
                PRIMARY KEY (session_id)
            );`, (err) => err ? reject(err) : resolve());
        });
        await new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS Platforms (
                platform_id   text NOT NULL,
                session_id    text NOT NULL,
                platform_name          char(255) NOT NULL UNIQUE,
                PRIMARY KEY (platform_id),
                FOREIGN KEY(session_id) REFERENCES Sessions(session_id)
            );`, (err) => err ? reject(err) : resolve());
        });
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Sessions (session_id, token) VALUES (?, ?)`,
                ['session_1', 'token_1'], (err) => err ? reject(err) : resolve());
        });
    });
    
    afterEach(() => {
        // Ensure the "Platforms" table is empty before each test
        db.run(`DELETE FROM Platforms`, [], (err) => {
            expect(err).toBeNull();
        });
    });

    afterAll(async () => {
        // Clean up the foreign key tables after all tests
        await new Promise<void>((resolve, reject)=>{
            db.run(`DELETE FROM Sessions`, [], (err) => err ? reject(err) : resolve());
        })
    });

    test('Adding Platform to Database', (done) => {
        dbFunctions.Platform.addPlatform(db, 'platform_1', 'Platform One', 'session_1').then((platforminterface) => {
            expect(platforminterface).toBeDefined();
            db.get(`SELECT * FROM Platforms WHERE platform_id = ?`, [platforminterface.platform_id], (err, row: PlatformInterface) => {
                expect(err).toBeNull();
                expect(row).toBeDefined();
                expect(row.platform_id).toBe(platforminterface.platform_id);
                expect(row.platform_name).toBe('Platform One');
                expect(row.session_id).toBe('session_1');
                done();
            });
        }).catch((err) => {
            console.error("Error adding platform:", err);
            done(err);
        });
    });

    test('Deleting Platform from Database', (done) => {
        let platform_id: string;
        dbFunctions.Platform.addPlatform(db, 'platform_1', 'Platform One', 'session_1').then((platforminterface) => {
            platform_id = platforminterface.platform_id;
            return dbFunctions.Platform.deletePlatform(db, platform_id);
        }).then((deleted) => {
            expect(deleted).toBe(true);
            db.get(`SELECT * FROM Platforms WHERE platform_id = ?`, [platform_id], (err, row: PlatformInterface) => {
                expect(err).toBeNull();
                expect(row).toBeUndefined();
                done();
            });
        }).catch((err) => {
            console.error("Error deleting platform:", err);
            done(err);
        });
    });

    test('Deleting Non-Existent Platform from Database', (done) => {
        dbFunctions.Platform.deletePlatform(db, 'nonexistent_platform').then((deleted) => {
            expect(deleted).toBe(false);
            done();
        }).catch((err) => {
            console.error("Error deleting non-existent platform:", err);
            done(err);
        });
    });

    test('Getting Platform from Database', (done) => {
        let platform_id: string;
        dbFunctions.Platform.addPlatform(db, 'platform_1', 'Platform One', 'session_1').then((platforminterface) => {
            platform_id = platforminterface.platform_id;
            return dbFunctions.Platform.getPlatform(db, platform_id);
        }).then((row: PlatformInterface) => {
            expect(row).toBeDefined();
            expect(row.platform_id).toBe(platform_id);
            expect(row.platform_name).toBe('Platform One');
            expect(row.session_id).toBe('session_1');
            done();
        }).catch((err) => {
            console.error("Error getting platform:", err);
            done(err);
        });
    });
});

describe('Database Sessions Table Functionality', () => {
    afterEach(() => {
        // Ensure the "Sessions" table is empty before each test
        db.run(`DELETE FROM Sessions`, [], (err) => {
            expect(err).toBeNull();
        });
    });

    test('Adding Session to Database', (done) => {
        dbFunctions.Session.addSession(db, 'session_1', 'token_1').then((sessionId: SessionInterface) => {
            db.get(`SELECT * FROM Sessions WHERE session_id = ?`, ['session_1'], (err, row: SessionInterface) => {
                expect(err).toBeNull();
                expect(row).toBeDefined();
                expect(row.session_id).toBe(sessionId.session_id);
                expect(row.token).toBe(sessionId.token);
                done();
            });
        }).catch((err) => {
            console.error("Error adding session:", err);
            done(err);
        });
    });

    test('Adding Session with Empty Token', (done) => {
        dbFunctions.Session.addSession(db, 'session_2').then((sessionID: SessionInterface) => {
            db.get(`SELECT * FROM Sessions WHERE session_id = ?`, ['session_2'], (err, row: SessionInterface) => {
                expect(err).toBeNull();
                expect(row).toBeDefined();
                expect(row.session_id).toBe(sessionID.session_id);
                expect(row.token).toBeNull();
                done();
            });
        }).catch((err) => {
            console.error("Error adding session with empty token:", err);
            done(err);
        });
    });

    test('Deleting Session from Database', (done) => {
        dbFunctions.Session.addSession(db, 'session_1', 'token_1').then((sessionId: SessionInterface) => {
            return dbFunctions.Session.deleteSession(db, sessionId.session_id);
        }).then(() => {
            db.get(`SELECT * FROM Sessions WHERE session_id = ?`, ['session_1'], (err, row: SessionInterface) => {
                expect(err).toBeNull();
                expect(row).toBeUndefined();
                done();
            });
        }).catch((err) => {
            console.error("Error deleting session:", err);
            done(err);
        });
    });

    test('Getting Session from Database', (done) => {
        dbFunctions.Session.addSession(db, 'session_1', 'token_1').then((sessionId: SessionInterface) => {
            return dbFunctions.Session.getSession(db, sessionId.session_id);
        }).then((row: SessionInterface) => {
            expect(row).toBeDefined();
            expect(row.session_id).toBe('session_1');
            expect(row.token).toBe('token_1');
            done();
        }).catch((err) => {
            console.error("Error getting session:", err);
            done(err);
        });
    });

    test('Updating Session in Database', (done) => {
        dbFunctions.Session.addSession(db, 'session_1', 'token_1').then((sessionId: SessionInterface) => {
            return dbFunctions.Session.updateSession(db, sessionId.session_id, 'new_token');
        }).then((updatedSession: SessionInterface) => {
            expect(updatedSession).toBeDefined();
            expect(updatedSession.session_id).toBe('session_1');
            expect(updatedSession.token).toBe('new_token');
            done();
        }).catch((err) => {
            console.error("Error updating session:", err);
            done(err);
        });
    });
});

describe('Database Users Table Functionality', () => {
    beforeAll(async () => {
            // make sure foreign key constraints are fulfilled for "Users" table
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Sessions (session_id, token) VALUES (?, ?)`, ['session_1', 'token_1'], (err) => err ? reject(err) : resolve());
        });
        
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Platforms (platform_id, session_id, platform_name) VALUES (?, ?, ?)`, ['platform_1', 'session_1', 'Platform One'], (err) => err ? reject(err) : resolve());
        });
        
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO "Social Accounts" (account_id, username, password) VALUES (?, ?, ?)`, ['social_account_1', 'user1', 'pass1'], (err) => err ? reject(err) : resolve());
        });
        
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Accounts (account_id, social_account_id, platform_id, session_id, display_name) VALUES (?, ?, ?, ?, ?)`, ['account_1', 'social_account_1', 'platform_1', 'session_1', 'Test User'], (err) => err ? reject(err) : resolve());
        });
    });
    afterEach(() => {
        // Ensure the "Users" table is empty before each test
        db.run(`DELETE FROM Users`, [], (err) => {
            expect(err).toBeNull();
        });
    });
    afterAll(() => {
        // Clean up the database after all tests
        db.run(`DELETE FROM Users`, [], (err) => {
            expect(err).toBeNull();
        });
    });
    test('Adding User to Database', (done) => {
        dbFunctions.User.addUser(db, 'user_1', 'account_1', 'platform_1', 'Test User').then((user: UserInterface) => {
            expect(user).toBeDefined();
            db.get(`SELECT * FROM Users WHERE user_id = ?`, ['user_1'], (err, row: UserInterface) => {
                expect(err).toBeNull();
                expect(row).toBeDefined();
                expect(row.user_id).toBe(user.user_id);
                expect(row.account_id).toBe('account_1');
                expect(row.platform_id).toBe('platform_1');
                expect(row.display_name).toBe('Test User');
                done();
            });
        }).catch((err) => {
            console.error("Error adding user:", err);
            done(err);
        });
    });

    test('Deleting User from Database', (done) => {
        dbFunctions.User.addUser(db, 'user_1', 'account_1', 'platform_1', 'Test User').then((user: UserInterface) => {
            return dbFunctions.User.deleteUser(db, user.user_id);
        }).then(() => {
            db.get(`SELECT * FROM Users WHERE user_id = ?`, ['user_1'], (err, row: UserInterface) => {
                expect(err).toBeNull();
                expect(row).toBeUndefined();
                done();
            });
        }).catch((err) => {
            console.error("Error deleting user:", err);
            done(err);
        });
    });

    test('Getting User from Database', (done) =>{
        dbFunctions.User.addUser(db, 'user_1', 'account_1', 'platform_1', 'Test User').then((user:UserInterface) => {
            return dbFunctions.User.getUser(db, user.user_id);
        }).then((user:UserInterface) => {
            expect(user).toBeDefined;
            expect(user.user_id).toBe('user_1');
            expect(user.account_id).toBe('account_1');
            expect(user.platform_id).toBe('platform_1');
            expect(user.display_name).toBe('Test User');
            done();
        }).catch((err)=>{
            console.error("Error getting user: ", err);
            done(err);
        })
    });

    test('Updating User from Database', (done) =>{
        dbFunctions.User.addUser(db, 'user_1', 'account_1', 'platform_1', 'Test User').then((user:UserInterface) =>{
            return dbFunctions.User.updateUser(db, user.user_id,{display_name: 'New User'});
        }).then((user:UserInterface) =>{
            expect(user).toBeDefined;
            expect(user.user_id).toBe('user_1');
            expect(user.account_id).toBe('account_1');
            expect(user.platform_id).toBe('platform_1');
            expect(user.display_name).toBe('New User');
            done()
        }).catch((err) =>{
            console.error('Error updating user: ', err);
            done(err);
        })
    })
});

describe('Database Contacts Table Functionality', () =>{
    afterEach(() => {
        // Ensure the "Contacts" table is empty before each test
        db.run(`DELETE FROM Contacts`, [], (err) => {
            expect(err).toBeNull();
        });
    });
    afterAll(() => {
        // Clean up the database after all tests
        db.run(`DELETE FROM Contacts`, [], (err) => {
            expect(err).toBeNull();
        });
    });

    test('Adding Contact to Database',(done) =>{
        dbFunctions.Contact.addContact(db, {contact_id: '1245', first_name: 'Test User', is_favorite: true}).then((contact : ContactInterface) =>{
        expect(contact).toBeDefined();
        expect(contact.contact_id).toBe('1245');
        expect(contact.first_name).toBe('Test User');
        expect(contact.is_favorite).toBe(1);
        expect(contact.address).toBeNull();
        expect(contact.label).toBeNull();
        expect(contact.last_name).toBeNull();
        expect(contact.nickname).toBeNull();
        done();
        }).catch((err) => {
            console.error('Error adding contact: ', err);
            done(err);
        })
    })

    test('Delete Contact from Database', (done) =>{
        dbFunctions.Contact.addContact(db, {contact_id: '12345', first_name: 'Test User'}).then((contact:ContactInterface)=>{
            return dbFunctions.Contact.deleteContact(db, contact.contact_id);
        }).then(() =>{
            const sql = 'SELECT * FROM Contacts WHERE contact_id = ?'
            db.get(sql, ['12345'], (err, row:ContactInterface) =>{
                expect(err).toBeNull;
                expect(row).toBeNull;
                done()
            })
        }).catch((err) => {
            console.error("Error deleting contact:", err);
            done(err)
        })
    })

    test('Getting Contact from Database', (done) =>{
        dbFunctions.Contact.addContact(db, {contact_id: '12345', first_name: 'Test User'}).then((contact : ContactInterface) =>{
            return dbFunctions.Contact.getContact(db, contact.contact_id);
        }).then((contact:ContactInterface) =>{
            expect(contact).toBeDefined;
            expect(contact.contact_id).toBe('12345');
            expect(contact.first_name).toBe('Test User');
            expect(contact.last_name).toBeNull;
            expect(contact.address).toBeNull;
            expect(contact.is_favorite).toBeNull;
            expect(contact.nickname).toBeNull;
            expect(contact.label).toBeNull;
            done();
        }).catch((err) =>{
            console.error('Error getting contact: ', err);
            done(err);
        })
    })

    test('Updating Contact from Database', (done) =>{
        dbFunctions.Contact.addContact(db, {contact_id: '12345', first_name: 'Test User'}).then((contact:ContactInterface) =>{
            return dbFunctions.Contact.updateContact(db, contact.contact_id, {last_name: 'Test Name', is_favorite: false, address: '1234 Test St, Test, Test 12345'});
        }).then((contact:ContactInterface) => {
            expect(contact).toBeDefined;
            expect(contact.contact_id).toBe('12345');
            expect(contact.first_name).toBe('Test User');
            expect(contact.last_name).toBe('Test Name');
            expect(contact.address).toBe('1234 Test St, Test, Test 12345');
            expect(contact.is_favorite).toBe(0);
            done();
        }).catch((err) =>{
            console.error('Error updating contact:', err);
            done(err)
        })
    })
})

describe('Database Posts Table Functionality', () =>{
    beforeAll(async () =>{
        // include Foreign Key Tables and Rows

        // Social Accounts
        await new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS "Social Accounts" (
                account_id text NOT NULL, 
                username   text NOT NULL UNIQUE, 
                password   text, 
                PRIMARY KEY (account_id)
                );`, (err) => err ? reject(err) : resolve());
        });

        // Sessions
        await new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS Sessions (
                session_id text NOT NULL,
                token      text,
                PRIMARY KEY (session_id)
            );`, (err) => err ? reject(err) : resolve());
        });
        // Platforms
        await new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS Platforms (
                platform_id   text NOT NULL,
                session_id    text NOT NULL,
                platform_name          char(255) NOT NULL UNIQUE,
                PRIMARY KEY (platform_id),
                FOREIGN KEY(session_id) REFERENCES Sessions(session_id)
            );`, (err) => err ? reject(err) : resolve());
        });
        // Accounts
        await new Promise<void>((resolve, reject)=>{
            db.run(`CREATE TABLE IF NOT EXISTS Accounts (
                account_id        char(255) NOT NULL, 
                social_account_id text NOT NULL, 
                platform_id       text NOT NULL, 
                session_id        text NOT NULL, 
                display_name      char(255), 
                PRIMARY KEY (account_id, platform_id),
                FOREIGN KEY(social_account_id) REFERENCES "Social Accounts"(account_id), 
                FOREIGN KEY(platform_id) REFERENCES Platforms(platform_id), 
                FOREIGN KEY(session_id) REFERENCES Sessions(session_id));
            );`, (err) => err ? reject(err) : resolve());
        });
        // Adding Foreign Rows

        // Social Account Row
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO "Social Accounts" (account_id, username, password) VALUES (?, ?, ?)`,
                ['social_account_id_1', 'Test User', 'password'], (err) => err ? reject(err) : resolve());
        });
        
        // Session Row
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Sessions (session_id, token) VALUES (?, ?)`,
                ['session_1', 'token_1'], (err) => err ? reject(err) : resolve());
        });

        //Platform Row
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Platforms (platform_id, session_id, platform_name) VALUES (?, ?, ?)`,
                ['platform_1', 'session_1', 'Platform One'], (err) => err ? reject(err) : resolve());
        });

        //Account Row
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Accounts (account_id, social_account_id, platform_id, session_id, display_name) VALUES (?, ?, ?, ?, ?)`,
                ['account_id_1', 'social_account_id_1', 'platform_1', 'session_1', 'Test User'], (err) => err ? reject(err) : resolve());
        });
    })

    afterEach(() => {
        // Ensure the "Posts" table is empty before each test
        db.run(`DELETE FROM Posts`, [], (err) => {
            expect(err).toBeNull();
        });
    });

    afterAll(() => {
        // Clean up the database after all tests
        db.run(`DELETE FROM Posts`, [], (err) => {
            expect(err).toBeNull();
        });
        db.run(`DELETE FROM Accounts`, [], (err) => {
            expect(err).toBeNull();
        });
        db.run(`DELETE FROM Platforms`, [], (err) => {
            expect(err).toBeNull();
        });
        db.run(`DELETE FROM Sessions`, [], (err) => {
            expect(err).toBeNull();
        });
        db.run(`DELETE FROM "Social Accounts"`, [], (err) => {
            expect(err).toBeNull();
        });
    });

    test('Adding Post to Database', (done) =>{
        dbFunctions.Post.addPost(db, {post_id: "test_post", account_id: "account_id_1", platform_id: 'platform_1', author: 'Test Author', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque tempus nibh luctus neque sodales, id tristique ipsum bibendum. Sed tempor congue dapibus. Phasellus eleifend erat sed elit bibendum, eu euismod diam condimentum. Duis quis lectus gravida, elementum turpis sit amet, molestie massa. Nunc mattis rhoncus metus sed hendrerit. In euismod luctus nisi at porta. Sed tortor risus, ultricies at nulla id, eleifend pretium mauris.', timestamp: new Date ("Janurary 01, 1999 00:00:00").toISOString(), media_urls:"https://picsum.photos/200"}).then((post : PostInterface) => {
            expect(post).toBeDefined;
            expect(post.post_id).toBe('test_post');
            expect(post.platform_id).toBe('platform_1');
            expect(post.account_id).toBe('account_id_1');
            expect(post.author).toBe('Test Author');
            expect(post.description).toBeDefined;
            expect(post.media_urls).toBe('https://picsum.photos/200');
            expect(post.timestamp.toString()).toBe('1999-01-01T10:00:00.000Z');
            done();
        }).catch((err) => {
            console.error('Error adding post:', err);
            done(err);
        })
    });

    test('Removing Post from Database', (done) =>{
        dbFunctions.Post.addPost(db, {post_id: "test_post", account_id: "account_id_1", platform_id: 'platform_1', author: 'Test Author', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque tempus nibh luctus neque sodales, id tristique ipsum bibendum. Sed tempor congue dapibus. Phasellus eleifend erat sed elit bibendum, eu euismod diam condimentum. Duis quis lectus gravida, elementum turpis sit amet, molestie massa. Nunc mattis rhoncus metus sed hendrerit. In euismod luctus nisi at porta. Sed tortor risus, ultricies at nulla id, eleifend pretium mauris.', timestamp: new Date ("Janurary 01, 1999 00:00:00").toISOString(), media_urls:"https://picsum.photos/200"}).then((post: PostInterface) => {
            return dbFunctions.Post.removePost(db, post.post_id)
        }).then((postRemoved:Boolean) => {
            db.get(`SELECT * FROM Posts WHERE post_id = ?`, ['test_post'], (err, row: PostInterface) => {
                if(err){
                    done(err);
                }
                else{
                    expect(row).toBeUndefined();
                    expect(postRemoved).toBeTruthy();
                    done();
                }
            })
        }).catch((err) =>{
            console.error("Error removing post:", err);
            done(err);
        })
    });

    test('Updating Post from Database', (done) =>{
        dbFunctions.Post.addPost(db, {post_id: 'post_1', account_id: 'account_id_1', platform_id: 'platform_1', author: 'Test Author', timestamp: new Date ("Janurary 01, 1999 00:00:00").toISOString(), media_urls:"https://picsum.photos/200"}).then((post : PostInterface) =>{
            return dbFunctions.Post.updatePost(db, 'post_1', {description: 'hello how are you today?'});
        }).then((post: PostInterface) => {
            expect(post).toBeDefined();
            expect(post.post_id).toBe('post_1');
            expect(post.account_id).toBe('account_id_1');
            expect(post.platform_id).toBe('platform_1');
            expect(post.author).toBe('Test Author');
            expect(post.description).toBe('hello how are you today?');
            expect(post.media_urls).toBe('https://picsum.photos/200');
            expect(post.timestamp.toString()).toBe('1999-01-01T10:00:00.000Z');
            done();
        }).catch((err) => {
            console.error('Error updating post: ', err);
            done(err);
        })
    })

    test('Getting Post from Database', (done) => {
        dbFunctions.Post.addPost(db, {post_id: 'post_1', account_id: 'account_id_1', platform_id: 'platform_1', author: 'Test Author', timestamp: new Date ("Janurary 01, 1999 00:00:00").toISOString(), media_urls:"https://picsum.photos/200"}).then((post:PostInterface) => {
            return dbFunctions.Post.getPost(db, 'post_1');
        }).then((post:PostInterface) => {
            expect(post).toBeDefined();
            expect(post.post_id).toBe('post_1');
            expect(post.account_id).toBe('account_id_1');
            expect(post.platform_id).toBe('platform_1');
            expect(post.author).toBe('Test Author');
            expect(post.media_urls).toBe('https://picsum.photos/200');
            expect(post.timestamp.toString()).toBe('1999-01-01T10:00:00.000Z');
            done();
        }).catch((err) => {
            console.error('Error getting post: ', err);
            done(err);
        })
    })
});

describe('Database Stories Table Functionality', () =>{
    beforeAll(async () =>{
        // include Foreign Key Tables and Rows

        // Social Accounts
        await new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS "Social Accounts" (
                account_id text NOT NULL, 
                username   text NOT NULL UNIQUE, 
                password   text, 
                PRIMARY KEY (account_id)
                );`, (err) => err ? reject(err) : resolve());
        });

        // Sessions
        await new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS Sessions (
                session_id text NOT NULL,
                token      text,
                PRIMARY KEY (session_id)
            );`, (err) => err ? reject(err) : resolve());
        });
        // Platforms
        await new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS Platforms (
                platform_id   text NOT NULL,
                session_id    text NOT NULL,
                platform_name          char(255) NOT NULL UNIQUE,
                PRIMARY KEY (platform_id),
                FOREIGN KEY(session_id) REFERENCES Sessions(session_id)
            );`, (err) => err ? reject(err) : resolve());
        });
        // Accounts
        await new Promise<void>((resolve, reject)=>{
            db.run(`CREATE TABLE IF NOT EXISTS Accounts (
                account_id        char(255) NOT NULL, 
                social_account_id text NOT NULL, 
                platform_id       text NOT NULL, 
                session_id        text NOT NULL, 
                display_name      char(255), 
                PRIMARY KEY (account_id, platform_id),
                FOREIGN KEY(social_account_id) REFERENCES "Social Accounts"(account_id), 
                FOREIGN KEY(platform_id) REFERENCES Platforms(platform_id), 
                FOREIGN KEY(session_id) REFERENCES Sessions(session_id));
            );`, (err) => err ? reject(err) : resolve());
        });
        // Adding Foreign Rows

        // Social Account Row
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO "Social Accounts" (account_id, username, password) VALUES (?, ?, ?)`,
                ['social_account_id_1', 'Test User', 'password'], (err) => err ? reject(err) : resolve());
        });
        
        // Session Row
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Sessions (session_id, token) VALUES (?, ?)`,
                ['session_1', 'token_1'], (err) => err ? reject(err) : resolve());
        });

        //Platform Row
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Platforms (platform_id, session_id, platform_name) VALUES (?, ?, ?)`,
                ['platform_1', 'session_1', 'Platform One'], (err) => err ? reject(err) : resolve());
        });

        //Account Row
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Accounts (account_id, social_account_id, platform_id, session_id, display_name) VALUES (?, ?, ?, ?, ?)`,
                ['account_id_1', 'social_account_id_1', 'platform_1', 'session_1', 'Test User'], (err) => err ? reject(err) : resolve());
        });
    });

    afterEach(() => {
        // Ensure the "Stories" table is empty before each test
        db.run(`DELETE FROM Stories`, [], (err) => {
            expect(err).toBeNull();
        });
    });

    afterAll(() => {
        // Clean up the database after all tests
        db.run(`DELETE FROM Stories`, [], (err) => {
            expect(err).toBeNull();
        });
        db.run(`DELETE FROM Accounts`, [], (err) => {
            expect(err).toBeNull();
        });
        db.run(`DELETE FROM Platforms`, [], (err) => {
            expect(err).toBeNull();
        });
        db.run(`DELETE FROM Sessions`, [], (err) => {
            expect(err).toBeNull();
        });
        db.run(`DELETE FROM "Social Accounts"`, [], (err) => {
            expect(err).toBeNull();
        });
    });

    test('Adding Story to Database', (done) => {
        dbFunctions.Story.addStory(db, {story_id: 'story_1', account_id: 'account_id_1', platform_id: 'platform_1', author: 'Test Author', expire_by: new Date("January 02, 1999 00:00:00").toISOString(), timestamp: new Date ("Janurary 01, 1999 00:00:00").toISOString(), media_urls:"https://picsum.photos/200"}).then((story:StoryInterface) =>{
            expect(story).toBeDefined();
            expect(story.story_id).toBe('story_1');
            expect(story.account_id).toBe('account_id_1');
            expect(story.platform_id).toBe('platform_1');
            expect(story.author).toBe('Test Author');
            expect(story.media_urls).toBe('https://picsum.photos/200');
            expect(story.timestamp.toString()).toBe('1999-01-01T10:00:00.000Z');
            expect(story.expire_by.toString()).toBe('1999-01-02T10:00:00.000Z');
            done();
        }).catch((err) => {
            console.error('Error adding story:', err);
            done(err);
        });
    });

    test('Delete Story from Database', (done) =>{
        dbFunctions.Story.addStory(db, {story_id: 'story_1', account_id: 'account_id_1', platform_id: 'platform_1', author: 'Test Author', expire_by: new Date("January 02, 1999 00:00:00").toISOString(), timestamp: new Date ("Janurary 01, 1999 00:00:00").toISOString(), media_urls:"https://picsum.photos/200"}).then((story:StoryInterface) =>{
            return dbFunctions.Story.removeStory(db, 'story_1')
        }).then((deleted:boolean) => {
            const sql : string = `SELECT * FROM Stories WHERE story_id = ?`
            db.get(sql, ['story_1'], (err, row) =>{
                if(err){
                    done(err);
                }
                else{
                    expect(deleted).toBeTruthy();
                    expect(row).toBeUndefined();
                    done();
                }
            })
        }).catch((err) => {
            console.error('Error deleting story:', err);
            done(err);
        })
    })

    test('Updating Story from Database', (done) =>{
        dbFunctions.Story.addStory(db, {story_id: 'story_1', account_id: 'account_id_1', platform_id: 'platform_1', author: 'Test Author', expire_by: new Date("January 02, 1999 00:00:00").toISOString(), timestamp: new Date ("Janurary 01, 1999 00:00:00").toISOString(), media_urls:"https://picsum.photos/200"}).then((story:StoryInterface) =>{
            return dbFunctions.Story.updateStory(db, 'story_1', {author: 'New Author'});
        }).then((story:StoryInterface) => {
            expect(story).toBeDefined();
            expect(story.story_id).toBe('story_1');
            expect(story.account_id).toBe('account_id_1');
            expect(story.platform_id).toBe('platform_1');
            expect(story.author).toBe('New Author');
            expect(story.media_urls).toBe('https://picsum.photos/200');
            expect(story.timestamp.toString()).toBe('1999-01-01T10:00:00.000Z');
            expect(story.expire_by.toString()).toBe('1999-01-02T10:00:00.000Z');
            done();
        }).catch((err) => {
            console.error('Error updating story: ', err);
            done(err);
        })
    })

    test('Getting Story from Database', (done) => {
        dbFunctions.Story.addStory(db, {story_id: 'story_1', account_id: 'account_id_1', platform_id: 'platform_1', author: 'Test Author', expire_by: new Date("January 02, 1999 00:00:00").toISOString(), timestamp: new Date ("Janurary 01, 1999 00:00:00").toISOString(), media_urls:"https://picsum.photos/200"}).then((story:StoryInterface) =>{
            return dbFunctions.Story.getStory(db, 'story_1');
        }).then((story:StoryInterface) => {
            expect(story).toBeDefined();
            expect(story.story_id).toBe('story_1');
            expect(story.account_id).toBe('account_id_1');
            expect(story.platform_id).toBe('platform_1');
            expect(story.author).toBe('Test Author');
            expect(story.media_urls).toBe('https://picsum.photos/200');
            expect(story.timestamp.toString()).toBe('1999-01-01T10:00:00.000Z');
            expect(story.expire_by.toString()).toBe('1999-01-02T10:00:00.000Z');
            done();
        }).catch((err) => {
            console.error('Error getting story:', err);
            done(err);
        })
    })
});

describe('Database Conversations Table Functionality', () => {
    beforeAll(async ()=>{
        // include Foreign Key Tables and Rows

        // Social Accounts
        await new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS "Social Accounts" (
                account_id text NOT NULL, 
                username   text NOT NULL UNIQUE, 
                password   text, 
                PRIMARY KEY (account_id)
                );`, (err) => err ? reject(err) : resolve());
        });

        // Sessions
        await new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS Sessions (
                session_id text NOT NULL,
                token      text,
                PRIMARY KEY (session_id)
            );`, (err) => err ? reject(err) : resolve());
        });
        // Platforms
        await new Promise<void>((resolve, reject) => {
            db.run(`CREATE TABLE IF NOT EXISTS Platforms (
                platform_id   text NOT NULL,
                session_id    text NOT NULL,
                platform_name          char(255) NOT NULL UNIQUE,
                PRIMARY KEY (platform_id),
                FOREIGN KEY(session_id) REFERENCES Sessions(session_id)
            );`, (err) => err ? reject(err) : resolve());
        });
        // Accounts
        await new Promise<void>((resolve, reject)=>{
            db.run(`CREATE TABLE IF NOT EXISTS Accounts (
                account_id        char(255) NOT NULL, 
                social_account_id text NOT NULL, 
                platform_id       text NOT NULL, 
                session_id        text NOT NULL, 
                display_name      char(255), 
                PRIMARY KEY (account_id, platform_id),
                FOREIGN KEY(social_account_id) REFERENCES "Social Accounts"(account_id), 
                FOREIGN KEY(platform_id) REFERENCES Platforms(platform_id), 
                FOREIGN KEY(session_id) REFERENCES Sessions(session_id));
            );`, (err) => err ? reject(err) : resolve());
        });

        // Adding Foreign Rows

        // Social Account Row
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO "Social Accounts" (account_id, username, password) VALUES (?, ?, ?)`,
                ['social_account_id_1', 'Test User', 'password'], (err) => err ? reject(err) : resolve());
        });
        
        // Session Row
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Sessions (session_id, token) VALUES (?, ?)`,
                ['session_1', 'token_1'], (err) => err ? reject(err) : resolve());
        });

        //Platform Row
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Platforms (platform_id, session_id, platform_name) VALUES (?, ?, ?)`,
                ['platform_1', 'session_1', 'Platform One'], (err) => err ? reject(err) : resolve());
        });

        //Account Row
        await new Promise<void>((resolve, reject) => {
            db.run(`INSERT OR IGNORE INTO Accounts (account_id, social_account_id, platform_id, session_id, display_name) VALUES (?, ?, ?, ?, ?)`,
                ['account_id_1', 'social_account_id_1', 'platform_1', 'session_1', 'Test User'], (err) => err ? reject(err) : resolve());
        });
    })

    afterEach(() => {
        // Ensure the "Stories" table is empty before each test
        db.run(`DELETE FROM Conversations`, [], (err) => {
            expect(err).toBeNull();
        });
    });

    afterAll(() => {
        // Clean up the database after all tests
        db.run(`DELETE FROM Conversations`, [], (err) => {
            expect(err).toBeNull();
        });
        db.run(`DELETE FROM Accounts`, [], (err) => {
            expect(err).toBeNull();
        });
        db.run(`DELETE FROM Platforms`, [], (err) => {
            expect(err).toBeNull();
        });
        db.run(`DELETE FROM Sessions`, [], (err) => {
            expect(err).toBeNull();
        });
        db.run(`DELETE FROM "Social Accounts"`, [], (err) => {
            expect(err).toBeNull();
        });
    });

    test('Adding Conversation to Database', (done) => {
        dbFunctions.Conversation.addConversation(db, {conversation_id: 'conversation_1', account_id: 'account_id_1', platform_id: 'platform_1', conversation_name: 'Test Conversation', is_group_chat: false, }).then((conversation:ConversationInterface) =>{
            expect(conversation).toBeDefined();
            expect(conversation.conversation_id).toBe('conversation_1');
            expect(conversation.account_id).toBe('account_id_1');
            expect(conversation.platform_id).toBe('platform_1');
            expect(conversation.conversation_name).toBe('Test Conversation');
            expect(conversation.is_group_chat).toBeFalsy();
            expect(conversation.most_recent_message).toBeNull();
            expect(conversation.most_recent_sender).toBeNull();
            done();
        }).catch((err) => {
            console.error('Error adding conversation:', err);
            done(err);
        });
    });

    test('Removing Conversation to Database', (done) => {
        dbFunctions.Conversation.addConversation(db, {conversation_id: 'conversation_1', account_id: 'account_id_1', platform_id: 'platform_1', conversation_name: 'Test Conversation', is_group_chat: false, }).then((conversation:ConversationInterface) =>{
            return dbFunctions.Conversation.removeConversation(db, conversation.conversation_id);
        }).then((deleted:boolean) => {
            const sql : string = `SELECT * FROM Conversations WHERE conversation_id = ?`
            db.get(sql, ['conversation_1'], (err, row) =>{
                if(err){
                    done(err);
                }
                else{
                    expect(deleted).toBeTruthy();
                    expect(row).toBeUndefined();
                    done();
                }
            })
        }).catch((err) => {
            console.error('Error removing conversation:', err);
            done(err);
        })
    });
})
