document.addEventListener('DOMContentLoaded', () => {
    const assignedPersonElement = document.getElementById('assigned-person');
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
                const receiver = JSON.parse(assignmentData);
                assignedPersonElement.textContent = receiver.name;
            } else {
                assignedPersonElement.textContent = 'Assignment not found.';
            }
        } catch (error) {
            assignedPersonElement.textContent = 'Error: Could not retrieve assignment.';
            console.error('Error retrieving assignment:', error);
        }
    } else {
        assignedPersonElement.textContent = 'No assignment ID found.';
    }
});