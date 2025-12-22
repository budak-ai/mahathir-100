function calculateAge() {
    const birthDate = new Date('July 10, 1925');
    const now = new Date();

    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();

    // Adjust for negative days
    if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
        years--;
        months += 12;
    }

    document.getElementById('years').innerHTML = years.toString().padStart(2, '0');
    document.getElementById('months').innerHTML = months.toString().padStart(2, '0');
    document.getElementById('days').innerHTML = days.toString().padStart(2, '0');
}

// Calculate age on load
calculateAge();

// Update daily at midnight
setInterval(calculateAge, 86400000);
