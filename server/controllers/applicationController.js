const Application = require("../models/Application");
const Project = require("../models/Project");
const User = require("../models/User");
const Notification = require("../models/Notification");

// APPLY TO PROJECT
const applyToProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // check if project exists
    const project = await Project.findById(projectId).populate("owner", "name email");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // check already applied
    const alreadyApplied = await Application.findOne({
      project: projectId,
      applicant: req.user.id,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await Application.create({
      project: projectId,
      applicant: req.user.id,
    });

    // Create notification for project owner
    const applicant = await User.findById(req.user.id).select("name");
    const notification = await Notification.create({
      user: project.owner._id,
      title: "New application received",
      message: `${applicant.name} applied for your project '${project.title}'.`,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(project.owner._id.toString()).emit("newNotification", notification);
    }

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY APPLICATIONS
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      applicant: req.user.id,
    }).populate("project");

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET APPLICANTS FOR MY PROJECT
const getApplicantsForProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const applications = await Application.find({
      project: projectId,
    }).populate("applicant", "name email");

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ACCEPT / REJECT
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id).populate("applicant", "name email");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    // Send notification to applicant
    const notification = await Notification.create({
      user: application.applicant._id,
      title: `Application ${status}`,
      message: `Your application for project has been ${status.toLowerCase()}.`,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(application.applicant._id.toString()).emit("newNotification", notification);
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyToProject,
  getMyApplications,
  getApplicantsForProject,
  updateApplicationStatus,
};