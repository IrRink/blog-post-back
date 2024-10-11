const userService = require("../services/userServices");

const registerUserController = async (req, res) => {
  const { email, userName, userAge, password } = req.body;
  try {
    const token = await userService.registerUser(req.pool, email, userName, userAge, password);
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loginUserController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await userService.loginUser(req.pool, email, password);
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  registerUserController,
  loginUserController,
};
