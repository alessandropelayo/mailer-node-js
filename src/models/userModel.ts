import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateUserInput {
	email: string;
	password: string;
	role?: string;
}

export interface UserModel {
	id: string;
	email: string;
	role: string;
}

class UserService {
	async createUser(data: CreateUserInput): Promise<User> {
		return prisma.user.create({
			data: {
				...data,
				role: "USER",
			},
		});
	}

	async findUserByEmail(email: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: { email },
		});
	}

	async findUserById(id: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: { id },
		});
	}

	async findUserByRefreshToken(refreshToken: string): Promise<User | null> {
		return prisma.user.findFirst({
			where: { refreshToken },
		});
	}

	async updateRefreshToken(
		userId: string,
		refreshToken: string | null
	): Promise<User> {
		return prisma.user.update({
			where: { id: userId },
			data: { refreshToken },
		});
	}

	async sanitizeUser(user: User): Promise<UserModel> {
		return {
			id: user.id,
			email: user.email,
			role: user.role,
		};
	}
}

export const userService = new UserService();
