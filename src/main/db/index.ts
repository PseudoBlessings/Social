import {Database} from 'sqlite3';
export {SocialAccountInterface} from './socialaccount';
export {AccountInterface} from './account';
export {PlatformInterface} from './platform';
export {SessionInterface} from './session';
export * as SocialAccount from './socialaccount';
export * as Account from './account';
export * as Platform from './platform';
export * as Session from './session';

export function initializeDatabase(databasePath: string): Promise<Database> {
    return new Promise((resolve, reject) => {
        const db = new Database(databasePath, (err) =>{
            if (err) {
                reject(err);
            }
            else{
                resolve(db);
            }
        })
    })
}

export function createTables(db: Database): Promise<void> {
    return new Promise((resolve, reject) => {
        const createTablesSQL: Array<string> = [
            `CREATE TABLE Accounts (
                account_id        char(255) NOT NULL,
                social_account_id text NOT NULL,
                platform_id       text NOT NULL,
                session_id        text NOT NULL,
                display_name      char(255),
                PRIMARY KEY (account_id, platform_id),
                FOREIGN KEY(social_account_id) REFERENCES "Social Accounts"(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY(platform_id) REFERENCES Platforms(platform_id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY(session_id) REFERENCES Sessions(session_id) ON DELETE CASCADE ON UPDATE CASCADE
            );`,
            `CREATE TABLE Contacts (
                contact_id  text NOT NULL,
                first_name  text NOT NULL,
                last_name   text,
                nickname    text,
                label       text,
                address     text,
                is_favorite boolean,
                PRIMARY KEY (contact_id)
            );`,
            `CREATE TABLE Contacts_Users (
                contact_id text NOT NULL,
                user_id    text NOT NULL,
                PRIMARY KEY (contact_id, user_id),
                FOREIGN KEY(contact_id) REFERENCES Contacts(contact_id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY(user_id) REFERENCES Users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
            );`,
            `CREATE TABLE "Conversation Users" (
                user_id              text NOT NULL,
                conversation_id      text NOT NULL,
                joined_at            timestamp,
                left_at              timestamp,
                is_admin             boolean NOT NULL,
                last_read_message_id text,
                PRIMARY KEY (user_id, conversation_id),
                FOREIGN KEY(user_id) REFERENCES Users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY(conversation_id) REFERENCES Conversations(conversation_id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY(last_read_message_id) REFERENCES Messages(message_id) ON DELETE CASCADE ON UPDATE CASCADE
            );`,
            `CREATE TABLE Conversations (
                conversation_id     text NOT NULL,
                account_id          char(255) NOT NULL,
                conversation_name   char(255) NOT NULL,
                most_recent_message varchar(255),
                is_group_chat       boolean NOT NULL,
                most_recent_sender  varchar(255),
                platform_id         text NOT NULL,
                PRIMARY KEY (conversation_id),
                FOREIGN KEY(account_id, platform_id) REFERENCES Accounts(account_id, platform_id) ON DELETE CASCADE ON UPDATE CASCADE
            );`,
            `CREATE TABLE Messages (
                message_id      text NOT NULL,
                conversation_id text NOT NULL,
                sender          varchar(255) NOT NULL,
                timestamp       timestamp NOT NULL,
                has_sent        boolean,
                has_received    boolean,
                media_urls      varchar(255),
                text            text,
                PRIMARY KEY (message_id),
                FOREIGN KEY(conversation_id) REFERENCES Conversations(conversation_id) ON DELETE CASCADE ON UPDATE CASCADE
            );`,
            `CREATE TABLE Platforms (
                platform_id   text NOT NULL,
                session_id    text NOT NULL,
                platform_name char(255) NOT NULL UNIQUE,
                PRIMARY KEY (platform_id),
                FOREIGN KEY(session_id) REFERENCES Sessions(session_id) ON DELETE CASCADE ON UPDATE CASCADE
            );`,
            `CREATE TABLE Posts (
                post_id     text NOT NULL,
                account_id  char(255) NOT NULL,
                author      char(255) NOT NULL,
                description text,
                timestamp   timestamp NOT NULL,
                media_urls  varchar(255) NOT NULL,
                platform_id text NOT NULL,
                PRIMARY KEY (post_id),
                FOREIGN KEY(account_id, platform_id) REFERENCES Accounts(account_id, platform_id) ON DELETE CASCADE ON UPDATE CASCADE
            );`,
            `CREATE TABLE Sessions (
                session_id text NOT NULL,
                token      text,
                PRIMARY KEY (session_id)
            );`,
            `CREATE TABLE "Social Accounts" (
                account_id text NOT NULL,
                username   text NOT NULL UNIQUE,
                password   text,
                PRIMARY KEY (account_id)
            );`,
            `CREATE TABLE Stories (
                story_id    text NOT NULL,
                account_id  char(255) NOT NULL,
                author      char(255) NOT NULL,
                expire_by   timestamp NOT NULL,
                timestamp   timestamp NOT NULL,
                media_urls  varchar(255) NOT NULL,
                platform_id text NOT NULL,
                PRIMARY KEY (story_id),
                FOREIGN KEY(account_id, platform_id) REFERENCES Accounts(account_id, platform_id) ON DELETE CASCADE ON UPDATE CASCADE
            );`,
            `CREATE TABLE Users (
                user_id      text NOT NULL,
                account_id   char(255) NOT NULL,
                platform_id  text NOT NULL,
                display_name char(255),
                PRIMARY KEY (user_id),
                FOREIGN KEY(account_id, platform_id) REFERENCES Accounts(account_id, platform_id) ON DELETE CASCADE ON UPDATE CASCADE
            );`
        ];
        db.serialize(function() {
            db.run("PRAGMA foreign_keys = ON;", (err) => {
                if (err) return reject(err);
                let remaining = createTablesSQL.length;
                if (remaining === 0) return resolve();
                createTablesSQL.forEach(sql => {
                    db.run(sql, (err) => {
                        if (err) return reject(err);
                        remaining--;
                        if (remaining === 0) resolve();
                    });
                });
            });
        });
    });
}
