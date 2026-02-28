// Update script.js to display mobile number after OTP is sent

// Assuming there is a function that handles the sending of OTP
function sendOTP() {
    // Code to send OTP

    // Assuming a variable mobileNumber holds the user's mobile number
    const mobileNumber = getUserMobileNumber();  // Fetch the user's mobile number

    // Update the OTP section to display the mobile number
    document.getElementById('otp-section').innerHTML += `<p>Mobile Number: ${mobileNumber}</p>`;
}