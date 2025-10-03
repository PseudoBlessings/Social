import * as cheerio from 'cheerio';
import * as xpath from 'xpath';
import * as xpath_doc from '@xmldom/xmldom';
import { BrowserWindow } from 'electron';

export async function extractDOM(window:BrowserWindow):Promise<string>{
    const contents = window.webContents;
    try{
        let DOM:string = await contents.executeJavaScript('document.documentElement.outerHTML', true);
        console.log('DOM Extracted:', DOM);
        return DOM;
    }catch(error){
        console.error('Error Extracting Dom:', error);
        throw error;
    }
}