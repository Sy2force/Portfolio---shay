document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reservationForm');
    const totalPriceElement = document.getElementById('total-price');
    
    // Prices for different passes
    const prices = {
        '1day': 75,
        '2days': 140,
        '3days': 200
    };

    // Calculate total price
    function calculateTotal() {
        const passType = document.getElementById('pass-type').value;
        const quantity = document.getElementById('quantity').value;
        const camping = document.getElementById('camping').value;

        let total = 0;
        
        // Calculate pass prices
        if (passType && quantity) {
            total = prices[passType] * parseInt(quantity);
        }

        // Add camping if selected
        if (camping === 'yes') {
            total += 30 * parseInt(quantity || 0);
        }

        // Update display
        totalPriceElement.textContent = `Total: ${total}€`;
    }

    // Event listeners for price calculation
    document.getElementById('pass-type').addEventListener('change', calculateTotal);
    document.getElementById('quantity').addEventListener('change', calculateTotal);
    document.getElementById('camping').addEventListener('change', calculateTotal);

    // Form validation and submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Retrieve values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const age = document.getElementById('age').value;
        const passType = document.getElementById('pass-type').value;
        const quantity = document.getElementById('quantity').value;

        // Age validation
        if (age < 16) {
            alert('Sorry, you must be at least 16 years old to participate in the festival');
            return;
        }

        // Required fields validation
        if (!name || !email || !phone || !passType || !quantity) {
            alert('Please fill in all required fields');
            return;
        }

        // Simulate reservation submission
        const confirmation = confirm(`Confirm your reservation?\n\n` +
            `${quantity} passes for ${name}\n` +
            `${document.getElementById('pass-type').options[document.getElementById('pass-type').selectedIndex].text}\n` +
            `${document.getElementById('camping').value === 'yes' ? 'With camping option' : 'Without camping'}\n\n` +
            `${totalPriceElement.textContent}`);

        if (confirmation) {
            alert('Your reservation has been confirmed! You will receive an email with the details of your order.');
            form.reset();
            calculateTotal(); // Reset total
        }
    });
});