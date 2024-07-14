const express = require("express");
const http = require("http");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require("morgan");
const hpp = require('hpp');
const path = require("path");
const AppError = require('./middleware/errorHandler');
const globalErrorHandler = require('./controller/errorController');


const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

// Security HTTP headers
app.use(helmet());

// Limit requests from the same API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Parse incoming JSON requests (up to 100kb)
app.use(express.json({ limit: '100kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Logger for development environment
app.use(morgan('dev'));

// Example route
app.get('/', (req, res) => {
    res.json({ message: "Hello World!" });
});

// API routes

const rootIndex = require("./routes/index");
const rootCategory = require("./routes/categoryRoutes");
const rootProduct = require("./routes/productRoutes");

app.use("/api", rootIndex);
app.use("/api/category", rootCategory);
app.use("/api/product", rootProduct);

// Handle undefined routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
