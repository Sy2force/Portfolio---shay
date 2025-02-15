document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Collect form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // You could add logic here to:
    // 1. Validate the form
    // 2. Send the data to a backend service
    // 3. Show a success/error message
    
    console.log('Form submitted:', { name, email, message });
    alert('Merci pour votre message !');
    this.reset(); // Clear the form
});