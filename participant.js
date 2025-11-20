document.addEventListener('DOMContentLoaded', () => {
    const assignedPersonElement = document.getElementById('assigned-person');
    const backgroundContainer = document.querySelector('.background-container');
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('data');

    const christmasImages = [
        'https://images.unsplash.com/photo-1513111534-0241805b9280?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        'https://images.unsplash.com/photo-1512626124831-a497799777e3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
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