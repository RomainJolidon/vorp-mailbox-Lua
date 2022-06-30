function showEditButtons(value) {
    document.getElementById("mailbox-buttons-letter").style.display = value === false ? 'none' : '';
}

// Letter received

function createLetterContent(data) {
    const elementId = `content-${data.id}`;
    if (document.getElementById(elementId) !== null) {
        return ;
    }

    const letterContainer = document.createElement('div');
    letterContainer.className = 'mailbox-letter-content';
    letterContainer.id = elementId;
    letterContainer.style.width = '742px';
    letterContainer.style.height = '100%';
    letterContainer.style.color = 'white';
    letterContainer.style.border = '2px solid black';
    letterContainer.style.borderLeft = 'none';
    letterContainer.style.display = 'none';

    const letterAuthor = document.createElement("div");
    letterAuthor.className = 'mailbox-letter-from';
    letterAuthor.id = `author-${data.id}`;
    letterAuthor.textContent = data.author;

    const letterContent = document.createElement("p");
    letterContent.className = 'mailbox-letter-message';
    letterContent.id = `message-${data.id}`;

    const parsedMessage = data.message.replaceAll('\n', "<br>");
    letterContent.innerHTML = parsedMessage;

    letterContainer.appendChild(letterContent);
    letterContainer.appendChild(letterAuthor);

    document.getElementById("mailbox-content").appendChild(letterContainer);
}

function createLetterTitle(data) {
    const elementId = `letter-${data.id}`;
    if (document.getElementById(elementId) !== null) {
        return ;
    }

    const lettersContainer = document.getElementById("mailbox-letters");

    const newLetter = document.createElement("li");
    newLetter.className = 'mailbox-letter'
    newLetter.id = elementId;


    const prefix = JSON.parse(window.localStorage.getItem('mailbox_language'))['UINamePrefix'];
    const letterTitle = document.createElement("a");
    letterTitle.text = `${prefix} ${data.sender.firstname} ${data.sender.lastname}`
    letterTitle.id = `title-${data.id}`;

    if (data.opened === false) {
        console.log('not opened')
        letterTitle.style.fontWeight = 'bold';
    }

    letterTitle.dataset.id = data.id;
    letterTitle.dataset.firstname = data.sender.firstname;
    letterTitle.dataset.lastname = data.sender.lastname;
    letterTitle.href = '#';

    letterTitle.onclick = (event) => {
        document.getElementById(event.target.id).style.fontWeight = '';
        const id = event.target.dataset.id;

        const letters = JSON.parse(window.localStorage.getItem('mailbox_letters'));
        letters.forEach(letter => {
            if (letter.id === id) {
                letter.opened = true;
            }
        });
        window.localStorage.setItem('mailbox_letters', JSON.stringify(letters));

        showEditButtons(true);
        window.localStorage.setItem('selected_letter', JSON.stringify(data));

        const lettersElements = document.getElementsByClassName('mailbox-letter-content');
        for (let i = lettersElements.length - 1; i >= 0; i--) {
            if (lettersElements.item(i).id !== `content-${id}`) {
                lettersElements.item(i).style.display = 'none';
            } else {
                lettersElements.item(i).style.display = '';
            }
        }
    }

    const letterDate = document.createElement("a");
    const receivedAt = new Date(data.received_at);
    const hours = receivedAt.getUTCHours();
    const minutes = receivedAt.getUTCMinutes();
    letterDate.text = `${new Date(data.received_at).toDateString()} ${hours}H${minutes}`
    letterDate.className = 'letter-date';
    letterDate.id = `date-${data.id}`;

    newLetter.appendChild(letterTitle);
    newLetter.appendChild(letterDate);

    lettersContainer.appendChild(newLetter);
}

function createLetter(data) {
    createLetterTitle(data);
    createLetterContent(data);
}

function deleteSelectedLetter() {
	const selectedLetter = JSON.parse(window.localStorage.getItem('selected_letter'));
	const titleElement = document.getElementById(`letter-${selectedLetter.id}`);
	const contentElement = document.getElementById(`content-${selectedLetter.id}`);

	titleElement.parentElement.removeChild(titleElement);
	contentElement.parentElement.removeChild(contentElement);
	showEditButtons(false);

	const letters = JSON.parse(window.localStorage.getItem('mailbox_letters'));
	const remainingLetters = letters.filter(letter => letter.id !== selectedLetter.id);

	if (remainingLetters.length === 0) {
		createNoMessageDiv("mailbox-content");
	}

	window.localStorage.setItem('mailbox_letters', JSON.stringify(remainingLetters));
}