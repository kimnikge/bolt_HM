const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.telegramAuth = async (req, res) => {
    try {
        const { id, first_name, username } = req.body;

        let user = await User.findOne({ telegramId: id });

        if (!user) {
            user = new User({
                username: username || first_name,
                email: `${id}@telegram.com`,
                password: Math.random().toString(36).slice(-8),
                telegramId: id
            });
            await user.save();
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Telegram auth error:', error);
        res.status(500).json({ error: error.message });
    }
};
