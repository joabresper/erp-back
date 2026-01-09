import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UsersService } from 'src/users/users.service';
import { HashingService } from 'src/common/providers/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { UserWithRole } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
	constructor (
		private readonly usersService: UsersService,
		private readonly hashingService: HashingService,
		private readonly jwtService: JwtService
	) {}
	
	async signIn(loginAuthDto: LoginAuthDto): Promise<{ accessToken: string }> {
		const { email, password } = loginAuthDto;

		let user: UserWithRole;

		try {
			user = await this.usersService.findByEmail(email);
		} catch (error) {
			// MEJORA: Solo ocultamos el error si es "No Encontrado" de Prisma (Código P2025)
			// Si es otro error (ej: DB caída), dejamos que NestJS lance Internal Server Error
			if (error.code === 'P2025' || error.name === 'NotFoundError') {
				throw new UnauthorizedException('Invalid credentials');
			}
			throw error; // Re-lanzamos errores críticos de DB
		}

		const isPasswordValid = await this.hashingService.compare(password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid credentials');
		}
		const payload = { sub: user.id, role: user.role.name }
		
		return {
			accessToken: await this.jwtService.signAsync(payload),
		}
	}
}
