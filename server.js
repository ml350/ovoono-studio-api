const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'OvoOno Studio API'});
});

app.listen(3000, () => {
    console.log('Sever is running on port 3000');
});

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'yourpass',
    database: 'yourdatabase'
});

// Test database connection
db.getConnection((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Successfully connected to database');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const [users, fields] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length > 0) {
        const user = users[0];

        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                const token = jwt.sign({ id: user.id }, 'your_secret_key', { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.status(401).json({ message: 'Invalid password' });
            }
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'An error occurred, please try again later' });
});
