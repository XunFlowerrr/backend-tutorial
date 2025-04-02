// authController.js
export const registerUser = async (req, res) => {
  const { username, password } = req.body; // รับข้อมูลจาก Body
  res
    .status(200)
    .send({ message: "User registered successfully", username, password });
};
export const loginUser = async (req, res) => {
  const { username, password } = req.body; // รับข้อมูลจาก Body
  res
    .status(200)
    .send({ message: "User logged in successfully", username, password });
};
