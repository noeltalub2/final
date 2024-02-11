const date_time = () => {
	let today = new Date();
	return today.toLocaleString();
};

const date = () => {
	let today = new Date();
	return today.toLocaleDateString();
};

const expiration_date = (month) => {
    let today = new Date();
    // Get the current month
    let currentMonth = today.getMonth();
    // Add 2 months
    today.setMonth(currentMonth + month);
    // Return the new date
    return today.toLocaleString();
};

module.exports = {date_time,date,expiration_date}