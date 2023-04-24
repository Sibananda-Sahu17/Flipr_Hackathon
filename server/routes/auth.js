const router = require("express").Router();
const { user } = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
	const User = await user.findOne({ email: req.body.email });
	if (!User)
		return res.status(400).send({ message: "invalid email or password!" });

	const validPassword = await bcrypt.compare(req.body.password, User.password);
	if (!validPassword)
		return res.status(400).send({ message: "Invalid email or password!" });

	const token = User.generateAuthToken();
	res.status(200).send({ data: token, message: "Signing in please wait..." });
});

module.exports = router;