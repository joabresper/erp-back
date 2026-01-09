import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginAuthDto })
  @ApiResponse({ status: 201, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.signIn(loginAuthDto);
  }
}
