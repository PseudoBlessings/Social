import * as cheerio from 'cheerio';
import * as xpath from 'xpath';
import * as xpath_doc from '@xmldom/xmldom';
import { BrowserWindow } from 'electron';

type SelectorType = "CSS" | "Xpath";

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

export async function extractParent(DOM: string, selector: string): Promise<cheerio.Cheerio<string>> {
    try {
        const $DOM: cheerio.CheerioAPI = cheerio.load(DOM);
        const $parent_element: cheerio.Cheerio<string> = $DOM(selector);
        return $parent_element;
    } catch (error) {
        console.error('Error extracting parent:', error);
        throw error;
    }
}