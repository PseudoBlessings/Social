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