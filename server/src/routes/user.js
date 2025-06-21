import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from 'multer';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';
// import multer from "multer"; // Import multer for handling file uploads
// import path from "path"; // Import path for file path handling
import { UserModel } from "../models/Users.js";

const router = express.Router();

const client = new OAuth2Client('952102601051-q7fuoo1cmmo4gpv28ut6a96vhsgt5h2e.apps.googleusercontent.com');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/'); // Folder where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Define file naming convention
  },
});

// Set up Multer with storage and file filter for images only
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/; // Allowed image formats
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed!')); // Reject non-image files
    }
  },
});


router.post("/register", upload.single('image'), async (req, res) => {
  const { username, password, role } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const user = await UserModel.findOne({ username });
  if (user) {
    return res.status(400).json({ message: "Username already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new UserModel({ username, password: hashedPassword, profilePicture: '/uploads/'+req.file.filename , role });
  await newUser.save();
  res.json({ message: "User registered successfully" });
});

router.post('/google', async (req, res) => {
  const { token, name, email, profilePicture } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: "952102601051-q7fuoo1cmmo4gpv28ut6a96vhsgt5h2e.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();
  // Save user info to your database or session
  const user = await UserModel.findOne({ username:email });
  if (user) {
    return res.status(200).json({payload,user});
  }
  const newUser = new UserModel({ username:email, password: token, profilePicture: profilePicture, role:"User" });
  await newUser.save();
  res.json({payload,user:newUser});
});

router.put('/profile', upload.single('image'), async (req, res) => {
  try {
    const { userId, name, bio, isChef } = req.body;
    const updateData = {};

    // If a new profile picture is uploaded, add its URL to update data
    if (req.file) {
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    }

    if(name)
      updateData.name = name;
    if(bio)
      updateData.bio = bio;
    
    updateData.isChef = isChef;


    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

router.get("/chefs", async (req, res) => {
  try {
    const chefs = await UserModel.find({ isChef: true }); // Query for isChef=true
    res.status(200).json(chefs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chefs", details: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Username or password is incorrect" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res
      .status(400)
      .json({ message: "Username or password is incorrect" });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, "secret");
  res.json({ token, userID: user._id, username:user.username, role:user.role, profilePicture:user.profilePicture });
});

export { router as userRouter };

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    jwt.verify(authHeader, "secret", (err) => {
      if (err) {
        console.log(authHeader , err)
        return res.sendStatus(403);
      }
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

router.get("/users", async (req, res) => {
  try {
    // Fetch all users but exclude passwords for security reasons
    const users = await UserModel.find({}, '-password'); 
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred while fetching users." });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).select("-password"); // Exclude password from the response

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user details", error });
  }
});

router.put("/social-links/:id", async (req, res) => {
  const { twitter, facebook, instagram, linkedin, youtube } = req.body;

  try {
    const user = await UserModel.findById(req.params.id);

    if (user) {
      user.socialMediaLinks = {
        twitter: twitter || user.socialMediaLinks.twitter,
        facebook: facebook || user.socialMediaLinks.facebook,
        instagram: instagram || user.socialMediaLinks.instagram,
        linkedin: linkedin || user.socialMediaLinks.linkedin,
        youtube: youtube || user.socialMediaLinks.youtube,
      };

      await user.save();
      res.json({ message: "Social media links updated", user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating social media links" });
  }
});

// Follow a user
router.post('/follow/:id', async (req, res) => {
  const userId = req.body.id; // assuming user is logged in and their ID is in the req.user
  const followUserId = req.params.id;

  try {
    if (userId === followUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Check if the user is already following
    const user = await UserModel.findById(userId);
    if (user.following.includes(followUserId)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    // Add to following array of current user and followers array of the other user
    await UserModel.findByIdAndUpdate(userId, { $push: { following: followUserId } });
    await UserModel.findByIdAndUpdate(followUserId, { $push: { followers: userId } });

    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error following user', error: error.message });
  }
});

// Unfollow a user
router.post('/unfollow/:id', async (req, res) => {
  const userId = req.body.id; // assuming user is logged in and their ID is in the req.user
  const unfollowUserId = req.params.id;

  try {
    if (userId === unfollowUserId) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    // Check if the user is following
    const user = await UserModel.findById(userId);
    if (!user.following.includes(unfollowUserId)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Remove from following array of current user and followers array of the other user
    await UserModel.findByIdAndUpdate(userId, { $pull: { following: unfollowUserId } });
    await UserModel.findByIdAndUpdate(unfollowUserId, { $pull: { followers: userId } });

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user', error: error.message });
  }
});

export default router;