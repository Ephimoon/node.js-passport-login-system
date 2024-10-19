if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const cors = require('cors');  // Import cors

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

// Users list initialization
let users = [];
(async () => {
    const hashedPassword1 = await bcrypt.hash('melanie', 10);
    const hashedPassword2 = await bcrypt.hash('bob', 10);
    users = [
        {
            id: '1',
            name: 'Melanie',
            email: 'melanie@test.com',
            password: hashedPassword1
        },
        {
            id: '2',
            name: 'Bob',
            email: 'bob@test.com',
            password: hashedPassword2
        }
    ];
    console.log(users); // Confirm that users are correctly created
})();

// Middleware setup
app.use(express.json());  // Use JSON middleware to parse request bodies
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(cors({
    origin: 'http://localhost:5173',  // Allow requests from frontend
    credentials: true                 // Allow cookies to be included
}));

// Routes
app.get('/', checkAuthenticated, (req, res) => {
    res.json({ message: `Welcome, ${req.user.name}`, user: req.user });
});

app.post('/login', checkNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (!user) {
            return res.status(400).json({ message: info.message }); // Specific message from passport like 'No user with that email'
        }
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Login failed' });
            }

            delete user.password;

            return res.status(200).json({ message: 'Login successful', user });
        });
    })(req, res, next);
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        if (!req.body.name || !req.body.email || !req.body.password) {
            throw new Error('All fields are required');
        }

        const existingUser = users.find(user => user.email === req.body.email);
        if (existingUser) {
            throw new Error('Email is already registered');
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

// Authentication Middleware
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized, please login.' });
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.status(403).json({ message: 'Already logged in.' });
    }
    next();
}


app.listen(3000);
