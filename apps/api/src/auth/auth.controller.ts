import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { LoginChauffeurDto } from './dto/login-chauffeur.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('chauffeur/login')
  loginChauffeur(@Body() dto: LoginChauffeurDto) {
    return this.authService.loginChauffeur(dto);
  }

  @Post('chauffeur/code')
  loginByCode(@Body() body: { code: string }) {
    return this.authService.loginByCode(body.code);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    return req.user;
  }
}
