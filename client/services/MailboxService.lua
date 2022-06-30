MailboxService = {}

local mailboxOpened = false
local messageCache = {}
local canRefreshMessage = true
local ready = false

MailboxService.OnResourceStart = function (resourceName)
    if(GetCurrentResourceName() ~= resourceName) then
      return
    end

    Locales[Config.locale]["TextNearMailboxLocation"] = _U("TextNearMailboxLocation", Config.keyToOpen, Config.keyToOpenBroadcast)

    for _, location in pairs(Config.locations) do
        Utils.SetBlipAtPos(location.x, location.y, location.z)
    end

    print(_U("UINoLetterToSend"))

    SendNUIMessage({ action="set_language", language=Locales[Config.locale] })

    ready = true
    print("VORP Mailbox Loaded by Client")
end

MailboxService.ReceiveMessage = function (payload)
    local author = payload.author

    Utils.DisplayTip(_U("TipOnMessageReceived", author), 5000)
    canRefreshMessage = true
end

MailboxService.ReceiveBroadcast = function (payload)
    local author = payload.author
    local message = payload.message

    print(_U("TipOnBroadcastReceived", message, author))
    Utils.DisplayTip(_U("TipOnBroadcastReceived", message, author), 20000)
end

MailboxService.SetMessages = function (payload)
    if canRefreshMessage then
        messageCache = payload

        SendNUIMessage({ action="set_messages", messages=payload})
    end
end

MailboxService.SetPapers = function (payload)
    SendNUIMessage({ action="set_papers", papers=payload})
end

MailboxService.SetUsers = function (payload)
    SendNUIMessage({ action="set_users", users=payload})
end

MailboxService.OnMessageSend = function (messageId)
    print("deleting message with id: " .. tostring(messageId))
    SendNUIMessage({ action="message_sent", messageId=messageId})
end

function IsNearbyMailbox()
    for _, mailbox in pairs(Config.locations) do
        if Utils.IsPlayerNearCoords(mailbox.x, mailbox.y, mailbox.z, 2) then
            return true
        end
    end
    return false
end

-- UI Events

function OpenUI(broadcastMode)
    SetNuiFocus(true, true)
    SendNUIMessage({ action=(broadcastMode and "open_broadcast" or "open")})
    mailboxOpened = true

    if not broadcastMode then
        if canRefreshMessage then
            TriggerServerEvent("mailbox:getUsers");
            TriggerServerEvent("mailbox:getMessages")
        end

        TriggerServerEvent("mailbox:getPapers");
    end
end



MailboxService.CloseNUI = function(payload)
    
    -- First close UI. In case of fail, the user will not be stuck focused on the UI
    SetNuiFocus(false, false)
    SendNUIMessage({ action="close"})

    mailboxOpened = false

    local messages = json.decode(payload.messages)
    local toDelete = {}
    local toMarkAsOpened = {}

    print(json.encode(messages))
    if messages == nil or #messages == 0 then
        return
    end


    for _, message in pairs(messageCache) do
        local msg = nil

        for _, m in pairs(messages) do
            if m.id == message.id then
                msg = m
                break
            end
        end

        if msg == nil then -- if message is not found, then message is deleted
            toDelete[#toDelete+1] = tonumber(message.id)
        elseif not message.opened and msg.opened then -- if cached message is not marked as opened but received message is, update
            toMarkAsOpened[#toMarkAsOpened+1] = tonumber(message.id)
        end
    end

    -- Send data to server
    TriggerServerEvent("mailbox:updateMessages", {toDelete=toDelete, toMarkAsOpened=toMarkAsOpened});

    -- Finally, Cache received messages from UI as most recent messages
    messageCache = messages
end

MailboxService.SendMessage = function(payload)
    local receiver = payload.receiver
    local letter = payload.selectedLetter

    print("sending message with id: " .. tostring(letter.id))

    TriggerServerEvent("mailbox:sendMessage", {receiver=receiver, letter=letter});
end

MailboxService.BroadcastMessage = function(payload)
    local message = payload.message

    TriggerServerEvent("mailbox:broadcastMessage", {message=message});
end

MailboxService.FetchMessage = function(payload)
    local message = payload.message
    local author = payload.author

    TriggerServerEvent('paper:receiveLetter', message, author)
end

MailboxService.OnSelectedCharacter = function (charId)
    TriggerServerEvent("mailbox:getUsers");
    --TriggerServerEvent("mailbox:getMessages");
end

-- Thread

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(1)

        if not ready then
            return
        end

        if not mailboxOpened and IsNearbyMailbox() then
            Utils.DrawText(_U("TextNearMailboxLocation"), 23, 0.5, 0.85, 0.50, 0.40, 255, 255, 255, 255)
 
            if not mailboxOpened and IsControlJustReleased(0, Keys[Config.keyToOpen]) then
                OpenUI(false)
                Citizen.Wait(300)
            elseif not mailboxOpened and IsControlJustReleased(0, Keys[Config.keyToOpenBroadcast]) then
                OpenUI(true)
                Citizen.Wait(300)
            end
        end
    end
end)