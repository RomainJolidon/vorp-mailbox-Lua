AddEventHandler('onClientResourceStart', MailboxService.OnResourceStart)

RegisterNetEvent('mailbox:receiveMessage')
AddEventHandler('mailbox:receiveMessage', MailboxService.ReceiveMessage)

RegisterNetEvent('mailbox:receiveBroadcast')
AddEventHandler('mailbox:receiveBroadcast', MailboxService.ReceiveBroadcast)

RegisterNetEvent('mailbox:setMessages')
AddEventHandler('mailbox:setMessages', MailboxService.SetMessages)

RegisterNetEvent('mailbox:setPapers')
AddEventHandler('mailbox:setPapers', MailboxService.SetPapers)

RegisterNetEvent('mailbox:setUsers')
AddEventHandler('mailbox:setUsers', MailboxService.SetUsers)

RegisterNetEvent("vorp:SelectedCharacter")
AddEventHandler("vorp:SelectedCharacter", MailboxService.OnSelectedCharacter)

RegisterNetEvent('mailbox:onMessageSend')
AddEventHandler('mailbox:onMessageSend', MailboxService.OnMessageSend)


--NUI
RegisterNUICallback("close", MailboxService.CloseNUI)
RegisterNUICallback("send", MailboxService.SendMessage)
RegisterNUICallback("fetch", MailboxService.FetchMessage)
RegisterNUICallback("broadcast", MailboxService.BroadcastMessage)