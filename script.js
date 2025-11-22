const participantForm = document.getElementById('participant-form');
const participantList = document.getElementById('participants');
const drawButton = document.getElementById('draw-button');
const exclusionGridContainer = document.getElementById('exclusion-grid-container');
const exclusionGrid = document.getElementById('exclusion-grid');
const drawHistoryContainer = document.getElementById('draw-history-container');
const participantTextarea = document.getElementById('participant-textarea'); // New element

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

const versionTimestampElement = document.getElementById('version-timestamp');

let participants = [];
let exclusions = [];
let drawHistory = [];
let currentDraw = [];

// Load data from localStorage on page load
loadData();

// Display version timestamp
versionTimestampElement.textContent = `Version: ${new Date().toLocaleString()}`;


function generateUniqueId(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return  Math.abs(hash).toString(36).substr(0, 5);
}

participantForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const textareaContent = participantTextarea.value;
    const lines = textareaContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const newParticipantsMap = new Map(); // Map name to {id, name}
    const oldParticipantsMap = new Map(participants.map(p => [p.name, p])); // Map old participants by name for ID lookup

    const tempExclusions = []; // To store parsed exclusions as {giverName, receiverName}

    lines.forEach(line => {
        const parts = line.split(' ');
        const giverName = parts[0];

        if (giverName) {
            let giverId;
            if (oldParticipantsMap.has(giverName)) {
                giverId = oldParticipantsMap.get(giverName).id;
            } else {
                giverId = generateUniqueId(giverName);
            }
            if (!newParticipantsMap.has(giverName)) {
                newParticipantsMap.set(giverName, { id: giverId, name: giverName });
            }

            // Parse exclusions from the rest of the line
            for (let i = 1; i < parts.length; i++) {
                const part = parts[i];
                if (part.startsWith('!')) {
                    const excludedReceiverName = part.substring(1);
                    if (excludedReceiverName) {
                        tempExclusions.push({ giverName: giverName, receiverName: excludedReceiverName });
                    }
                }
            }
        }
    });

    // Update participants array
    participants = Array.from(newParticipantsMap.values());

    // Now, update the global exclusions array based on parsed exclusions and current participants
    exclusions = []; // Clear old exclusions
    const currentParticipantsMap = new Map(participants.map(p => [p.name, p.id])); // Map current names to IDs

    tempExclusions.forEach(excl => {
        const giverId = currentParticipantsMap.get(excl.giverName);
        const receiverId = currentParticipantsMap.get(excl.receiverName);

        // Only add exclusion if both giver and receiver are valid participants
        if (giverId && receiverId) {
            exclusions.push({ giverId: giverId, receiverId: receiverId });
        }
    });

    // Update the UI and save data
    renderParticipants();
    renderExclusionGrid();
    saveData();
});

function renderParticipants() {
    participantList.innerHTML = '';
    participants.forEach(participant => { // Removed index as it's not needed for remove button
        const li = document.createElement('li');
        li.textContent = `${participant.name}`;
        // No remove button needed as participants are managed via textarea
        participantList.appendChild(li);
    });
    // Populate the textarea with current participants
    participantTextarea.value = participants.map(p => p.name).join('\n');
}

