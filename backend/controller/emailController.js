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
 * Sends ticket confirmation email to users after booking a flight
 * @param {Object} req - Express request object containing flight details
 * @param {string} req.header.authorization - JWT token for authentication
 * @param {Object} req.body - Flight booking information
 * @param {number} req.body.flightId - Unique identifier for the flight
 * @param {string} req.body.date - Date of travel
 * @param {number} req.body.price - Ticket price
 * @param {string} req.body.seatNumber - Seat number assigned
 * @param {string} req.body.seatClass - Class of service (economy/business/first)
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.sendTicketConfirmation = (req, res) => {
  const token = req.header("authorization");
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  const { flightId, date, price, seatNumber, seatClass } = req.body;
  const email = decoded.email;
  const name = decoded.username;

  flightService.getFlightName(flightId, (err, result) => {
    if (err) {
      return res.status(500).send({ success: false, error: "Database error" });
    }

    if (!result || result.length === 0) {
      return res.status(404).send({ success: false, error: "Flight not found" });
    }

    const { FlightID: id ,From: flightDeparture, To: flightArrival } = result[0];
    const templateData = { id,flightDeparture, flightArrival, name, email, date, price, seatNumber, seatClass };

    renderTicketTemplate(templateData, (err, renderedTemplate) => {
      if (err) {
        console.error("Error rendering EJS template:", err);
        return res.status(500).send({ success: false, error: "EJS render error" });
      }

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
 * @param {Object} req - Express request object containing user credentials
 * @param {Object} req.body - User identification details
 * @param {string} req.body.email - User's registered email address
 * @param {string} req.body.username - User's username
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.resetPassword = (req, res) => {
  const { email,username } = req.body;

  findUserByEmail(email,username, (err, result) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).send("Server error occurred.");
    }

    if (result.length === 0) {
      return res.status(404).send("Email not found.");
    }

    const newPassword = passwordGenerator();

    hashPassword(newPassword, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).send("Error hashing the password.");
      }

      updateUserPassword(result[0].userID, hashedPassword, (err) => {
        if (err) {
          console.error("Error updating the password in the database:", err);
          return res.status(500).send("Error updating the password.");
        }

        sendTicketEmail(email, "Password reset", `Your new password is: ${newPassword}`, (err) => {
          if (err) {
            console.error("Error sending email:", err);
            return res.status(500).send("Failed to send the email.");
          }

          res.status(200).send("Password reset successfully. Check your email for the new password.");
        });
      });
    });
  });
};
