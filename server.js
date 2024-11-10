const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const budget = require('./src/handler/budget');
const response = require('./src/middlewares/response');
const auth = require('./src/handler/auth');
const authMiddleware = require('./src/middlewares/authMiddleware');
const updatePassword = require('./src/handler/updatePassword');
const sessionrenewal = require('./src/middlewares/sessionrenewal');

const app = express();
const port = process.env.PORT || 5000;

app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 2 * 60 * 60 * 1000 // 2 hours
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true //cookies allow's
}));

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    connectSrc: ["'self'", "http://localhost:5000"],
  },
}));

app.use(response);

app.use(sessionrenewal);

app.use('/api/auth', auth);

app.use('/api', authMiddleware); 
app.use('/api', budget);
app.use('/api', updatePassword);

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
