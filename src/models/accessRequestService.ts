import {
	PrismaClient,
	AccessLevel,
	RequestStatus,
	Role,
	User,
} from "@prisma/client";
import { userService } from "../models/userModel";

const prisma = new PrismaClient();

export class AccessRequestService {
	async createRequest(userId: string, requestedLevel: AccessLevel) {
		return prisma.accessRequest.create({
			data: {
				userId,
				requestedLevel,
				status: RequestStatus.PENDING,
			},
			include: {
				user: true,
			},
		});
	}

	async handleUserRequest(
		userId: string,
		userEmail: string,
		requestedLevel: AccessLevel
	) {
		if (
			userEmail.toLowerCase() === process.env.MAIN_ADMIN_EMAIL?.toLowerCase()
		) {
			// Automatically approve and update access level for main admin
			await userService.updateUserAccess(userId, AccessLevel.FULL_ACCESS);
			await userService.updateUserRole(userId, "ADMIN");

			const request = await this.createRequest(userId, requestedLevel);
			await this.updateRequestStatus(request.id, RequestStatus.APPROVED);

			return {
				approved: true,
				accessLevel: AccessLevel.FULL_ACCESS,
				role: Role.ADMIN,
			};
		}

		// Create pending request for regular users
		await this.createRequest(userId, requestedLevel);
		return {
			approved: false,
			message: "Request pending admin approval",
		};
	}

	async getPendingRequests() {
		return prisma.accessRequest.findMany({
			where: {
				status: RequestStatus.PENDING,
			},
			include: {
				user: {
					select: {
						email: true,
						accessLevel: true,
						role: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}

	async getUserRequests(userId: string) {
		return prisma.accessRequest.findMany({
			where: { userId: userId },
			include: {
				user: {
					select: {
						email: true,
						accessLevel: true,
						role: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}

	async updateRequestStatus(
		requestId: string,
		status: RequestStatus,
		newAccessLevel?: AccessLevel
	) {
		const request = await prisma.accessRequest.update({
			where: { id: requestId },
			data: {
				status,
				updatedAt: new Date(),
			},
			include: {
				user: {
					select: {
						email: true,
						accessLevel: true,
						role: true,
					},
				},
			},
		});

		if (status === RequestStatus.APPROVED && newAccessLevel) {
			await userService.updateUserAccess(request.userId, newAccessLevel);
		}

		return request;
	}
}

export const accessRequestService = new AccessRequestService();
