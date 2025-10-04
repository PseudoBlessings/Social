import * as cheerio from 'cheerio';
import * as xpath from 'xpath';
import * as xpath_doc from '@xmldom/xmldom';
import { BrowserWindow } from 'electron';

export interface Selector{
    parentSelector?: string;
    selector?: string;
}

export interface PostContentSelector extends Selector{}
export interface PostInfoSelector extends Selector{}
export interface CommentSelector extends Selector{}

export abstract class PostScrapper{
    postContentSelector:PostContentSelector;
    postInfoSelector:PostInfoSelector;
    commentSelector:CommentSelector;
    constructor(postContentSelector:PostContentSelector,postInfoSelector:PostInfoSelector,commentSelector:CommentSelector) {
        this.postContentSelector = postContentSelector;
        this.postInfoSelector = postInfoSelector;
        this.commentSelector = commentSelector;
    }

    abstract extractPostContent(DOM:string): Promise<any>;
    abstract extractPostInfo(DOM:string): Promise<any>;
    abstract extractComments(DOM:string): Promise<any>;
}

export interface StoryContentSelector extends Selector{}
export interface StoryInfoSelector extends Selector{}
export interface StoryNavigationSelector extends Selector{}
export interface StoryInputSelector extends Selector{}
export abstract class StoryScrapper {
    storyContentSelector:StoryContentSelector;
    storyInfoSelector:StoryInfoSelector;
    storyNavigationSelector:StoryNavigationSelector;
    storyInputSelector:StoryInputSelector;
    constructor(storyContentSelector:StoryContentSelector,storyInfoSelector:StoryInfoSelector,storyNavigationSelector:StoryNavigationSelector,storyInputSelector:StoryInputSelector) {
        this.storyContentSelector = storyContentSelector;
        this.storyInfoSelector = storyInfoSelector;
        this.storyNavigationSelector = storyNavigationSelector;
        this.storyInputSelector = storyInputSelector;
    }

    abstract extractStoryContent(DOM:string): Promise<any>;
    abstract extractStoryInfo(DOM:string): Promise<any>;
    abstract extractStoryNavigation(DOM:string): Promise<any>;
    abstract extractStoryInput(DOM:string): Promise<any>;
}

export interface ConversationTabSelector extends Selector{}
export interface ConversationSelector extends Selector{}
export interface MessageSelector extends Selector{}
export abstract class ConversationScrapper{
    conversationTabSelector : ConversationTabSelector;
    messageSelector : MessageSelector;
    conversationSelector : ConversationSelector;
    constructor(conversationTabSelector:ConversationTabSelector, messageSelector:MessageSelector, conversationSelector:ConversationSelector){
        this.conversationTabSelector=conversationTabSelector;
        this.messageSelector=messageSelector;
        this.conversationSelector=conversationSelector;
    }

    abstract extractConversationTab(DOM: string): Promise<any>;
    abstract extractConversation(DOM: string): Promise<any>;
    abstract extractMessage(DOM: string): Promise<any>;
}

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