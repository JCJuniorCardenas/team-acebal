import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { DashboardService, ResumenDashboard } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumen')
  resumen(@CurrentUser() usuario: CurrentUserPayload): Promise<ResumenDashboard> {
    return this.dashboardService.resumen(usuario.sub);
  }
}
