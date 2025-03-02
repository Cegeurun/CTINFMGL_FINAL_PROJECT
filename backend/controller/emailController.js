const jwt = require("jsonwebtoken");
const flightService = require("../services/flightService");
const {
  passwordGenerator,
  renderTicketTemplate,
  sendTicketEmail,
  findUserByEmail,
  updateUserPassword,
  hashPassword,
} = require("../services/emailService");

/**
 * Handles ticket confirmation and email sending for flight bookings
 * @param {Object} req - Express request object containing flight details and authorization token
 * @param {Object} res - Express response object for sending responses
 */
exports.sendTicketConfirmation = (req, res) => {
  // Extract and verify JWT token from authorization header
  const token = req.header("authorization");
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  
  // Extract flight booking details from request body
  const { flightId, date, price, seatNumber, seatClass } = req.body;
  
  // Get user details from decoded token
  const email = decoded.email;
  const name = decoded.username;

  // Fetch flight details from database
  flightService.getFlightName(flightId, (err, result) => {
    if (err) {
      // Handle database query errors
      return res.status(500).send({ success: false, error: "Database error" });
    }

    // Validate flight existence
    if (!result || result.length === 0) {
      return res.status(404).send({ success: false, error: "Flight not found" });
    }

    // Extract flight information from database result
    const { FlightID: id, From: flightDeparture, To: flightArrival } = result[0];
    
    // Prepare template data for ticket generation
    const templateData = { 
      id, 
      flightDeparture, 
      flightArrival, 
      name, 
      email, 
      date, 
      price, 
      seatNumber, 
      seatClass 
    };

    // Generate ticket template using EJS
    renderTicketTemplate(templateData, (err, renderedTemplate) => {
      if (err) {
        console.error("Error rendering EJS template:", err);
        return res.status(500).send({ success: false, error: "EJS render error" });
      }

      // Send ticket confirmation email to user
      sendTicketEmail(email, "Ticket Confirmation", renderedTemplate, (err, result) => {
        if (err) {
          console.error("Error sending email:", err);
          return res.status(500).send({ success: false, error: err.message });
        }
        res.status(200).send({ success: true, result });
      });
    });
  });
};

/**
 * Handles password reset functionality for users
 * @param {Object} req - Express request object containing user email and username
 * @param {Object} res - Express response object for sending responses
 */
exports.resetPassword = (req, res) => {
  // Extract user credentials from request body
  const { email, username } = req.body;

  // Find user by email and username
  findUserByEmail(email, username, (err, result) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).send("Server error occurred.");
    }

    // Check if user exists
    if (result.length === 0) {
      return res.status(404).send("Email not found.");
    }

    // Generate new password
    const newPassword = passwordGenerator();

    // Hash the new password for secure storage
    hashPassword(newPassword, (err, hashedPassword) => {
      if (
