const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

// Load environment variables from config.env
dotenv.config({ path: './config.env' });

// MongoDB connection
const DB = process.env.DATABASE;
mongoose.connect(DB)
    .then((con) => {
        console.log('🟢 DB connection successful to '+ con.connections[0].name +' 🟢');
        // Start the Express server
        const port = process.env.PORT || 3000;
        const server = app.listen(port, () => {
            console.log(`App running on port ${port}...`);
        });

        // Handle unhandledRejection (e.g., unexpected promises)
        process.on('unhandledRejection', (err) => {
            console.error('Unhandled Rejection:', err);
            // Optionally: Graceful shutdown if necessary
            server.close(() => process.exit(1)); // Close server and exit process
        });

        // Handle uncaughtException (e.g., unexpected errors)
        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);
            // Optionally: Graceful shutdown if necessary
            server.close(() => process.exit(1)); // Close server and exit process
        });

    })
    .catch((err) => {
        console.error('🔴 Database connection error 🔴:', err);
        process.exit(1); // Exit process on DB connection error
    });
