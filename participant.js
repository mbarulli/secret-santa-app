document.addEventListener('DOMContentLoaded', () => {
    const assignedPersonElement = document.getElementById('assigned-person');
    const backgroundContainer = document.querySelector('.background-container');
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('data');

    const christmasImages = [
        'images/annie-spratt-VDXtVYJVj7A-unsplash.jpg',
        'images/chad-madden-SUTfFCAHV_A-unsplash.jpg',
        'images/jeshoots-com-7VOyZ0-iO0o-unsplash.jpg',
        'images/joanna-kosinska-_1T4ntNl324-unsplash.jpg',
        'images/toni-cuenca-CvFARq2qu8Y-unsplash.jpg'
    ];

    const randomImage = christmasImages[Math.floor(Math.random() * christmasImages.length)];
    backgroundContainer.style.backgroundImage = `url('${randomImage}')`;


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
