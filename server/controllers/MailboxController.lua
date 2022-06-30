RegisterServerEvent("onServerResourceStart")
AddEventHandler("onServerResourceStart", MailboxService.OnServerResourceStart)

RegisterServerEvent("mailbox:sendMessage")
AddEventHandler("mailbox:sendMessage",  MailboxService.SendMessage)

RegisterServerEvent("mailbox:broadcastMessage")
AddEventHandler("mailbox:broadcastMessage",  MailboxService.BroadcastMessage)

RegisterServerEvent("mailbox:getMessages")
AddEventHandler("mailbox:getMessages",  MailboxService.GetMessages)

RegisterServerEvent("mailbox:getPapers")
AddEventHandler("mailbox:getPapers",  MailboxService.GetPapers)

RegisterServerEvent("mailbox:getUsers")
AddEventHandler("mailbox:getUsers",  MailboxService.GetUsers)

RegisterServerEvent("mailbox:updateMessages")
AddEventHandler("mailbox:updateMessages", MailboxService.UpdateMessages)
