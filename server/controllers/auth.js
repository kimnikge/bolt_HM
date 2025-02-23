exports.register = async (req, res) => {
    try {
        console.log('Registration request received:', req.body); // Debug log
        // ...existing code...
        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword
        });
        console.log('Attempting to save user:', newUser); // Debug log
        const savedUser = await newUser.save();
        console.log('User saved successfully:', savedUser); // Debug log
        // ...existing code...
    } catch (error) {
        console.error('Registration error:', error); // Debug log
        res.status(500).json({ error: error.message });
    }
};
