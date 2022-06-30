MailboxService = {}
CORE = {}
VorpInv = exports.vorp_inventory:vorp_inventoryApi()
local charactersCache = {}
local lastCharacterMessageSent = {}
local lastCharacterBroadcastSent = {}
local lastCharacterRefresh = 0;


MailboxService.OnServerResourceStart = function (resource)
    if resource ~= GetCurrentResourceName() then
        return
    end

    TriggerEvent("getCore", function(dic)
        CORE = dic;
    end)

    Locales[Config.locale]["TipOnInsufficientMoneyForMessage"] = _U("TipOnInsufficientMoneyForMessage", tostring(Config.MessageSendPrice))
    Locales[Config.locale]["TipOnInsufficientMoneyForBroadcast"] = _U("TipOnInsufficientMoneyForBroadcast", tostring(Config.MessageBroadcastPrice))

    RefreshUsersCache()
end

MailboxService.SendMessage = function(data)
    if source == nil then
        print("[mailbox:sendMessage] source is null")
    end
    local _source = source
    local receiver = data.receiver
    local letterMetadata = data.letter.metadata
    local message = letterMetadata.message
    local author = letterMetadata.author
    local sourceCharacter = CORE.getUser(source).getUsedCharacter
    local sourceCharId =  sourceCharacter.charIdentifier

    local delay = tonumber(Config['DelayBetweenTwoMessage'])
    local lastMessageSentTime = lastCharacterMessageSent[sourceCharId]
    local gameTime = GetGameTimer()
    -- checking if user is allowed to send a message now
    if lastMessageSentTime ~= nil and lastMessageSentTime + 1000 * delay >= gameTime then
        local remainingTime = ((lastMessageSentTime + 1000 * delay) - gameTime) / 1000
        local errorMessage = _U("TipOnTooRecentMessageSent", tostring(remainingTime))

        TriggerClientEvent("vorp:Tip", _source, errorMessage, 5000)
        return
    end

    -- checking if user has enough money
    local price = Config['MessageSendPrice']

    if sourceCharacter.money < price then
        TriggerClientEvent("vorp:Tip", _source, _U("TipOnInsufficientMoneyForMessage"), 5000)
        return
    end

    exports.ghmattimysql:execute( "INSERT INTO character_mailbox SET sender_id = ?, receiver_id = ?, message = ?, author = ?;",
    {sourceCharId,
    receiver.charidentifier,
    message,
    author
    })

    TriggerEvent("vorp:removeMoney", _source, 0, price)
    lastCharacterMessageSent[sourceCharId] = gameTime
    TriggerClientEvent("vorp:Tip", _source, _U("TipOnMessageSent"), 5000)
    TriggerClientEvent("mailbox:onMessageSend", _source, data.letter.id)

    VorpInv.subItem(_source, 'p_paper01x', 1, letterMetadata)

    local connectedUsers = CORE.getUsers() -- return a Dictionary of <SteamID, User>
    for _, user in pairs(connectedUsers) do
        local receiverCharacter = user.GetUsedCharacter()
        if receiverCharacter.charIdentifier == receiver.charidentifier then
            -- if connected receiver use the right character, send a tip to him
            TriggerClientEvent("mailbox:receiveMessage", user.source, {author= sourceCharacter.firstname .. " " .. sourceCharacter.lastname })
            return
        end
    end
end


MailboxService.BroadcastMessage = function(data)
    if source == nil then
        print("[mailbox:broadcastMessage] source is null")
    end
    local _source = source
    local message = data.message
    local sourceCharacter = CORE.getUser(source).getUsedCharacter
    local charIdentifier = sourceCharacter.charIdentifier

    local delay = Config['DelayBetweenTwoBroadcast']
    local lastBroadcastSentTime = lastCharacterBroadcastSent[charIdentifier]
    local gameTime = GetGameTimer()
    -- checking if user is allowed to send a message now
    if lastBroadcastSentTime ~= nil and lastBroadcastSentTime + 1000 * delay >= gameTime then
        local remainingTime = ((lastBroadcastSentTime + 1000 * delay) - gameTime) / 1000
        local errorMessage = _U("TipOnTooRecentMessageSent", tostring(remainingTime))

        TriggerClientEvent("vorp:Tip", _source, errorMessage, 5000)
        return
    end

    -- checking if user has enough money
    local price = Config['MessageBroadcastPrice']

    if sourceCharacter.money < price then
        TriggerClientEvent("vorp:Tip", _source, _U("TipOnInsufficientMoneyForBroadcast"), 5000)
        return;
    end

    TriggerEvent("vorp:removeMoney", _source, 0, price)
    lastCharacterBroadcastSent[charIdentifier] = gameTime
    TriggerClientEvent("vorp:Tip", _source, _U("TipOnMessageSent"), 5000)

    local connectedUsers = CORE.getUsers() -- return a Dictionary of <SteamID, User>
    for _, user in pairs(connectedUsers) do
        TriggerClientEvent("mailbox:receiveBroadcast", user.source, {message=message, author= sourceCharacter.firstname .. " " .. sourceCharacter.lastname })
    end