function renderExclusionGrid() {
    if (participants.length < 2) {
        exclusionGridContainer.style.display = 'none';
        return;
    }
    exclusionGridContainer.style.display = 'block';
    exclusionGrid.innerHTML = '';

    // Build a temporary 2D exclusion matrix from the list of exclusions for rendering
    const exclusionMatrix = Array(participants.length).fill(null).map(() => Array(participants.length).fill(false));
    const participantIdToIndex = new Map(participants.map((p, index) => [p.id, index]));

    exclusions.forEach(excl => {
        const giverIndex = participantIdToIndex.get(excl.giverId);
        const receiverIndex = participantIdToIndex.get(excl.receiverId);
        if (giverIndex !== undefined && receiverIndex !== undefined) {
            exclusionMatrix[giverIndex][receiverIndex] = true;
        }
    });

    // Dynamically set grid columns
    exclusionGrid.style.gridTemplateColumns = `min-content repeat(${participants.length}, minmax(100px, 1fr))`;

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
            } else {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('grid-checkbox');
                checkbox.checked = exclusionMatrix[i][j]; // Use the temporary matrix for initial check
                checkbox.addEventListener('change', () => {
                    const giverId = participants[i].id;
                    const receiverId = participants[j].id;

                    if (checkbox.checked) {
                        // Add exclusion (bidirectional)
                        exclusions.push({ giverId: giverId, receiverId: receiverId });
                        exclusions.push({ giverId: receiverId, receiverId: giverId });
                    } else {
                        // Remove exclusion (bidirectional)
                        exclusions = exclusions.filter(excl =>
                            !(excl.giverId === giverId && excl.receiverId === receiverId) &&
                            !(excl.giverId === receiverId && excl.receiverId === giverId)
                        );
                    }
                    saveData();
                    // Re-render the grid to reflect bidirectional changes immediately
                    renderExclusionGrid();
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
    const availableGivers = [...participants]; // Copy of participants to act as givers
    const availableReceivers = [...participants]; // Copy of participants to act as receivers
    let attempts = 0;

    // Helper to check if an exclusion exists
    const isExcluded = (giverId, receiverId) => {
        return exclusions.some(excl => excl.giverId === giverId && excl.receiverId === receiverId);
    };

    while (availableGivers.length > 0) {
        if (attempts > 1000) { // Prevent infinite loops
            return null;
        }

        const giver = availableGivers[0];
        const potentialReceivers = availableReceivers.filter(receiver => {
            // A giver cannot be their own receiver
            if (giver.id === receiver.id) return false;
            // Check against configured exclusions
            if (isExcluded(giver.id, receiver.id)) return false;
            return true;
        });

        if (potentialReceivers.length === 0) {
            // Backtrack: Reset and try again
            availableGivers.splice(0, availableGivers.length, ...participants);
            availableReceivers.splice(0, availableReceivers.length, ...participants);
            assignments = [];
            attempts++;
            continue;
        }

        const receiver = potentialReceivers[Math.floor(Math.random() * potentialReceivers.length)];
        assignments.push({ giver: giver, receiver: receiver });

        // Remove assigned giver and receiver for the next round
        availableGivers.splice(availableGivers.indexOf(giver), 1);
        availableReceivers.splice(availableReceivers.indexOf(receiver), 1);
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
    const drawHistoryTableBody = document.getElementById('draw-history');
    drawHistoryTableBody.innerHTML = ''; // Clear existing content

    if (drawHistory.length > 0) {
        drawHistoryContainer.style.display = 'block';
        drawHistory.forEach((draw) => {
            const tr = document.createElement('tr');

            // Draw Name Cell
            const drawNameTd = document.createElement('td');
            const date = new Date(draw.date);
            drawNameTd.textContent = `Draw from ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            tr.appendChild(drawNameTd);

            // Actions Cell
            const actionsTd = document.createElement('td');
            actionsTd.classList.add('actions-cell'); // Add a class for styling

            // Delete Icon
            const deleteIcon = document.createElement('span');
            deleteIcon.innerHTML = '&#x1F5D1;'; // Bin icon
            deleteIcon.title = 'Delete Draw';
            deleteIcon.classList.add('action-icon');
            deleteIcon.addEventListener('click', () => handleDeleteDraw(draw.id));
            actionsTd.appendChild(deleteIcon);

            // Details Icon
            const detailsIcon = document.createElement('span');
            detailsIcon.innerHTML = '&#x1F441;'; // Eye icon
            detailsIcon.title = 'View Details';
            detailsIcon.classList.add('action-icon');
            detailsIcon.addEventListener('click', () => handleDetailsDraw(draw.id));
            actionsTd.appendChild(detailsIcon);

            // Links Icon
            const linksIcon = document.createElement('span');
            linksIcon.innerHTML = '&#x1F517;'; // Chain link icon
            linksIcon.title = 'Get Links';
            linksIcon.classList.add('action-icon');
            linksIcon.addEventListener('click', () => handleLinksDraw(draw.id));
            actionsTd.appendChild(linksIcon);

            tr.appendChild(actionsTd);
            drawHistoryTableBody.appendChild(tr);
        });
    } else {
        drawHistoryContainer.style.display = 'none';
    }
}


function handleDeleteDraw(drawId) {
    const drawIndex = drawHistory.findIndex(draw => draw.id === drawId);
    if (drawIndex > -1) {
        const draw = drawHistory[drawIndex];
        // Remove assignments from localStorage
        draw.assignments.forEach(assignment => {
            localStorage.removeItem(`assignment_${draw.id}_${assignment.giver.id}`);
        });
        drawHistory.splice(drawIndex, 1);
        saveData();
        renderDrawHistory();
    }
}

function handleDetailsDraw(drawId) {
    const draw = drawHistory.find(d => d.id === drawId);
    if (draw) {
        detailsModalTitle.textContent = `Details for Draw from ${new Date(draw.date).toLocaleString()}`;
        let table = '<table><tr><th>Santa</th><th>For</th></tr>';
        draw.assignments.forEach(assignment => {
            table += `<tr><td>${assignment.giver.name}</td><td>${assignment.receiver.name}</td></tr>`;
        });
        table += '</table>';
        detailsModalContent.innerHTML = table;
        detailsModal.style.display = 'block';
    }
}

function handleLinksDraw(drawId) {
    const draw = drawHistory.find(d => d.id === drawId);
    if (draw) {
        detailsModalTitle.textContent = `Links for Draw from ${new Date(draw.date).toLocaleString()}`;
        let table = '<table><tr><th>Participant</th><th>Link</th></tr>';
        draw.assignments.forEach(assignment => {
            let participantIdForUrl = assignment.giver.id;
            let linkText = assignment.giver.name;
            if (!participantIdForUrl) {
                console.warn(`Participant ID is undefined for giver: ${assignment.giver.name}. This indicates a potential data inconsistency.`);
                participantIdForUrl = 'undefined_id'; // Use a placeholder
                linkText += ' (ID missing)';
            }
            const url = `${window.location.origin}${window.location.pathname.replace('index.html', '')}participant.html?drawId=${draw.id}&participantId=${participantIdForUrl}`;
            table += `<tr><td>${linkText}</td><td><button class="copy-link-button" data-url="${url}">Copy</button></td></tr>`;
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
    }
}


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
        // Ensure all loaded participants have an ID and remove email property if present
        participants.forEach(p => {
            if (!p.id) {
                // If ID was generated with email before, re-generate with just name
                p.id = generateUniqueId(p.name);
            }
            // Ensure no email property exists for participants loaded from old data
            if (p.email) {
                delete p.email;
            }
        });
        renderParticipants();
    }

    if (storedExclusions) {
        exclusions = JSON.parse(storedExclusions);
        // Filter out exclusions involving participants that no longer exist
        const currentParticipantIds = new Set(participants.map(p => p.id));
        exclusions = exclusions.filter(excl =>
            currentParticipantIds.has(excl.giverId) && currentParticipantIds.has(excl.receiverId)
        );
    }

    if (storedDrawHistory) {
        drawHistory = JSON.parse(storedDrawHistory);
        // Ensure all loaded assignments in drawHistory have participant IDs
        drawHistory.forEach(draw => {
            draw.assignments.forEach(assignment => {
                if (assignment.giver) {
                    if (!assignment.giver.id) {
                        assignment.giver.id = generateUniqueId(assignment.giver.name);
                    }
                    if (assignment.giver.email) { // Remove email property from giver
                        delete assignment.giver.email;
                    }
                }
                if (assignment.receiver) {
                    if (!assignment.receiver.id) {
                        assignment.receiver.id = generateUniqueId(assignment.receiver.name);
                    }
                    if (assignment.receiver.email) { // Remove email property from receiver
                        delete assignment.receiver.email;
                    }
                }
            });
        });
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
    const drawDate = new Date();
    const assignments = currentDraw;

    const draw = {
        date: drawDate,
        assignments: assignments,
        id: generateUniqueId(drawDate.toISOString())
    };

    // Store assignments in localStorage with draw ID and participant ID as key
    assignments.forEach(assignment => {
        // Store the full assignment details for the giver
        const participantAssignmentData = {
            giverName: assignment.giver.name,
            receiverName: assignment.receiver.name
        };
        localStorage.setItem(`assignment_${draw.id}_${assignment.giver.id}`, JSON.stringify(participantAssignmentData));
    });


    drawHistory.push(draw);
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
