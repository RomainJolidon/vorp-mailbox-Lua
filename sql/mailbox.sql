CREATE TABLE character_mailbox (
   id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
   sender_id int NOT NULL references characters(charidentifier),
   receiver_id int NOT NULL references characters(charidentifier),
   message text NOT NULL,
   author varchar(50) NOT NULL ,
   opened tinyint(1) NOT NULL DEFAULT 0,
   received_at datetime NOT NULL DEFAULT now()
);

CREATE INDEX mailbox_character_idx ON character_mailbox(receiver_id);