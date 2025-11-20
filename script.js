const participantForm = document.getElementById('participant-form');
const participantList = document.getElementById('participants');
const drawButton = document.getElementById('draw-button');
const exclusionGridContainer = document.getElementById('exclusion-grid-container');
const exclusionGrid = document.getElementById('exclusion-grid');
const drawHistoryContainer = document.getElementById('draw-history-container');
const drawHistoryList = document.getElementById('draw-history');
const deleteDrawsButton = document.getElementById('delete-draws');
const detailsDrawsButton = document.getElementById('details-draws');
const linksDrawsButton = document.getElementById('links-draws');

// Draw Confirmation Modal elements
const drawModal = document.getElementById('draw-modal');
const modalResultsList = document.getElementById('modal-results');
const drawModalCloseButton = drawModal.querySelector('.close-button');
const acceptDrawButton = document.getElementById('accept-draw');
const redrawButton = document.getElementById('redraw');

// Details/Links Modal elements
const detailsModal = document.getElementById('details-modal');
const detailsModalTitle = document.getElementById('details-modal-title');
const detailsModalContent = document.getElementById('details-modal-content');
const detailsModalCloseButton = detailsModal.querySelector('.close-button');

let participants = [];
let exclusions = [];
let drawHistory = [];
let currentDraw = [];

// Load data from localStorage on page load
loadData();

participantForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');

    const name = nameInput.value;
    const email = emailInput.value;

    if (name && email) {
        participants.push({ name, email });
        renderParticipants();
        renderExclusionGrid();
        saveData();
        nameInput.value = '';
        emailInput.value = '';
    }
});

function renderParticipants() {
    participantList.innerHTML = '';
    participants.forEach((participant, index) => {
        const li = document.createElement('li');
        li.textContent = `${participant.name} (${participant.email})`;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', () => {
            participants.splice(index, 1);
            renderParticipants();
            renderExclusionGrid();
            saveData();
        });

        li.appendChild(removeButton);
        participantList.appendChild(li);
    });
}

function renderExclusionGrid() {
    if (participants.length < 2) {
        exclusionGridContainer.style.display = 'none';
        return;
    }
    exclusionGridContainer.style.display = 'block';
    exclusionGrid.innerHTML = '';

    // Dynamically set grid columns
    exclusionGrid.style.gridTemplateColumns = `min-content repeat(${participants.length}, minmax(100px, 1fr))`;


    // Initialize exclusions matrix if it's not the right size
    if (exclusions.length !== participants.length || exclusions[0].length !== participants.length) {
        exclusions = Array(participants.length).fill(null).map(() => Array(participants.length).fill(false));
    }


    // Create header row
    const headerRow = document.createElement('div');
    headerRow.classList.add('grid-header', 'grid-cell');
    exclusionGrid.appendChild(headerRow);
    participants.forEach(p => {
        const cell = document.createElement('div');
        cell.classList.add('grid-header', 'grid-cell');
        cell.textContent = p.name;
        exclusionGrid.appendChild(cell);
    });

    // Create grid rows
    participants.forEach((giver, i) => {
        const rowHeader = document.createElement('div');
        rowHeader.classList.add('grid-header', 'grid-cell');
        rowHeader.textContent = giver.name;
        exclusionGrid.appendChild(rowHeader);

        participants.forEach((receiver, j) => {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            if (i === j) {
                cell.textContent = 'X';
            } else if (i > j) {
                // This is the lower triangle, leave it empty
            }
            else {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('grid-checkbox');
                checkbox.checked = exclusions[i][j];
                checkbox.addEventListener('change', () => {
                    exclusions[i][j] = checkbox.checked;
                    exclusions[j][i] = checkbox.checked; // Make exclusion bidirectional
                    saveData();
                });
                cell.appendChild(checkbox);
            }
            exclusionGrid.appendChild(cell);
        });
    });
}

drawButton.addEventListener('click', () => {
    if (participants.length < 2) {
        alert('You need at least 2 participants to draw names.');
        return;
    }

    currentDraw = drawNames();
    if (currentDraw) {
        renderModalResults(currentDraw);
        drawModal.style.display = 'block';
    } else {
        alert('Could not find a valid assignment. Please check your exclusions.');
    }
});

function drawNames() {
    let assignments = [];
    let givers = [...participants];
    let receivers = [...participants];
    let attempts = 0;

    while (givers.length > 0) {
        if (attempts > 1000) { // Prevent infinite loops
            return null;
        }
        let giver = givers[0];
        let potentialReceivers = receivers.filter(receiver => {
            if (giver.email === receiver.email) return false;
            const giverIndex = participants.findIndex(p => p.email === giver.email);
            const receiverIndex = participants.findIndex(p => p.email === receiver.email);
            if (exclusions[giverIndex][receiverIndex]) return false;
            return true;
        });

        if (potentialReceivers.length === 0) {
            // Backtrack
            givers = [...participants];
            receivers = [...participants];
            assignments = [];
            attempts++;
            continue;
        }

        let receiver = potentialReceivers[Math.floor(Math.random() * potentialReceivers.length)];
        assignments.push({ giver, receiver });
        givers.splice(0, 1);
        receivers.splice(receivers.indexOf(receiver), 1);
    }

    return assignments;
}

