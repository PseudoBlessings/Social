import {initializeDatabase, createTables} from '../../main/db/index';
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
    const sql:string = `INSERT INTO "Social Accounts" (account_id, username, password) VALUES (?, ?, ?)`;
    const account_id = crypto.randomUUID();
    const params = [account_id, 'testuser', 'testpassword'];
    db.run(sql, params, function(err) {
        expect(err).toBeNull();
        expect(this.changes).toBe(1);
    });
    db.get(`SELECT * FROM "Social Accounts" WHERE account_id = ?`, [account_id], (err, row:any) => {
        expect(err).toBeNull();
        expect(row).toBeDefined();
        expect(row.account_id).toBe(account_id);
        expect(row.username).toBe('testuser');
        expect(row.password).toBe('testpassword');
        done();
    });
});
