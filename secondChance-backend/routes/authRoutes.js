const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const connectToDatabase = require('../models/db');
const dotenv = require('dotenv');
const pino = require('pino');  // Import Pino logger
dotenv.config();


const logger = pino();  // Create a Pino logger instance

const JWT_SECRET = process.env.JWT_SECRET;

console.log(JWT_SECRET);

router.post('/register', async (req, res) => {
    try {
        const db = await connectToDatabase();

        const collection = db.collection("users");
        const existingEmail = await collection.findOne({ email: req.body.email });

        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({ error: 'Email id already exists' });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;

        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);
        logger.info('User registered successfully');
        res.json({ authtoken, email });
    } catch (e) {
         return res.status(500).send('Internal server error');
    }
});

module.exports = router;