function renderModalResults(results) {
    modalResultsList.innerHTML = '';
    results.forEach(assignment => {
        const li = document.createElement('li');
        li.textContent = `${assignment.giver.name} is the Secret Santa for ${assignment.receiver.name}`;
        modalResultsList.appendChild(li);
    });
}

function renderDrawHistory() {
    drawHistoryList.innerHTML = '';
    if (drawHistory.length > 0) {
        drawHistoryContainer.style.display = 'block';
    } else {
        drawHistoryContainer.style.display = 'none';
    }

    drawHistory.forEach((draw, index) => {
        const li = document.createElement('li');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'draw-history-selection';
        radio.dataset.index = index;
        li.appendChild(radio);

        const date = new Date(draw.date).toLocaleString();
        const label = document.createElement('label');
        label.textContent = `Draw from ${date}`;
        li.appendChild(label);

        drawHistoryList.appendChild(li);
    });
}

function getSelectedDraw() {
    const selectedRadio = drawHistoryList.querySelector('input[type="radio"]:checked');
    if (selectedRadio) {
        return parseInt(selectedRadio.dataset.index);
    }
    return null;
}

deleteDrawsButton.addEventListener('click', () => {
    const selectedDraw = getSelectedDraw();
    if (selectedDraw !== null) {
        drawHistory.splice(selectedDraw, 1);
        saveData();
        renderDrawHistory();
    } else {
        alert('Please select a draw to delete.');
    }
});

detailsDrawsButton.addEventListener('click', () => {
    const selectedDraw = getSelectedDraw();
    if (selectedDraw === null) {
        alert('Please select a draw to see the details.');
        return;
    }

    const draw = drawHistory[selectedDraw];
    detailsModalTitle.textContent = `Details for Draw from ${new Date(draw.date).toLocaleString()}`;
    let table = '<table><tr><th>Santa</th><th>For</th></tr>';
    draw.assignments.forEach(assignment => {
        table += `<tr><td>${assignment.giver.name}</td><td>${assignment.receiver.name}</td></tr>`;
    });
    table += '</table>';
    detailsModalContent.innerHTML = table;
    detailsModal.style.display = 'block';
});

linksDrawsButton.addEventListener('click', () => {
    const selectedDraw = getSelectedDraw();
    if (selectedDraw === null) {
        alert('Please select a draw to see the links.');
        return;
    }

    const draw = drawHistory[selectedDraw];
    detailsModalTitle.textContent = `Links for Draw from ${new Date(draw.date).toLocaleString()}`;
    let table = '<table><tr><th>Participant</th><th>Link</th></tr>';
    draw.assignments.forEach(assignment => {
        const data = btoa(JSON.stringify(assignment));
        const url = `${window.location.origin}${window.location.pathname.replace('index.html', '')}participant.html?data=${data}`;
        table += `<tr><td>${assignment.giver.name}</td><td><button class="copy-link-button" data-url="${url}">Copy</button></td></tr>`;
    });
    table += '</table>';
    detailsModalContent.innerHTML = table;
    detailsModal.style.display = 'block';

    // Add event listeners to the copy buttons
    const copyButtons = detailsModalContent.querySelectorAll('.copy-link-button');
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const urlToCopy = button.dataset.url;
            navigator.clipboard.writeText(urlToCopy).then(() => {
                alert('Link copied to clipboard!');
            }, (err) => {
                alert('Failed to copy link.');
                console.error('Could not copy text: ', err);
            });
        });
    });
});


function saveData() {
    localStorage.setItem('secretSantaParticipants', JSON.stringify(participants));
    localStorage.setItem('secretSantaExclusions', JSON.stringify(exclusions));
    localStorage.setItem('secretSantaDrawHistory', JSON.stringify(drawHistory));
}

function loadData() {
    const storedParticipants = localStorage.getItem('secretSantaParticipants');
    const storedExclusions = localStorage.getItem('secretSantaExclusions');
    const storedDrawHistory = localStorage.getItem('secretSantaDrawHistory');

    if (storedParticipants) {
        participants = JSON.parse(storedParticipants);
        renderParticipants();
    }

    if (storedExclusions) {
        exclusions = JSON.parse(storedExclusions);
    }

    if (storedDrawHistory) {
        drawHistory = JSON.parse(storedDrawHistory);
        renderDrawHistory();
    }

    renderExclusionGrid();
}

// Modal event listeners
drawModalCloseButton.addEventListener('click', () => {
    drawModal.style.display = 'none';
});

detailsModalCloseButton.addEventListener('click', () => {
    detailsModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == drawModal) {
        drawModal.style.display = 'none';
    }
    if (event.target == detailsModal) {
        detailsModal.style.display = 'none';
    }
});

acceptDrawButton.addEventListener('click', () => {
    drawHistory.push({ date: new Date(), assignments: currentDraw });
    saveData();
    renderDrawHistory();
    drawModal.style.display = 'none';
});

redrawButton.addEventListener('click', () => {
    currentDraw = drawNames();
    if (currentDraw) {
        renderModalResults(currentDraw);
    } else {
        alert('Could not find a valid assignment. Please check your exclusions.');
    }
});
