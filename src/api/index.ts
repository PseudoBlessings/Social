import {PostScrapper, StoryScrapper, ConversationScrapper} from '../main/services/scrapper'
import {Post} from '../main/models/post'
import {Conversation} from '../main/models/conversation'
import {Story} from '../main/models/story'
import {User} from '../main/models/user'

export abstract class API{
    protected UserAgent: string;
    protected loginURL: string;
    protected mainURL: string;

    protected database: any;
    protected postScrapper?: PostScrapper;
    protected storyScrapper?: StoryScrapper;
    protected conversationScrapper?: ConversationScrapper;

    private refreshIntervalMs: number = 0;
    private refreshTimer?: NodeJS.Timeout;
    private refreshInProgress: boolean = false;

    constructor(opts: {
        userAgent?: string;
        loginURL: string;
        mainURL: string;
        database?: any;
        postScrapper?: any;
        storyScrapper?: any;
        conversationScrapper?: any;
        refreshIntervalMs?: number;
    }) {
        this.UserAgent = opts.userAgent ?? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
        this.loginURL = opts.loginURL;
        this.mainURL = opts.mainURL;
        this.database = opts.database;
        this.postScrapper = opts.postScrapper;
        this.storyScrapper = opts.storyScrapper;
        this.conversationScrapper = opts.conversationScrapper;

        if (opts.refreshIntervalMs && opts.refreshIntervalMs > 0) {
            this.refreshIntervalMs = opts.refreshIntervalMs;
            this.startAutoRefresh();
        }
    }

    getUserAgent(): string { return this.UserAgent; }
    getLoginURL(): string { return this.loginURL; }
    getMainURL(): string { return this.mainURL; }

    abstract setUserAgent(agent: string): Promise<void>;
    abstract setLoginURL(url: string): Promise<void>;
    abstract setMainURL(url: string): Promise<void>;

    abstract isLoggedIn(): Promise<boolean>;
    abstract login(credentials?: any): Promise<void>;
    abstract logout(): Promise<void>;

    abstract fetchPosts(limit?: number): Promise<Post[]>;
    abstract fetchStories(limit?: number): Promise<Story[]>;
    abstract fetchConversations(limit?: number): Promise<Conversation[]>;
    abstract fetchUsers(limit?: number): Promise<User[]>

    startAutoRefresh(intervalMs?: number) {
        if (intervalMs !== undefined) this.refreshIntervalMs = intervalMs;
        if (!this.refreshIntervalMs || this.refreshTimer) return;
        this.runRefreshSafely();
        this.refreshTimer = setInterval(() => this.runRefreshSafely(), this.refreshIntervalMs);
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = undefined;
        }
    }

    setRefreshInterval(intervalMs: number) {
        this.refreshIntervalMs = intervalMs;
        if (this.refreshTimer) {
            this.stopAutoRefresh();
            this.startAutoRefresh();
        }
    }

    isAutoRefreshRunning(): boolean {
        return !!this.refreshTimer;
    }

    private async runRefreshSafely() {
        if (this.refreshInProgress) return;
        this.refreshInProgress = true;
        try {
            await this.onRefresh();
        } catch (err) {
            // swallow or log; don't let one failure stop future refreshes
            console.error('Auto-refresh error:', err);
        } finally {
            this.refreshInProgress = false;
        }
    }

    protected async onRefresh(): Promise<void> {
        const promises: Promise<any>[] = [];
        try { promises.push(this.fetchPosts()); } catch(_) {}
        try { promises.push(this.fetchStories()); } catch(_) {}
        try { promises.push(this.fetchConversations()); } catch(_) {}
        await Promise.all(promises);
    }
}