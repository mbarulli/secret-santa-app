const participantForm = document.getElementById('participant-form');
const participantList = document.getElementById('participants');
const drawButton = document.getElementById('draw-button');
const resultsPanel = document.getElementById('results-panel');
const resultsList = document.getElementById('results');

let participants = [];

participantForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');

    const name = nameInput.value;
    const email = emailInput.value;

    if (name && email) {
        participants.push({ name, email });
        renderParticipants();
        nameInput.value = '';
        emailInput.value = '';
    }
});

function renderParticipants() {
    participantList.innerHTML = '';
    participants.forEach((participant, index) => {
        const li = document.createElement('li');
        li.textContent = `${participant.name} (${participant.email})`;
        participantList.appendChild(li);
    });
}

drawButton.addEventListener('click', () => {
    if (participants.length < 2) {
        alert('You need at least 2 participants to draw names.');
        return;
    }

    const results = drawNames();
    renderResults(results);
    resultsPanel.style.display = 'block';
    drawButton.style.display = 'none';
    participantForm.style.display = 'none';
    participantList.style.display = 'none';
});

function drawNames() {
    const assignments = [];
    const givers = [...participants];
    const receivers = [...participants];

    for (const giver of givers) {
        let receiver = receivers[Math.floor(Math.random() * receivers.length)];

        while (receiver.email === giver.email) {
            // Can't be your own Secret Santa
            if (receivers.length === 1) {
                // If we're stuck, restart the draw
                return drawNames();
            }
            receiver = receivers[Math.floor(Math.random() * receivers.length)];
        }

        assignments.push({ giver, receiver });
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
