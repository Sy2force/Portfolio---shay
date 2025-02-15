document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reservationForm');
    
    // Set operating hours (from 9am to 10pm)
    const timeInput = document.getElementById('time');
    timeInput.addEventListener('change', function() {
        const time = this.value;
        const hour = parseInt(time.split(':')[0]);
        
        if (hour < 9 || hour >= 22) {
            alert('Sessions are available between 9:00 AM and 10:00 PM');
            this.value = '09:00';
        }
    });

    // Form validation and submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check required fields
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const session = document.getElementById('session').value;
        const pilots = document.getElementById('pilots').value;

        if (!name || !phone || !email || !date || !time || !session || !pilots) {
            alert('Please fill in all required fields');
            return;
        }

        // Confirmation message
        alert('Your reservation has been received successfully! We will contact you for confirmation.');
        
        // Reset the form
        form.reset();
    });
});