const express = require("express");
const router = express.Router();

const {
  applyToProject,
  getMyApplications,
  getApplicantsForProject,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const { protect } = require("../middleware/authMiddleware");

// Apply
router.post("/:projectId", protect, applyToProject);

// My applications
router.get("/me", protect, getMyApplications);

// Applicants for project
router.get("/project/:projectId", protect, getApplicantsForProject);

// Accept / Reject
router.put("/:id", protect, updateApplicationStatus);

module.exports = router;