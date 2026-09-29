import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('registro')
  registrar(@Body() dto: RegisterDto) {
    return this.authService.registrar(dto);
  }

  @Public()
  @Get('verificar/:token')
  async verificar(@Param('token') token: string, @Res() res: Response) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:5173');
    try {
      await this.authService.verificarEmail(token);
      res.redirect(`${frontendUrl}/login?verificado=1`);
    } catch {
      res.redirect(`${frontendUrl}/login?verificado=0`);
    }
  }
}
