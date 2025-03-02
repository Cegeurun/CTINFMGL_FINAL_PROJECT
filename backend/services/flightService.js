// Import database connection module for MySQL operations
const connection = require("../database/Mysql");

/**
 * Retrieves flights based on search criteria
 * @param {string} departure - Departure city
 * @param {string} arrival - Arrival city
 * @param {string} date - Flight date
 * @param {function} callback - Callback function(err, results)
 * @returns {array} Array of flight objects matching search criteria
 */
exports.getFlightsService = (departure, arrival, date, callback) => {
  // Build SQL query based on provided search parameters
  const sql = departure && arrival && date
    ? "SELECT * FROM flights WHERE `From` = ? AND `To` = ? AND `Date` = ?"
    : "SELECT * FROM flights";

  // Prepare query parameters based on search criteria
  const params = departure && arrival && date ? [departure, arrival, date] : [];

  // Execute query and handle results
  connection.query(sql, params, (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

/**
 * Retrieves flight details by ID
 * @param {number} flightId - ID of the flight to retrieve
 * @param {function} callback - Callback function(err, results)
 * @returns {array} Array containing flight details
 */
exports.getFlightName = (flightId, callback) => {
  // Query for flight details using the provided ID
  connection.query('Select * from flights where flightId=?', [flightId], (err, result) => {
    if (err) {
      return callback(err);
    }
    return callback(null, result);
  });
};

/**
 * Adds a new flight to the database
 * @param {object} flightDetails - Flight information object
 * @param {string} flightDetails.from - Departure city
 * @param {string} flightDetails.to - Arrival city
 * @param {string} flightDetails.date - Flight date
 * @param {string} flightDetails.duration - Flight duration
 * @param {number} flightDetails.price - Flight price
 * @param {function} callback - Callback function(err, results)
 */
exports.addFlightService = (flightDetails, callback) => {
  // Destructure flight details for easier access
  const { from, to, date, duration, price } = flightDetails;

  // SQL query to insert new flight with default status as "Available"
  const sql = 
    'INSERT INTO flights (`From`, `To`, `Date`, `Duration`, `Price`, `flight_status`) VALUES (?, ?, ?, ?, ?, "Available")';

  // Execute insertion query with flight parameters
  connection.query(sql, [from, to, date, duration, price], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};

/**
 * Retrieves the latest flight ID from the database
 * @param {function} callback - Callback function(err, flightId)
 * @returns {number} The most recent FlightID
 */
exports.getLatestFlightId = (callback) => {
  // SQL query to get the highest FlightID
  const sql = "SELECT FlightID FROM flights ORDER BY FlightID DESC LIMIT 1";

  // Execute query and return the FlightID
  connection.query(sql, (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results[0].FlightID);
  });
};

/**
 * Initializes seats for a newly added flight
 * @param {number} flightID - ID of the flight to initialize seats for
 * @param {function} callback - Callback function(err, results)
 */
exports.addSeatsService = (flightID, callback) => {
  // SQL query to insert predefined seat configurations
  const seatInsertionSql = `
    INSERT INTO seats (FlightID, SeatNumber, Class, Status, seat_price) VALUES
    (${flightID}, 1, 'Economy', 'Available', 100), (${flightID}, 2, 'Economy', 'Booked', 100), 
    (${flightID}, 3, 'Economy', 'Available', 100), (${flightID}, 4, 'Economy', 'Booked', 100), 
    (${flightID}, 5, 'Economy', 'Available', 100), (${flightID}, 6, 'Economy', 'Booked', 100),
    (${flightID}, 7, 'Economy', 'Available', 100), (${flightID}, 8, 'Economy', 'Booked', 100), 
    (${flightID}, 9, 'Economy', 'Available', 100), (${flightID}, 10, 'Economy', 'Booked', 100), 
    (${flightID}, 11, 'Economy', 'Available', 100), (${flightID}, 12, 'Economy', 'Booked', 100),
    (${flightID}, 13, 'Premium', 'Available', 450), (${flightID}, 14, 'Premium', 'Booked', 450), 
    (${flightID}, 15, 'Premium', 'Available', 450), (${flightID}, 16, 'Premium', 'Booked', 450), 
    (${flightID}, 17, 'Premium', 'Available', 450), (${flightID}, 18, 'Premium', 'Booked', 450),
    (${flightID}, 19, 'Premium', 'Available', 450), (${flightID}, 20, 'Premium', 'Booked', 450), 
    (${flightID}, 21, 'Premium', 'Available', 450), (${flightID}, 22, 'Premium', 'Booked', 450), 
    (${flightID}, 23, 'Premium', 'Available', 450), (${flightID}, 24, 'Premium', 'Booked', 450)
  `;

  // Execute seat initialization query
  connection.query(seatInsertionSql, (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
};
