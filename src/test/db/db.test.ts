import {initializeDatabase, createTables, addSocialAccount} from '../../main/db/index';
import fs from 'fs';
import {Database} from 'sqlite3';
import crypto from 'crypto';
const dbPath = __dirname + '/db_test.sqlite';
let db: Database;

beforeAll(async () => {
    if(fs.existsSync(dbPath))
        fs.unlinkSync(dbPath);
    db = await initializeDatabase(dbPath);
    await createTables(db);
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

test('Adding Social Account to Database', (done) => {
    addSocialAccount(db, 'testuser', 'testpassword').then((account_id) => {
        expect(account_id).toBeDefined();
        db.get(`SELECT * FROM "Social Accounts" WHERE account_id = ?`, [account_id], (err, row:any) => {
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
