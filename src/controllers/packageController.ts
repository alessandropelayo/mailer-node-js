const model = require("../models/packageModel");
const path = require("path");

const getPackage = async (req, res, next) => {
	try {
		if (req.get("API_KEY") === process.env.API_KEY) {
			//console.log("Accessed By: ", req.ip);
		} else {
			return res.status(401).json({ error: "Missing API_KEY in header" });
		}

		const packageId = req.query.trackingNumber;

		const packageData = await model.getPackages({
			where: {
				trackingId: packageId,
			},
			select: {
				trackingId: true,
				carrier: true,
				statusHistory: {
					select: {
						trackingId: true,
						statusTime: true,
						deliveryDate: true,
						status: true,
					},
					orderBy: {
						statusTime: "desc",
					},
				},
			},
		});

		if (!packageData || packageData.length === 0) {
			return res.status(404).json({ error: "Package not found" });
		}

		res.json(packageData);
	} catch (error) {
		console.error("Error fetching package:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

const getRecentPackagesHomePage = async (req, res, next) => {
	try {
		if (req.get("API_KEY") === process.env.API_KEY) {
			//console.log("Accessed By: ", req.ip);
		} else {
			return res.status(401).json({ error: "Missing API_KEY in header" });
		}

		const count = parseInt(req.query.count) || 0;
		let limit = parseInt(req.query.limit) || 25;
		if (limit > 100) {
			limit = 100;
		}
		const after = req.query.after;

		let packageData: any;

		if (after) {
			const afterParsed = JSON.parse(after);
			if (!afterParsed.trackingId || !afterParsed.carrier) {
				res.statusCode = 400;
				throw new Error(
					"Invalid 'after' parameter: 'trackingId' and 'carrier' are required"
				);
			}

			packageData = await model.getPackages({
				take: limit,
				skip: 1,
				cursor: {
					trackingId_carrier: {
						trackingId: afterParsed.trackingId,
						carrier: afterParsed.carrier,
					},
				},
				select: {
					trackingId: true,
					carrier: true,
					from: true,
					statusHistory: {
						select: {
							trackingId: true,
							statusTime: true,
							deliveryDate: true,
							status: true,
						},
						orderBy: {
							statusTime: "desc",
						},
					},
					deliveryPhoto: {
						select: {
							fileLocation: true,
						},
					},
				},
				orderBy: {
					recentStatusTime: "desc",
				},
			});
		} else {
			packageData = await model.getPackages({
				skip: count,
				take: limit,
				select: {
					trackingId: true,
					carrier: true,
					from: true,
					statusHistory: {
						select: {
							trackingId: true,
							statusTime: true,
							deliveryDate: true,
							status: true,
						},
						orderBy: {
							statusTime: "desc",
						},
					},
					deliveryPhoto: {
						select: {
							fileLocation: true,
						},
					},
				},
				orderBy: {
					recentStatusTime: "desc",
				},
			});
		}

		res.json(packageData);
	} catch (error) {
		//console.log(error.message);

		next(error);
	}
};

const getPackagePhoto = async (req, res, next) => {
	try {
		if (
			req.get("API_KEY") === process.env.API_KEY ||
			req.query.API_KEY === process.env.API_KEY
		) {
			//console.log("Accessed By: ", req.ip);
		} else {
			console.log(JSON.stringify(req.header));
			return res.status(401).json({ error: "Missing API_KEY in header" });
		}

		const fileLocation = req.query.fileLocation;
		const absolutePath = path.resolve(fileLocation);
		res.sendFile(absolutePath);
	} catch (error) {
		//console.error("Error fetching photo:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = { getPackage, getRecentPackagesHomePage, getPackagePhoto };
