import * as SessionManager from '../../main/services/session_manager'

jest.mock('electron', () => ({
    session: {
        fromPartition: jest.fn(() => ({
            getStoragePath: () => 'C:/fake/path/Partitions/test_session'
        }))
    }
}));
test('Loading in session', (done) => {
    SessionManager.loadSession('test_session').then((ses) => {
        const storage_path:String = ses.getStoragePath();
        const session_name:String = storage_path.match(/Partitions[/\\]([^/\\]+)$/)[1];
        expect(session_name).toBe('test_session');
        done();
    }).catch((err) => {
        console.error('Error loading session:', err)
        done(err);
    })
})

