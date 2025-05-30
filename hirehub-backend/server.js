const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// MongoDB Client Setup
const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
let userCollection;
let jobsCollection;

async function connectToDB() {
    try {
        await client.connect();
        const database = client.db("Hirehub-dev");
        userCollection = database.collection("users");
        jobsCollection = database.collection("jobs");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
}
connectToDB();

// User Signup
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await userCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const username = email;

        const newUser = {
            name,
            email,
            password: hashedPassword,
            username
        };

        const result = await userCollection.insertOne(newUser);
        const token = jwt.sign({ userId: result.insertedId, name }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User Signin
app.post('/api/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userCollection.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Post a Job
app.post('/api/postjobs', async (req, res) => {
    const { title, company, location, description } = req.body;

    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        console.log('userID',userId);

        const newJob = {
            title,
            company,
            location,
            description
        };

        const result = await jobsCollection.insertOne(newJob);
        const job = {
            _id: result.insertedId, 
            ...newJob
        };
        
        res.status(201).json({ message: 'Job added successfully!', job });
    } catch (error) {
        console.error('Add Job error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search Jobs
app.get('/api/jobs/search', async (req, res) => {
    const { title, location } = req.query;

    try {
        const query = {};

        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        const jobs = await jobsCollection.find(query).toArray();
        res.json({ jobs });
    } catch (error) {
        console.error('Search Jobs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Find the user by email
        const user = await userCollection.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a password reset token
        const token = crypto.randomBytes(32).toString('hex');

        // Set token and expiration on user object
        const resetToken = {
            token,
            expires: Date.now() + 3600000 // Token expires in 1 hour
        };

        await userCollection.updateOne(
            { _id: user._id },
            { $set: { resetPasswordToken: resetToken.token, resetPasswordExpires: resetToken.expires } }
        );

        // Send password reset email
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // Use environment variables for sensitive data
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            text: `You requested a password reset. Click the link to reset your password: 
            http://localhost:3000/reset-password/${token}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
app.post('/api/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Find user with the given reset token and check expiration
        const user = await userCollection.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Check if token has not expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password and remove reset token and expiration
        await userCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null
                }
            }
        );

        res.status(200).json({ message: 'Password has been reset' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

