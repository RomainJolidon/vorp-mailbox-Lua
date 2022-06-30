# VORP Mailbox

A resource for RedM which allows players to send and receive Letters like mails.

# Installation 

**Dependencies**

- [VORP-Core](https://github.com/VORPCORE/VORP-Core)
- [VORP-Character](https://github.com/VORPCORE/VORP-Character)
- [VORP-inventory (metadata version)](https://github.com/RomainJolidon/vorp_inventory-lua/tree/feat/metadata)
- [vorp_paper](https://github.com/RomainJolidon/vorp_paper)

**Instructions**

- Extract vorp_mailbox into your resources folder
- Import mailbox.sql into your database 
- Add the following line to your server.cfg file:
```cfg
ensure vorp_mailbox
```

##  How To Use

Player can receive a blank paper in his inventory. He write something on it by click the use option.
a Used paper contains the written message and the author of the person who wrote it.

The player can then go to a mailbox and send his letter to another player.

If the player receive a letter, hge can fetch it from the mailbox in order to get it in its inventory.
The, He can show is paper to everyone else by giving it to other players.

## Configuration

You can add new locations of mailbox by amending the locations field in the Config.lua file.

You can also change language between french and english by updating the same Config.lua file


This resource has been created for Nolosha.
