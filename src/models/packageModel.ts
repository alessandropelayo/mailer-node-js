import { PrismaClient } from "@prisma/client";
import {
	PrismaClientKnownRequestError,
	PrismaClientValidationError,
} from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function createPackage(data) {
	try {
		const newPackage = await prisma.packages.create({
			data,
		});
		return newPackage;
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			// Handle unique constraint violation here
			console.error("Unique constraint failed:", error.message);
		} else {
			console.error("Error creating package:", error);
			throw error;
		}
	}
}

async function getPackages(filters = {}) {
	try {
		const packages = await prisma.packages.findMany(filters);

		return packages;
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			throw new Error("Internal Server Error");
		} else if (error instanceof PrismaClientValidationError) {
			//throw error;
			throw new Error("Validation Error")
		} else {
			console.error("Error fetching packages:", error);
			throw new Error("Internal Server Error");
		}
		
	}
}

async function upsertPackage(data) {
	try {
		const upsertPackage = await prisma.packages.upsert({
			where: {
				trackingId_carrier: {
					trackingId: data.trackingId,
					carrier: data.carrier,
				},
			},
			update: data,
			create: data,
		});

		return upsertPackage;
	} catch (error) {
		//console.error("Error updating package:", error);
		throw error;
	}
}

async function updatePackage(record, data) {
	try {
		const updatedPackage = await prisma.packages.update({
			where: record,
			data,
		});

		return updatedPackage;
	} catch (error) {
		console.error("Error updating package:", error);
		throw error;
	}
}

async function deletePackage(record) {
	try {
		const deletedPackages = await prisma.packages.delete({
			where: record,
		});

		return deletedPackages;
	} catch (error) {
		console.error("Error deleting package:", error);
		throw error;
	}
}

module.exports = {
	createPackage,
	getPackages,
	upsertPackage,
	updatePackage,
	deletePackage,
};
