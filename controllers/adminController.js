const adminService = require("../services/adminServices");

const registerAdminController = async (req, res) => {
  const { email, adminName, adminAge, password } = req.body;
  try {
    const token = await adminService.registerAdmin(req.pool, email, adminName, adminAge, password);
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loginAdminController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await adminService.loginAdmin(req.pool, email, password);
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  registerAdminController,
  loginAdminController,
};
