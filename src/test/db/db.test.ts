import * as dbFunctions from '../../main/db/index';
import { SocialAccountInterface } from '../../main/db/index';
import { AccountInterface } from '../../main/db/index';
import { PlatformInterface } from '../../main/db/index';
import { SessionInterface } from '../../main/db/index';
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

    afterAll(() => {
        // Clean up the foreign key tables after all tests
        db.run(`DELETE FROM Sessions`, [], (err) => {
            expect(err).toBeNull();
        });
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
});
