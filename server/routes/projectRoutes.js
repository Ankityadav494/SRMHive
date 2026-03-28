const express = require("express");
const router = express.Router();

const {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.delete("/:id", protect, deleteProject);

module.exports = router;