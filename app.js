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
const cors = require('cors'); // Import the cors package


const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");

// Serve static files for image uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enable CORS
app.use(cors({
    origin: 'http://localhost:4200', // Allow Angular frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

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
const rootPack = require("./routes/packRoutes");
const rootCart = require("./routes/cartRoutes");
const rootOrder = require("./routes/orderRoutes");
const rootChat = require("./routes/chatRoutes");

app.use("/api", rootIndex);
app.use("/api/category", rootCategory);
app.use("/api/product", rootProduct);
app.use("/api/pack", rootPack);
app.use("/api/cart", rootCart);
app.use("/api/order", rootOrder);
app.use("/api/chat", rootChat);

// Handle undefined routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
