// Letter to send

function createInvLetterContent(id, author, message) {
    const elementId = `inv-letter-content-${id}`;
    if (document.getElementById(elementId) !== null) {
        return ;
    }

    const letterContainer = document.createElement('div');
    letterContainer.className = 'mailbox-inv-letter-content';
    letterContainer.id = elementId;
    letterContainer.style.width = '742px';
    letterContainer.style.height = '100%';
    letterContainer.style.color = 'white';
    letterContainer.style.border = '2px solid black';
    letterContainer.style.borderLeft = 'none';
    letterContainer.style.display = 'none';

    const letterAuthor = document.createElement("div");
    letterAuthor.className = 'mailbox-letter-from';
    letterAuthor.id = `author-${id}`;
    letterAuthor.textContent = `${author}`;

    const letterContent = document.createElement("p");
    letterContent.className = 'mailbox-letter-message';
    letterContent.id = `message-${id}`;

    letterContent.innerHTML = message.replaceAll('\n', "<br>");

    letterContainer.appendChild(letterContent);
    letterContainer.appendChild(letterAuthor);

    document.getElementById("mailbox-inv-content").appendChild(letterContainer);
}

function createInvLetterTitle(id, author, message, data) {
    const elementId = `inv-letter-title-${id}`;
    if (document.getElementById(elementId) !== null) {
        return ;
    }

    const lettersContainer = document.getElementById("mailbox-inv-letters");

    const newLetter = document.createElement("li");
    newLetter.className = 'mailbox-letter';
    newLetter.id = elementId;


    const letterTitle = document.createElement("a");
    letterTitle.text = `${message}`
    letterTitle.className = 'limit-title';
    letterTitle.id = `title-${id}`;

    letterTitle.dataset.id = id;
    letterTitle.dataset.author = author;
    letterTitle.href = '#';

    newLetter.onclick = (event) => {
        //document.getElementById(event.target.id).style.fontWeight = '';

        window.localStorage.setItem('selected_letter', JSON.stringify(data));

        const lettersElements = document.getElementsByClassName('mailbox-inv-letter-content');
        for (let i = lettersElements.length - 1; i >= 0; i--) {
            if (lettersElements.item(i).id !== `inv-letter-content-${id}`) {
                lettersElements.item(i).style.display = 'none';
            } else {
                lettersElements.item(i).style.display = '';
            }
        }
    }

    const letterTitleAuthor = document.createElement("a");
    letterTitleAuthor.text = `${author}`;
    letterTitleAuthor.className = 'letter-author';
    letterTitleAuthor.id = `author-${id}`;

    newLetter.appendChild(letterTitle);
    newLetter.appendChild(letterTitleAuthor);

    lettersContainer.appendChild(newLetter);
}

function createInventoryLetter(data) {
    const id = data.id;
    const author = data.metadata.author;
    const message = data.metadata.message;
    createInvLetterTitle(id, author, message, data);
    createInvLetterContent(id, author, message, data);
}

function deleteInvLetter(id) {
	const titleElement = document.getElementById(`inv-letter-title-${id}`);
	const contentElement = document.getElementById(`inv-letter-content-${id}`);

	titleElement.parentElement.removeChild(titleElement);
	contentElement.parentElement.removeChild(contentElement);

	const letters = JSON.parse(window.localStorage.getItem('mailbox_inventory'));
	const remainingLetters = letters.filter(letter => letter.id !== id);
    
	if (remainingLetters.length === 0) {
        createNoMessageDiv("mailbox-inv-content", 'no-letter');
	}
    
    window.localStorage.setItem('mailbox_inventory', JSON.stringify(remainingLetters));
}