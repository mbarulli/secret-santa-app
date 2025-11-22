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
            const assignmentData = localStorage.getItem(`assignment_${drawId}_${participantId}`);
            if (assignmentData) {
                const assignmentDetails = JSON.parse(assignmentData);
                pageTitleElement.textContent = `Ciao ${assignmentDetails.giverName}!`;
                pageTitleElement.style.fontSize = '3em'; // Make font size much bigger
                assignedPersonElement.textContent = assignmentDetails.receiverName;
                assignedPersonElement.style.fontSize = '3em'; // Make font size much bigger
            } else {
                pageTitleElement.textContent = 'Assignment not found.';
                assignedPersonElement.textContent = '';
            }
        } catch (error) {
            pageTitleElement.textContent = 'Error: Could not retrieve assignment.';
            assignedPersonElement.textContent = '';
            console.error('Error retrieving assignment:', error);
        }
    } else {
        pageTitleElement.textContent = 'No assignment ID found.';
        assignedPersonElement.textContent = '';
    }
});