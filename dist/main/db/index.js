"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = require("sqlite3");
const db = new sqlite3_1.Database("db.sqlite");
function initializeDatabase() {
    db.serialize(function () {
        db.run("CREATE TABLE Accounts (account_id char(255) NOT NULL, social_account_id char(255) NOT NULL, platform_id char(255) NOT NULL, session_id char(255) NOT NULL, display_name char(255), PRIMARY KEY (account_id), FOREIGN KEY(social_account_id) REFERENCES \"Social Accounts\"(account_id), FOREIGN KEY(platform_id) REFERENCES Platforms(platform_id), FOREIGN KEY(session_id) REFERENCES \"Session\"(session_id));");
        db.run("CREATE TABLE Contacts (contact_id char(255) NOT NULL, first_name char(255) NOT NULL, last_name char(255), nickname char(255), label char(255), address char(255), is_favorite boolean, PRIMARY KEY (contact_id));");
        db.run("CREATE TABLE Contacts_Users (contact_id char(255) NOT NULL, user_id char(255) NOT NULL, PRIMARY KEY (contact_id, user_id), FOREIGN KEY(contact_id) REFERENCES Contacts(contact_id), FOREIGN KEY(user_id) REFERENCES Users(user_id));");
        db.run("CREATE TABLE \"Conversation Users\" (user_id char(255) NOT NULL, conversation_id char(255) NOT NULL, joined_at timestamp, left_at timestamp, is_admin boolean NOT NULL, last_read_message_id char(255), PRIMARY KEY (user_id, conversation_id), FOREIGN KEY(user_id) REFERENCES Users(user_id), FOREIGN KEY(conversation_id) REFERENCES Conversations(conversation_id), FOREIGN KEY(last_read_message_id) REFERENCES Messages(message_id));");
        db.run("CREATE TABLE Conversations (conversation_id char(255) NOT NULL, account_id char(255) NOT NULL, conversation_name char(255) NOT NULL, most_recent_message varchar(255), is_group_chat boolean NOT NULL, most_recent_sender varchar(255), PRIMARY KEY (conversation_id), FOREIGN KEY(account_id) REFERENCES Accounts(account_id));");
        db.run("CREATE TABLE Messages (message_id char(255) NOT NULL, conversation_id char(255) NOT NULL, sender varchar(255) NOT NULL, timestamp timestamp NOT NULL, has_sent boolean, has_received boolean, media_urls varchar(255), text varchar(999), PRIMARY KEY (message_id), FOREIGN KEY(conversation_id) REFERENCES Conversations(conversation_id));");
        db.run("CREATE TABLE Platforms (platform_id char(255) NOT NULL, session_id char(255) NOT NULL, platform_name char(255) NOT NULL UNIQUE, PRIMARY KEY (platform_id), FOREIGN KEY(session_id) REFERENCES \"Session\"(session_id));");
        db.run("CREATE TABLE Posts (post_id char(255) NOT NULL, account_id char(255) NOT NULL, author char(255) NOT NULL, description char(255), timestamp timestamp NOT NULL, media_urls varchar(255) NOT NULL, PRIMARY KEY (post_id), FOREIGN KEY(account_id) REFERENCES Accounts(account_id));");
        db.run("CREATE TABLE \"Session\" (session_id char(255) NOT NULL, token char(255), PRIMARY KEY (session_id));");
        db.run("CREATE TABLE \"Social Accounts\" (account_id char(255) NOT NULL, username char(255) NOT NULL, password char(255), PRIMARY KEY (account_id));");
        db.run("CREATE TABLE Stories (story_id char(255) NOT NULL, account_id char(255) NOT NULL, author char(255) NOT NULL, expire_by timestamp NOT NULL, timestamp timestamp NOT NULL, media_urls varchar(255) NOT NULL, PRIMARY KEY (story_id), FOREIGN KEY(account_id) REFERENCES Accounts(account_id));");
        db.run("CREATE TABLE Users (user_id char(255) NOT NULL, account_id char(255) NOT NULL, platform_id char(255) NOT NULL, display_name char(255), PRIMARY KEY (user_id), FOREIGN KEY(account_id) REFERENCES Accounts(account_id), FOREIGN KEY(platform_id) REFERENCES Platforms(platform_id));");
    });
}
initializeDatabase();
//# sourceMappingURL=index.js.map