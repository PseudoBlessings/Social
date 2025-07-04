import {initializeDatabase} from '../../main/db/index';
import fs from 'fs';

test('Database Initialization Test', async () => {
    const db = await initializeDatabase(__dirname + '/db_test.sqlite');
    expect(db).toBeDefined();
    db.close();
    fs.unlinkSync(__dirname + '/db_test.sqlite');
});
