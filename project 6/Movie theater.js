document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reservationForm');
    const totalPriceElement = document.getElementById('total-price');
    const typeSelect = document.getElementById('type');
    const ticketsSelect = document.getElementById('tickets');
    const extrasSelect = document.getElementById('extras');

    // Ticket and option prices
    const prices = {
        standard: 20,
        premium: 30,
        vip: 45,
        extras: {
            none: 0,
            snacks: 10,
            combo: 15
        }
    };

    // Calculate total price
    function calculateTotal() {
        const ticketType = typeSelect.value;
        const ticketCount = parseInt(ticketsSelect.value) || 0;
        const extras = extrasSelect.value;

        const basePrice = prices[ticketType] || 0;
        const extraPrice = prices.extras[extras] || 0;
        const totalPrice = (basePrice * ticketCount) + (extraPrice * ticketCount);

        totalPriceElement.textContent = `Total: ${totalPrice}€`;
        return totalPrice;
    }

    // Event listeners for price calculation
    [typeSelect, ticketsSelect, extrasSelect].forEach(element => {
        element.addEventListener('change', calculateTotal);
    });

    // Form validation and submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Retrieve form data
        const formData = new FormData(form);
        const reservation = Object.fromEntries(formData.entries());
        
        // Add total price
        reservation.totalPrice = calculateTotal();

        // Save to localStorage
        const reservations = JSON.parse(localStorage.getItem('cinemaReservations') || '[]');
        reservations.push(reservation);
        localStorage.setItem('cinemaReservations', JSON.stringify(reservations));

        // Confirmation message
        alert(`Reservation confirmed!\nTotal: ${reservation.totalPrice}€`);
        
        // Reset the form
        form.reset();
        totalPriceElement.textContent = 'Total: 0€';
    });
});