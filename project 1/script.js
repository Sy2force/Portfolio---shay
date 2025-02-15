// Wait for the document to load
document.addEventListener('DOMContentLoaded', function() {
    // Get the form
    const form = document.getElementById('reservationForm');
    
    // When the form is submitted
    form.onsubmit = function(e) {
        e.preventDefault(); // Stop normal submission
        
        // Retrieve information
        const name = document.getElementById('name').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        
        // Display confirmation message
        alert('Thank you for your reservation, ' + name + '!\n' + 
            'For ' + date + ' at ' + time);
        
        // Save the Reservation
        saveReservation(name, date, time);
    };
});