import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('metrics')
  getMetrics() {
    return [
      { label: 'Total Tenants', value: 24, trend: 12 },
      { label: 'Active Satellites', value: 142, trend: 5 },
      { label: 'Platform Uptime', value: '99.98%', trend: 0.01 },
      { label: 'System Alerts', value: 3, trend: -50 }
    ];
  }

  @Get('tenants')
  getTenants() {
    return [
      { name: 'SkyNet Logistics', status: 'Active', plan: 'Enterprise Pro', vehicles: 142 },
      { name: 'Orbital Freight', status: 'Active', plan: 'Standard', vehicles: 45 },
      { name: 'Global Sat Transit', status: 'Inactive', plan: 'Basic', vehicles: 0 },
      { name: 'Zenith Meridian', status: 'Active', plan: 'Enterprise Pro', vehicles: 89 },
    ];
  }
}
