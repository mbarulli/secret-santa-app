document.addEventListener('DOMContentLoaded', () => {
    const assignedPersonElement = document.getElementById('assigned-person');
    const backgroundContainer = document.querySelector('.background-container');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

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


    if (id) {
        try {
            const assignmentData = localStorage.getItem(`assignment_${id}`);
            if (assignmentData) {
                const assignment = JSON.parse(assignmentData);
                assignedPersonElement.textContent = assignment.receiver.name;
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