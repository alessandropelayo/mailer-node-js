import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function createEmail(data) {
	try {
		const newEmail = await prisma.emails.create({
			data,
		});
		//console.log("Email created:", newEmail);
		return newEmail;
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			// Handle unique constraint violation here
			console.error("Unique constraint failed:", error.message);
		} else {
			console.error("Error creating email:", error);
			throw error;
		}
	}
}

async function getEmails(filters = {}) {
	try {
		const emails = await prisma.emails.findMany(filters);
		//console.log("Fetched emails:", emails);
		return emails;
	} catch (error) {
		console.error("Error fetching emails:", error);
	}
}

async function updateEmail(id, data) {
	try {
		const updatedEmail = await prisma.emails.update({
			where: { id: id },
			data,
		});
		//console.log(`Email updated with id: ${updatedEmail.dbId}`);
		return updatedEmail;
	} catch (error) {
		console.error("Error updating email:", error);
		throw error;
	}
}

async function deleteEmail(id) {
	try {
		const deletedEmail = await prisma.emails.delete({
			where: { id: id },
		});
		//console.log(`Email deleted with id: ${deletedEmail.dbId}`);
		return deletedEmail;
	} catch (error) {
		console.error("Error deleting email:", error);
		throw error;
	}
}

module.exports = { createEmail, getEmails, updateEmail, deleteEmail };
