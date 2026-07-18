import { Controller, Post, Body, Get, UseGuards, Param, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginByCodeDto } from './dto/login-by-code.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('chauffeur/login')
  async chauffeurLogin(@Body() loginByCodeDto: LoginByCodeDto) {
    return this.authService.loginByCode(loginByCodeDto);
  }

  @Post('livreur/login')
  async livreurLogin(@Body() loginByCodeDto: LoginByCodeDto) {
    return this.authService.loginByCode(loginByCodeDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req) {
    return this.authService.me(req.user.sub);
  }

  @Post('generate-codes/:userId')
  @UseGuards(JwtAuthGuard)
  async generateAccessCodes(@Param('userId') userId: string) {
    return this.authService.generateAccessCodes(userId);
  }
}
