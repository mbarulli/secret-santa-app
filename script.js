const participantForm = document.getElementById('participant-form');
const participantList = document.getElementById('participants');
const drawButton = document.getElementById('draw-button');
const resultsPanel = document.getElementById('results-panel');
const resultsList = document.getElementById('results');
const exclusionGridContainer = document.getElementById('exclusion-grid-container');
const exclusionGrid = document.getElementById('exclusion-grid');

let participants = [];
let exclusions = [];

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

    exclusionGrid.style.gridTemplateColumns = `repeat(${participants.length + 1}, 1fr)`;
}

drawButton.addEventListener('click', () => {
    if (participants.length < 2) {
        alert('You need at least 2 participants to draw names.');
        return;
    }

    const results = drawNames();
    if (results) {
        renderResults(results);
        resultsPanel.style.display = 'block';
        drawButton.style.display = 'none';
        participantForm.style.display = 'none';
        participantList.style.display = 'none';
        exclusionGridContainer.style.display = 'none';
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

function renderResults(results) {
    resultsList.innerHTML = '';
    results.forEach(assignment => {
        const li = document.createElement('li');
        li.textContent = `${assignment.giver.name} is the Secret Santa for ${assignment.receiver.name}`;
        resultsList.appendChild(li);
    });
}

function saveData() {
    localStorage.setItem('secretSantaParticipants', JSON.stringify(participants));
    localStorage.setItem('secretSantaExclusions', JSON.stringify(exclusions));
}

function loadData() {
    const storedParticipants = localStorage.getItem('secretSantaParticipants');
    const storedExclusions = localStorage.getItem('secretSantaExclusions');

    if (storedParticipants) {
        participants = JSON.parse(storedParticipants);
        renderParticipants();
    }

    if (storedExclusions) {
        exclusions = JSON.parse(storedExclusions);
    }

    renderExclusionGrid();
}