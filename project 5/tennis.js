document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reservationForm');
    const totalPriceElement = document.getElementById('total-price');

    // Base prices
    const prices = {
        'clay': 25,    // Clay court
        'grass': 35,   // Grass court
        'hard': 20     // Hard court
    };

    // Calculate total price
    function updatePrice() {
        const courtType = document.getElementById('court-type').value;
        const duration = document.getElementById('duration').value;
        const equipment = document.getElementById('equipment').value;

        let total = 0;

        // Court price
        if (courtType && duration) {
            total = prices[courtType] * duration;
        }

        // Add equipment
        if (equipment === 'racket') {
            total += 5;
        } else if (equipment === 'full') {
            total += 10;
        }

        // Display total
        totalPriceElement.textContent = `Total: ${total}€`;
    }

    // Listen for changes on price-affecting fields
    document.getElementById('court-type').addEventListener('change', updatePrice);
    document.getElementById('duration').addEventListener('change', updatePrice);
    document.getElementById('equipment').addEventListener('change', updatePrice);

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Retrieve form data
        const reservationData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            courtType: document.getElementById('court-type').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            duration: document.getElementById('duration').value,
            equipment: document.getElementById('equipment').value,
            totalPrice: totalPriceElement.textContent
        };

        // Save data to localStorage
        const reservations = JSON.parse(localStorage.getItem('tennisReservations') || '[]');
        reservations.push(reservationData);
        localStorage.setItem('tennisReservations', JSON.stringify(reservations));

        // Show confirmation
        alert('Reservation confirmed!');
        
        // Reset the form
        form.reset();
        updatePrice();
    });

    // Calculate initial price
    updatePrice();
});