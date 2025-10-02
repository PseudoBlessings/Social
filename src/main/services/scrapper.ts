import * as cheerio from 'cheerio';
import { BrowserWindow } from 'electron';

export async function extractDOM(window:BrowserWindow):Promise<Node>{
    const contents = window.webContents;
    try{
        let DOM:Node = await contents.executeJavaScript('document.documentElement.outerHTML', true);
        console.log('DOM Extracted:', DOM);
        return DOM;
    }catch(error){
        console.error('Error Extracting Dom:', error);
        throw error;
    }
}