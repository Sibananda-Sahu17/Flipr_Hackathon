const router = require("express").Router();
const { user, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validObjectId = require("../middleware/validObjectId");

//create user
router.post("/", async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send({ message: error.details[0].message });
	console.log(req.body.email)
	const User = await user.findOne({ email: req.body.email });
	if (User)
		return res.status(403).send({ message: "User already Exist!" });

	const salt = await bcrypt.genSalt(Number(process.env.SALT));
	const hashPassword = await bcrypt.hash(req.body.password, salt);
	let newUser = await new user({
		...req.body,
		password: hashPassword,
	}).save();

	newUser.password = undefined;
	newUser.__v = undefined;
	res.status(200).send({ data: newUser, message: "Account created successfully" });
});

//get all users
router.get("/", admin, async (req, res)=>{
	const users = await user.find().select("-password-__v");
	res.status(200).send({data:users});
})

//get user by id
router.get("/:id", [validObjectId, auth], async (req, res) => {
	const User = await user.findById(req.params.id).select("-password -__v");
	res.status(200).send({ data: User });
});
// update user by id
router.put("/:id", [validObjectId, auth], async (req, res) => {
	const User = await user.findByIdAndUpdate(
		req.params.id,
		{ $set: req.body },
		{ new: true }
	).select("-password -__v");
	res.status(200).send({ data: User, message: "Profile updated successfully" });
});

// delete user by id
router.delete("/:id", [validObjectId, admin], async (req, res) => {
	await user.findByIdAndDelete(req.params.id);
	res.status(200).send({ message: "Successfully deleted user." });
});


module.exports = router;