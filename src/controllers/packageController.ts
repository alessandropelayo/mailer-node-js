import { Request, Response, NextFunction } from "express";
const model = require("../models/packageModel");
import path from "path";

export const getPackage = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const packageId = req.query.trackingNumber as string;
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

export const getRecentPackagesHomePage = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const count = parseInt(req.query.count as string) || 0;
		let limit = parseInt(req.query.limit as string) || 25;
		if (limit > 100) limit = 100;

		const after = req.query.after as string;
		let packageData: any;

		if (after) {
			const afterParsed = JSON.parse(after);
			if (!afterParsed.trackingId || !afterParsed.carrier) {
				return res.status(400).json({
					error:
						"Invalid 'after' parameter: 'trackingId' and 'carrier' are required",
				});
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
		next(error);
	}
};

export const getPackagePhoto = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const fileLocation = req.query.fileLocation as string;
		const absolutePath = path.resolve(fileLocation);
		res.sendFile(absolutePath);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
	}
};