end

--function IsPlayerConnected(handle)
--    for _, playerId in ipairs(GetPlayers()) do
--        if playerId == handle then
--            return true
--        end
--    end
--end

MailboxService.GetMessages = function()
    if source == nil then
        print("[mailbox:getMessages] source is null")
    end
    local _source = source
    local sourceCharacter = CORE.getUser(source).getUsedCharacter
    local charIdentifier = sourceCharacter.charIdentifier

    exports.ghmattimysql:execute( "SELECT * FROM character_mailbox WHERE receiver_id = ? ORDER BY received_at;",
    {charIdentifier}, function (result)
        --[[letters: Array<{
                         id,
                         sender_id,
                         receiver_id,
                         message,
                         author,
                         opened,
                         received_at
                         }
                         >--]]
        local messages = {}
        for _, msg in pairs(result) do
            local sender = FindCharacterbyId(msg.sender_id) or {}
            messages[#messages+1] = {id=tostring(msg.id), sender=sender, message=msg.message, author=msg.author, received_at=msg.received_at}
        end
        TriggerClientEvent("mailbox:setMessages", _source, messages)
    end)
end

MailboxService.GetPapers = function()
    local _source = source
    local paperName = 'p_paper01x'
    local inventory = VorpInv.getUserInventory(_source)
    local papers = {}

    Wait(300)

    for id, item in pairs(inventory) do
        if item.name == paperName and item.metadata["message"] ~= nil and item.metadata["author"] ~= nil then
            papers[#papers+1] = {
                id= id,
                metadata=item.metadata
            }
        end
    end

    TriggerClientEvent("mailbox:setPapers", _source, papers)
end

MailboxService.GetUsers = function()
    if source == nil then
        print("[mailbox:getUsers] source is null")
    end
    local _source = source
    local refreshRate = Config["TimeBetweenUsersRefresh"]

    if refreshRate > 0 and lastCharacterRefresh + (1000 * refreshRate) < GetGameTimer() then
        RefreshUsersCache()
    end
    TriggerClientEvent("mailbox:setUsers", _source, charactersCache)
end

MailboxService.UpdateMessages = function(data)
    if source == nil then
        print("[mailbox:updateMessages] source is null")
    end

    if data.toDelete ~= nil and #data.toDelete > 0 then
        local toDelete = ""
        for key, value in pairs(data.toDelete) do
            toDelete = toDelete .. tostring(value) .. (key < #data.toDelete and ',' or '')
        end
        Wait(100)
        exports.ghmattimysql:execute("DELETE FROM character_mailbox WHERE id IN (?);", {toDelete})
    end
    if data.toMarkAsread ~= nil and #data.toMarkAsread > 0 then
        local toMarkAsread = ""
        for key, value in pairs(data.toMarkAsread) do
            toMarkAsread = toMarkAsread .. tostring(value) .. (key < #data.toMarkAsread and ',' or '')
        end
        Wait(100)
        exports.ghmattimysql:execute( "UPDATE character_mailbox SET opened = true WHERE id IN (?);", {toMarkAsread})
    end
end

function RefreshUsersCache()
    exports.ghmattimysql:execute( "SELECT charidentifier, firstname, lastname FROM characters ORDER BY firstname, lastname;",
    {}, function (result)
        --[[users: Array<{
                     charidentifier,
                     firstname,
                     lastname
                     }
                     >--]]
        charactersCache = result
        lastCharacterRefresh = GetGameTimer()
    end)
end

function FindCharacterbyId(charIdentifier)
    for _, character in pairs(charactersCache) do
        if character.charidentifier == charIdentifier then
            return character
        end
    end
    return nil
end
