import {initializeDatabase, createTables} from '../../main/db/index';
import fs from 'fs';
import {Database} from 'sqlite3';
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
