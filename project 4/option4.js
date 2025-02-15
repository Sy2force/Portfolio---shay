// Wait for the document to load
document.addEventListener('DOMContentLoaded', function() {
    // Get the form
    const newsletterForm = document.getElementById('newsletterForm');
    
    // Add event listener for form submission
    newsletterForm.addEventListener('submit', function(e) {
        // Prevent page reload
        e.preventDefault();
        
        // Retrieve values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        
        // Create an object with the data
        const formData = {
            name: name,
            email: email,
            date: new Date().toLocaleDateString()
        };
        
        // Save to localStorage
        saveFormData(formData);
        
        // Display a message
        alert('Thank you for signing up!');
        
        // Reset the form
        newsletterForm.reset();
    });
});

// Function to save form data
function saveFormData(data) {
    // Get existing subscriptions
    let savedSubscriptions = JSON.parse(localStorage.getItem('festivalSubscriptions')) || [];
    
    // Add the new subscription
    savedSubscriptions.push(data);
    
    // Save to localStorage
    localStorage.setItem('festivalSubscriptions', JSON.stringify(savedSubscriptions));
}