import { app, BrowserWindow, Session, session} from 'electron';
import * as Database from '../db/index';

/*
Name: loadSession
Parameter: session_name (string)
Description:
    This function will load in a session. Loading in a session is either creating a session if it doesn't exist,
    or loading in the session from its partision name (session_name).
 */
export function loadSession(session_name:string):Promise<Session>{
    return new Promise((resolve, reject) => {
        try{
            const ses = session.fromPartition(session_name);
            console.log(`Loading Session: ${session_name}`)
            resolve(ses);
        }catch(error){
            console.error(`Failed to load session ${session_name}:`, error)
            reject();
        }
    });
}

/*
Name: getName
Parameter: ses (Session)
Description:
    This fucntion will get the name of the session. The name of the session is discovered through the file path of the session.
 */
export function getName(ses:Session):Promise<String>{
    return new Promise((resolve, reject) => {
        try{
            const storage_path:String = ses.getStoragePath();
            const session_name:String = storage_path.match(/Partitions[/\\]([^/\\]+)$/)[1];
            if(session_name === undefined){
                console.error('Error Session Name doesnt exist');
                reject();
            }
            resolve(session_name);
        }catch(err){
            console.log("Error getting session name:", err);
            reject();
        }
    });
}