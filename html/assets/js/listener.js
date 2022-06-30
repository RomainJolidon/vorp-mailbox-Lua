function createNoMessageDiv(parentId, elementId) {
	if (document.getElementById(elementId) !== null) {
		return ;
	}

	const letterContainer = document.createElement('div');
	letterContainer.className = 'mailbox-letter-content';
	letterContainer.id = elementId;
	letterContainer.style.width = '700px';
	letterContainer.style.height = '100%';
	letterContainer.style.margin = '0 0 0 15px';
	letterContainer.style.color = 'black';
	letterContainer.style.display = 'flex';
	letterContainer.style.justifyContent = 'center';
	letterContainer.style.alignItems = 'center';

	let content = '';
	if (elementId === 'no-letter') {
		content = JSON.parse(window.localStorage.getItem('mailbox_language'))['UINoLetterToSend'];
	} else {
		content = JSON.parse(window.localStorage.getItem('mailbox_language'))['UINoMessageReceived'];
	}
	const noMessageText = document.createElement("p");
	noMessageText.textContent = content;
	noMessageText.style.fontSize = '30px';

	letterContainer.appendChild(noMessageText);

	document.getElementById(parentId).appendChild(letterContainer);
}

function deleteNoMessageDiv(elementId) {
	const element = document.getElementById(elementId);

	if (element !== null) {
		element.parentElement.removeChild(element);
	}
}

function createUserSelectOption(name, id) {
	if (document.getElementById(name) !== null) {
		return ;
	}
	const userSelect = document.getElementById("mailbox-user-select");

	const userOption = document.createElement('option');
	userOption.textContent = name;
	userOption.id = name;
	userOption.value = id;

	userSelect.appendChild(userOption);
}

function navigateToWriteSection() {
	window.localStorage.setItem('selected_letter', null);

	document.getElementById('mailbox-container-write').hidden = false;
	document.getElementById('mailbox-container-broadcast').hidden = true;
	document.getElementById('mailbox-container-read').hidden = true;
	const noMessageDiv = document.getElementById('no-letter');

	if (!!noMessageDiv) {
		noMessageDiv.style.display = 'flex';
	}
}

function navigateToReadSection() {
	window.localStorage.setItem('selected_letter', null);

	document.getElementById('mailbox-container-write').hidden = true;
	document.getElementById('mailbox-container-broadcast').hidden = true;
	document.getElementById('mailbox-container-read').hidden = false;
	const noMessageDiv = document.getElementById('no-message');

	if (!!noMessageDiv) {
		noMessageDiv.style.display = 'flex';
	}
}

function navigateToBroadcastSection() {
	window.localStorage.setItem('selected_letter', null);

	document.getElementById('mailbox-container-write').hidden = true;
	document.getElementById('mailbox-container-read').hidden = true;
	document.getElementById('mailbox-container-broadcast').hidden = false;
}

function closeAllLetters() {
	const lettersElements = document.getElementsByClassName('mailbox-letter-content');
	for (let i = lettersElements.length - 1; i >= 0; i--) {
		lettersElements.item(i).style.display = 'none';
	}

	const invLettersElements = document.getElementsByClassName('mailbox-inv-letter-content');
	for (let i = invLettersElements.length - 1; i >= 0; i--) {
		invLettersElements.item(i).style.display = 'none';
	}
}

function setLetterInventory(inventory) {
	if (inventory.length === 0) {
		createNoMessageDiv("mailbox-inv-content", 'no-letter');
		return ;
	} else {
		deleteNoMessageDiv('no-letter');
	}

	const paperTitleList = document.getElementById('mailbox-inv-letters');
	for (let i = 0; i < paperTitleList.childElementCount; i++) {
		const element = paperTitleList.children.item(i);
		paperTitleList.removeChild(element);
	}
	const paperContentList = document.getElementsByClassName('mailbox-inv-letter-content');
	for (let i = 0; i < paperContentList.length; i++) {
		const element = paperContentList[i];
		element.parentElement.removeChild(element);
	}

	// load letters into list
	window.localStorage.setItem('mailbox_inventory', JSON.stringify(inventory));
	inventory.forEach((letter) => {
		createInventoryLetter(letter);
	});
}

function setMessages(messages) {
	if (messages.length === 0) {
		createNoMessageDiv("mailbox-content", 'no-message');
		return ;
	} else {
		deleteNoMessageDiv('no-message');
	}

	// load letters into list
	window.localStorage.setItem('mailbox_letters', JSON.stringify(messages));
	messages.forEach((letter) => {
		createLetter(letter);
	});
}

function setUsers(users) {
	//load users into select
	createUserSelectOption('Choisis un destinataire', 0);
	window.localStorage.setItem('mailbox_users', JSON.stringify(users));
	users.forEach((user, index) => {
		createUserSelectOption(`${user.firstname} ${user.lastname}`, index + 1);
	});
}

function setLanguage(language) {
	window.localStorage.setItem('mailbox_language', JSON.stringify(language));
	console.log(language);

	document.getElementById('mailbox-read-button-close').textContent = language['UICloseButton'];
	document.getElementById('mailbox-button-write').textContent = language['UIPostButton'];
	document.getElementById('mailbox-button-delete').textContent = language['UIDeleteButton'];
	document.getElementById('mailbox-button-fetch').textContent = language['UIFetchButton'];

	document.getElementById('mailbox-write-button-close').textContent = language['UICloseButton'];
	document.getElementById('mailbox-button-cancel').textContent = language['UIAbortButton'];
	document.getElementById('mailbox-button-send').textContent = language['UISendButton'];

	document.getElementById('mailbox-broadcast-button-close').textContent = language['UICloseButton'];
	document.getElementById('mailbox-button-broadcast-cancel').textContent = language['UIAbortButton'];
	document.getElementById('mailbox-button-broadcast').textContent = language['UISendButton'];
}

