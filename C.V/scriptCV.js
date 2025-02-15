// Wait for the document to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the form
    const contactForm = document.getElementById('contactForm');
    
    // Add event listener for form submission
    contactForm.addEventListener('submit', function(e) {
        // Prevent default form behavior
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // Create object with form data
        const formData = {
            name: name,
            email: email,
            message: message
        };
        
        // Save to localStorage
        localStorage.setItem('contactMessage', JSON.stringify(formData));
        
        // Display alert
        alert('Message sent successfully!');
        
        // Reset the form
        contactForm.reset();
    });
});