import { Controller, Post, Body, HttpCode, HttpStatus, Get, Req, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('chauffeur/login')
  @HttpCode(HttpStatus.OK)
  async chauffeurLogin(@Body() body: { codeAcces: string; pin: string; coopId?: string }) {
    return this.authService.login(body.codeAcces, body.pin);
  }

  @Get('me')
  async me(@Headers('authorization') auth: string) {
    if (!auth) throw new UnauthorizedException('Token manquant');
    try {
      const token = auth.replace('Bearer ', '');
      const payload = this.jwtService.verify(token);
      return { id: payload.sub, email: payload.email, role: payload.role };
    } catch (e) {
      throw new UnauthorizedException('Token invalide');
    }
  }
}