function initInteractions() {
	// add UI buttons interaction
	$('#mailbox-button-cancel').unbind().click(() => {
		navigateToReadSection();
	});

	$('#mailbox-button-write').unbind().click(() => {
		document.getElementById("mailbox-user-select").selectedIndex = '0';
		navigateToWriteSection();
	});

	$('#mailbox-button-fetch').unbind().click(() => {
		deleteSelectedLetter();
		const messages = window.localStorage.getItem('mailbox_letters');
		const selectedLetter = JSON.parse(window.localStorage.getItem('selected_letter'));


		const author = selectedLetter.author;
		const message = selectedLetter.message;

		$.post('http://vorp_mailbox/fetch', JSON.stringify({author, message}));
		$.post('http://vorp_mailbox/close', JSON.stringify({messages}));
	});

	$('#mailbox-button-delete').unbind().click(() => {
		deleteSelectedLetter();
	});

	$('#mailbox-button-send').unbind().click(() => {
		const selectedLetter = JSON.parse(window.localStorage.getItem('selected_letter'));
		//const message = document.getElementById('mailbox-message-text').value;

		const e = document.getElementById('mailbox-user-select');
		const userId = e.options[e.selectedIndex].id;
		const receiver = JSON.parse(window.localStorage.getItem('mailbox_users')).find((user) => {
			const name = `${user.firstname} ${user.lastname}`;
			return (name === userId);
		});

		if (!!receiver && !!selectedLetter) {
			// send to Client
			$.post('http://vorp_mailbox/send', JSON.stringify({receiver, selectedLetter}));
			//document.getElementById('mailbox-message-text').value = '';
			//deleteSelectedInvLetter();
			navigateToReadSection();
		}
	});

	$('#mailbox-write-button-close').unbind().click(() => {
		const messages = window.localStorage.getItem('mailbox_letters');
		$.post('http://vorp_mailbox/close', JSON.stringify({messages}));
	});
	$('#mailbox-read-button-close').unbind().click(() => {
		const messages = window.localStorage.getItem('mailbox_letters');
		$.post('http://vorp_mailbox/close', JSON.stringify({messages}));
	});

	//Broadcast
	$('#mailbox-button-broadcast').unbind().click(() => {
		const message = document.getElementById('mailbox-broadcast-text').value;

		if (message.length > 0) {
			// send to Client
			$.post('http://vorp_mailbox/broadcast', JSON.stringify({message}));
			document.getElementById('mailbox-broadcast-text').value = '';
			$.post('http://vorp_mailbox/close', JSON.stringify({}));
		}
	});


	$('#mailbox-broadcast-button-close').unbind().click(() => {
		$.post('http://vorp_mailbox/close', JSON.stringify({}));
	});
	$('#mailbox-button-broadcast-cancel').unbind().click(() => {
		$.post('http://vorp_mailbox/close', JSON.stringify({}));
	});
}


//window.onload = () => {
	//init windows
	//navigateToReadSection();
	//navigateToWriteSection();
	//showEditButtons(false);
	/*setLanguage({
		UINamePrefix: 'de',
		UICloseButton: 'fermer',
		UIWriteButton: 'Ecrire',
		UIDeleteButton: 'Supprimer',
		UIAnswerButton: 'Recuperer',
		UIAbortButton: 'Annuler',
		UISendButton: 'Envoyer',
		UINoMessageReceived: 'Aucune lettre'
	})
	setMessages([
		{
			id: '1',
			steam: 'abc',
			firstname: 'john',
			lastname: 'doe',
			message: 'coucou',
			opened: true,
			received_at: new Date()
		}
	]);
	setUsers([
		{
			firstname: 'marie',
			lastname: 'bois'
		},
		{
			firstname: 'john',
			lastname: 'doe'
		}
	]);
	setLetterInventory([
		{
			id: '1',
			author: 'john doe',
			message: 'bonjour je voudrais manger du pain sil vous plait',
		}
	]);*/
	//initInteractions();
//}

$("document").ready(function () {
	navigateToReadSection();
	//navigateToWriteSection();
	showEditButtons(false);
	initInteractions();
    $("body").hide();

    $("body").on("keyup", function(key) {
        if (Config.closeKeys.includes(key.which)) {
			const messages = window.localStorage.getItem('mailbox_letters');
            $.post("http://vorp_mailbox/close", JSON.stringify({messages}));
        }
    });
})

window.addEventListener('message', (event) => {
	/**
	 * @type {{
	 *     action: string,
	 *     users: object[],
	 *     messages: object[],
	 *     papers: object[],
	 *     language: string,
	 *     messageId: string
	 * }}
	 * */
	const message = event.data;

	switch (message.action) {
		case 'open':
			navigateToReadSection();
			$("body").show();
			break;
		case 'open_broadcast':
			navigateToBroadcastSection();
			$("body").show();
			break;
		case 'close':
			$("body").hide();
			closeAllLetters();
			break;
		case 'set_messages':
			setMessages(message.messages);
			break;
		case 'set_papers':
			setLetterInventory(message.papers);
			break;
		case 'set_users':
			setUsers(message.users);
			break;
		case 'set_language':
			setLanguage(message.language)
			break;
		case 'message_sent':
			deleteInvLetter(message.messageId)
			break;
		default:
			return;
	}

	/*initInteractions();*/
});


