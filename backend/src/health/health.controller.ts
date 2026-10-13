import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // Liviano: no toca la base. Lo usan los pings de keep-alive.
  @Public()
  @Get()
  check() {
    return { status: 'ok' };
  }

  // Despierta la base (Neon la suspende por inactividad). Reintenta una vez
  // porque la primera consulta tras la suspensión puede fallar.
  @Public()
  @Get('warmup')
  async warmup() {
    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
      await this.dataSource.query('SELECT 1');
    }
    return { status: 'ok', db: 'ok' };
  }
}
