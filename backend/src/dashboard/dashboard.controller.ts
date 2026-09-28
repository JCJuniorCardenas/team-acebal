import { Controller, Get } from '@nestjs/common';
import { DashboardService, ResumenDashboard } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumen')
  resumen(): Promise<ResumenDashboard> {
    return this.dashboardService.resumen();
  }
}
