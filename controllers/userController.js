const { addUserService } = require('../services/userServices');

const addUserController = async (req, res) => {
    const { email, adminName, adminAge, password, isAdmin } = req.body;

    try {
        const message = await addUserService(email, adminName, adminAge, password, isAdmin);
        return res.status(201).json({ message });
    } catch (error) {
        return res.status(405).json({ error: error.message });
    }
};

module.exports = {
    addUserController,
};
