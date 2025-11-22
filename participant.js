document.addEventListener('DOMContentLoaded', () => {
    const assignedPersonElement = document.getElementById('assigned-person');
    const pageTitleElement = document.getElementById('page-title');
    const backgroundContainer = document.querySelector('.background-container');
    const urlParams = new URLSearchParams(window.location.search);
    const drawId = urlParams.get('drawId');
    const participantId = urlParams.get('participantId');

    const localImages = [
        'images/annie-spratt-VDXtVYJVj7A-unsplash.jpg',
        'images/chad-madden-SUTfFCAHV_A-unsplash.jpg',
        'images/jeshoots-com-7VOyZ0-iO0o-unsplash.jpg',
        'images/joanna-kosinska-_1T4ntNl324-unsplash.jpg',
        'images/toni-cuenca-CvFARq2qu8Y-unsplash.jpg'
    ];
    const randomIndex = Math.floor(Math.random() * localImages.length);
    const selectedImageUrl = localImages[randomIndex];
    backgroundContainer.style.backgroundImage = `url('${selectedImageUrl}')`;


    if (drawId && participantId) {
        try {
            // Attempt to fetch assignment from a JSON file (for distributable links)
            fetch(`draws/draw_${drawId}.json`)
                .then(response => {
                    if (!response.ok) {
                        // Fallback to localStorage if JSON file not found (for local testing/admin)
                        const assignmentData = localStorage.getItem(`assignment_${drawId}_${participantId}`);
                        if (assignmentData) {
                            const assignmentDetails = JSON.parse(assignmentData);
                            pageTitleElement.textContent = `Ciao ${assignmentDetails.giverName}!`;
                            pageTitleElement.style.fontSize = '3em';
                            assignedPersonElement.textContent = assignmentDetails.receiverName;
                            assignedPersonElement.style.fontSize = '3em';
                        } else {
                            pageTitleElement.textContent = 'Assignment not found. (Local storage or JSON)';
                            assignedPersonElement.textContent = '';
                        }
                        throw new Error('Draw JSON not found or network error, falling back to local storage.');
                    }
                    return response.json();
                })
                .then(drawData => {
                    const assignment = drawData.assignments.find(a => a.giverId === participantId);
                    if (assignment) {
                        pageTitleElement.textContent = `Ciao ${assignment.giverName}!`;
                        pageTitleElement.style.fontSize = '3em';
                        assignedPersonElement.textContent = assignment.receiverName;
                        assignedPersonElement.style.fontSize = '3em';
                    } else {
                        pageTitleElement.textContent = 'Participant not found in draw JSON.';
                        assignedPersonElement.textContent = '';
                    }
                })
                .catch(error => {
                    console.error('Error fetching draw data:', error);
                    // Error already handled in the .then(response) block for not-ok response
                    // This catch block handles other fetch errors (e.g., network issues)
                    if (!pageTitleElement.textContent.includes('Assignment not found')) { // Avoid overwriting specific messages
                        pageTitleElement.textContent = 'Error: Could not retrieve assignment data.';
                        assignedPersonElement.textContent = '';
                    }
                });
        } catch (error) {
            console.error('Unexpected error:', error);
            pageTitleElement.textContent = 'Unexpected error occurred.';
            assignedPersonElement.textContent = '';
        }
    } else {
        pageTitleElement.textContent = 'No assignment ID found.';
        assignedPersonElement.textContent = '';
    }
});