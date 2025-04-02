// authController.js
export const registerUser = async (req, res) => {
  res.status(200).send({ message: "User registered successfully" });
};
export const loginUser = async (req, res) => {
  res.status(200).send({ message: "User logged in successfully" });
};
