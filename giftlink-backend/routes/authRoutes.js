/* jshint esversion: 8 */
// Step 1 - Task 2: Import necessary packages
const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino'); // Import Pino logger

// Step 1 - Task 3: Create a Pino logger instance
const logger = pino();

// Load environment variables from .env
dotenv.config();

// Step 1 - Task 4: Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`
        const db = await connectToDatabase();

        // Task 2: Access MongoDB collection
        const collection = db.collection("users");

        // Task 3: Check for existing email
        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;

        // Task 4: Save user details in database
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        // Task 5: Create JWT authentication with user._id as payload
        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User registered successfully');
        res.json({ authtoken, email });
    } catch (e) {
        logger.error('Registration failed: ' + e.message);
        return res.status(500).send('Internal server error');
    }
});

router.post('/login', async (req, res) => {
    try {
        // Task 1: Connect to `giftsdb` in MongoDB
        const db = await connectToDatabase();

        // Task 2: Access users collection
        const collection = db.collection("users");

        // Task 3: Find user by email
        const theUser = await collection.findOne({ email: req.body.email });

        // Task 7: If user not found
        if (!theUser) {
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        // Task 4: Compare password with stored hash
        const passwordMatch = await bcryptjs.compare(req.body.password, theUser.password);
        if (!passwordMatch) {
            logger.error('Passwords do not match');
            return res.status(401).json({ error: 'Wrong password' });
        }

        // Task 5: Extract user info
        const userName = theUser.firstName;
        const userEmail = theUser.email;

        // Task 6: Generate JWT token
        const payload = {
            user: {
                id: theUser._id.toString(),
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info(`User ${userEmail} logged in successfully`);
        return res.json({ authtoken, userName, userEmail });

    } catch (e) {
        logger.error('Login failed: ' + e.message);
        return res.status(500).send('Internal server error');
    }
});

// Task 1: Import body and validationResult 
router.put(
  '/update',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
  ],
  async (req, res) => {
    // Task 2: Validate request input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors in update request', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Task 3: Get email from headers
      const email = req.headers.email;
      if (!email) {
        logger.error('Email not found in request headers');
        return res
          .status(400)
          .json({ error: 'Email not found in the request headers' });
      }

      // Task 4: Connect to MongoDB
      const db = await connectToDatabase();
      const collection = db.collection('users');

      // Task 5: Find user by email
      const existingUser = await collection.findOne({ email });
      if (!existingUser) {
        logger.error(`No user found with email: ${email}`);
        return res.status(404).json({ error: 'User not found' });
      }

      // Task 6: Update user credentials
      existingUser.firstName = req.body.firstName;
      existingUser.lastName = req.body.lastName;
      existingUser.updatedAt = new Date();

      const updatedUserDoc = await collection.findOneAndUpdate(
        { email },
        { $set: existingUser },
        { returnDocument: 'after' }
      );

      const updatedUser = updatedUserDoc.value;

      // Task 7: Create JWT with user._id
      const payload = {
        user: {
          id: updatedUser._id.toString(),
        },
      };
      const authtoken = jwt.sign(payload, JWT_SECRET);

      logger.info(`User ${email} updated successfully`);
      return res.json({ authtoken });

    } catch (e) {
      logger.error('Update failed: ' + e.message);
      return res.status(500).send('Internal server error');
    }
  }
);



module.exports = router;
