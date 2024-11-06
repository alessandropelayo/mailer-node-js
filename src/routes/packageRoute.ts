const express = require("express");

const router = express.Router();

const packageController = require("../controllers/packageController");

router.get("/packages", packageController.getPackage);

router.get("/packages/home", packageController.getRecentPackagesHomePage);

router.get("/packages/file/get", packageController.getPackagePhoto);

module.exports = router;
export {};
