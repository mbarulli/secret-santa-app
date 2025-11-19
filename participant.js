document.addEventListener('DOMContentLoaded', () => {
    const assignedPersonElement = document.getElementById('assigned-person');
    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get('data');

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
