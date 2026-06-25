import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
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
}
