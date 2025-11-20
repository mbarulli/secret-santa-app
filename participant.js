document.addEventListener('DOMContentLoaded', () => {
    const assignedPersonElement = document.getElementById('assigned-person');
    const backgroundContainer = document.querySelector('.background-container');
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('data');

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


    if (data) {
        try {
            const decodedData = atob(data);
            const assignment = JSON.parse(decodedData);
            assignedPersonElement.textContent = assignment.receiver.name;
        } catch (error) {
            assignedPersonElement.textContent = 'Error: Could not decode assignment.';
            console.error('Error decoding assignment:', error);
        }
    } else {
        assignedPersonElement.textContent = 'No assignment data found.';
    }
});
