document.addEventListener('DOMContentLoaded', () => {
    const assignedPersonElement = document.getElementById('assigned-person');
    const backgroundContainer = document.querySelector('.background-container');
    const urlParams = new URLSearchParams(window.location.search);
    const drawId = urlParams.get('drawId');
    const participantId = urlParams.get('participantId');

    const randomImageUrl = 'https://source.unsplash.com/featured/?christmas,landscape';

    fetch(randomImageUrl)
        .then(response => {
            if (response.ok) {
                backgroundContainer.style.backgroundImage = `url('${response.url}')`;
            } else {
                console.error('Failed to fetch random image.');
            }
        })
        .catch(error => {
            console.error('Error fetching random image:', error);
        });


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