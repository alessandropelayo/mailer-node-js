import { PrismaClient, User, Role, AccessLevel } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateUserInput {
	email: string;
	password: string;
	role?: Role;
	accessLevel?: AccessLevel;
}

export interface UserModel {
	id: string;
	email: string;
	role: Role;
	accessLevel: AccessLevel;
}

class UserService {
	async createUser(data: CreateUserInput): Promise<User> {
		return prisma.user.create({
			data: {
				...data,
				role: Role.USER,
				accessLevel: AccessLevel.NO_ACCESS, // Default access level
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

	async updateUserAccess(
		userId: string,
		accessLevel: AccessLevel
	): Promise<User> {
		return prisma.user.update({
			where: { id: userId },
			data: { accessLevel },
		});
	}

	async updateUserRole(userId: string, role: Role): Promise<User> {
		return prisma.user.update({
			where: { id: userId },
			data: { role },
		});
	}

	async sanitizeUser(user: User): Promise<UserModel> {
		return {
			id: user.id,
			email: user.email,
			role: user.role,
			accessLevel: user.accessLevel,
		};
	}

	async getAllUsers(): Promise<UserModel[]> {
		const users = await prisma.user.findMany();
		return users.map((user) => ({
			id: user.id,
			email: user.email,
			role: user.role,
			accessLevel: user.accessLevel,
		}));
	}
}

export const userService = new UserService();
