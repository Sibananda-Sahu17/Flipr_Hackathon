const router = require("express").Router();
const { user } = require("../models/user");
const { Song, validate } = require("../models/song");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validObjectId");

// Create song
router.post("/", admin, async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send({ message: error.details[0].message });

	const song = await Song(req.body).save();
	res.status(201).send({ data: song, message:"Song created successfully" });
});

// Get all songs
router.get("/", async (req, res) => {
	const songs = await Song.find();
	res.status(200).send({ data: songs });
});

// Update song
router.put("/:id", [validateObjectId, admin], async (req, res) => {
	const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
	});
	res.send({ data: song, message: "Updated song successfully" });
});

// Delete song by ID
router.delete("/:id", [validateObjectId, admin], async (req, res) => {
	await Song.findByIdAndDelete(req.params.id);
	res.status(200).send({ message: "Song deleted successfully" });
});

// Like song
router.put("/like/:id", [validateObjectId, auth], async (req, res) => {
	let resMessage = "";
	const song = await Song.findById(req.params.id);
	if (!song) return res.status(400).send({ message: "song does not exist" });

	const User = await user.findById(req.User._id);
	const index = User.likedSongs.indexOf(song._id);
	if (index === -1) {
		User.likedSongs.push(song._id);
		resMessage = "Added to your liked songs ";
	} else {
		User.likedSongs.splice(index, 1);
		resMessage = "Removed from your liked songs";
	}

	await User.save();
	res.status(200).send({ message: resMessage });
});

// Get liked songs
router.get("/like", auth, async (req, res) => {
	const User = await user.findById(req.User._id);
	const songs = await Song.find({ _id: User.likedSongs});
	res.status(200).send({ data: songs });
});

module.exports = router;