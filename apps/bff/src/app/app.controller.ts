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

  @Get('manufacturers')
  getManufacturers() {
    return [
      { id: 'm1', name: 'Teltonika', website: 'https://teltonika-gps.com', logo: 'teltonika.png' },
      { id: 'm2', name: 'Queclink', website: 'https://queclink.com', logo: 'queclink.png' },
      { id: 'm3', name: 'Suntech', website: 'https://suntech.com', logo: 'suntech.png' },
    ];
  }

  @Get('manufacturers/m1/brands')
  getTeltonikaBrands() {
    return [{ id: 'b1', manufacturerId: 'm1', name: 'Teltonika Telematics', description: 'Advanced GPS trackers', image: 'telt.png', tags: ['Professional', 'Industrial'] }];
  }

  @Get('brands/b1/models')
  getTeltonikaModels() {
    return [
      { id: 'mod1', brandId: 'b1', name: 'FMB920', description: 'Small and smart tracker', tags: ['Bluetooth', 'Internal Battery'] },
      { id: 'mod2', brandId: 'b1', name: 'FMB120', description: 'Advanced tracker with internal high gain GNSS', tags: ['RS232', 'RS485'] },
    ];
  }

  @Get('protocols')
  getProtocols() {
    return [
      { id: 'p1', name: 'Teltonika Codec 8' },
      { id: 'p2', name: 'Teltonika Codec 8 Extended' },
      { id: 'p3', name: 'Wialon IPS' },
    ];
  }
}
