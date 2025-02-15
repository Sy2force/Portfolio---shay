document.addEventListener('DOMContentLoaded', function() {
    // Get the form
    const form = document.getElementById('reservationForm');
    
    // Set minimum date to today
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check that all required fields are filled
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const guests = document.getElementById('guests').value;

        // Simple validation
        if (!name || !phone || !email || !date || !time || !guests) {
            alert('Please fill in all required fields');
            return;
        }

        // If everything is ok, display a confirmation message
        alert('Your reservation has been received successfully! We will contact you for confirmation.');
        
        // Reset the form
        form.reset();
    });
});
