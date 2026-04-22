import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

const READONLY_FIELDS = new Set(['id', 'createdAt', 'updatedAt', '_count']);

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) {}

  private sanitize(data: any): any {
    if (!data) return data;
    // Remove read-only fields and any nested objects/relations
    return Object.fromEntries(
      Object.entries(data).filter(([k, v]) => 
        !READONLY_FIELDS.has(k) && (v === null || typeof v !== 'object')
      )
    );
  }

  @Get('metrics')
  async getMetrics() {
    const tenantCount = await this.prisma.tenant.count();
    return [
      { label: 'Total Tenants', value: tenantCount, trend: 12 },
      { label: 'Active Satellites', value: 142, trend: 5 },
      { label: 'Platform Uptime', value: '99.98%', trend: 0.01 },
      { label: 'System Alerts', value: 3, trend: -50 }
    ];
  }

  // Plans
  @Get('subscription-plans')
  getPlans() {
    return [
      { id: 'free', name: 'Free Tier', price: 0 },
      { id: 'standard', name: 'Standard', price: 29 },
      { id: 'premium', name: 'Premium', price: 99 },
      { id: 'enterprise', name: 'Enterprise', price: 249 }
    ];
  }

  // Tenants
  @Get('tenants')
  async getTenants(@Query('name') name?: string, @Query('id') id?: string) {
    const where: any = {};
    if (name) where.name = { contains: name };
    if (id && !isNaN(Number(id))) where.id = Number(id);
    
    return this.prisma.tenant.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' } 
    });
  }

  @Get('tenants/:id')
  async getTenant(@Param('id') id: string) {
    return this.prisma.tenant.findUnique({ where: { id: Number(id) } });
  }

  @Post('tenants')
  async createTenant(@Body() data: any) {
    return this.prisma.tenant.create({ 
      data: { ...this.sanitize(data), createdBy: 'admin' } 
    });
  }

  @Put('tenants/:id')
  async updateTenant(@Param('id') id: string, @Body() data: any) {
    return this.prisma.tenant.update({ 
      where: { id: Number(id) }, 
      data: { ...this.sanitize(data), modifiedBy: 'admin' }
    });
  }

  @Delete('tenants/:id')
  async deleteTenant(@Param('id') id: string) {
    return this.prisma.tenant.delete({ where: { id: Number(id) } });
  }

  // Manufacturers
  @Get('manufacturers')
  async getManufacturers() {
    return this.prisma.manufacturer.findMany({
      include: { _count: { select: { brands: true } } }
    });
  }

  @Post('manufacturers')
  async createManufacturer(@Body() data: any) {
    return this.prisma.manufacturer.create({ 
      data: this.sanitize(data) 
    });
  }

  @Patch('manufacturers/:id')
  async updateManufacturer(@Param('id') id: string, @Body() data: any) {
    return this.prisma.manufacturer.update({ 
      where: { id }, 
      data: this.sanitize(data) 
    });
  }

  @Delete('manufacturers/:id')
  async deleteManufacturer(@Param('id') id: string) {
    return this.prisma.manufacturer.delete({ where: { id } });
  }

  // Brands
  @Get('manufacturers/:id/brands')
  async getBrands(@Param('id') manufacturerId: string) {
    return this.prisma.brand.findMany({
      where: { manufacturerId },
      include: { _count: { select: { deviceModels: true } } }
    });
  }

  @Post('manufacturers/:id/brands')
  async createBrand(@Param('id') manufacturerId: string, @Body() data: any) {
    return this.prisma.brand.create({
      data: { ...this.sanitize(data), manufacturerId }
    });
  }

  @Patch('brands/:id')
  async updateBrand(@Param('id') id: string, @Body() data: any) {
    return this.prisma.brand.update({ 
      where: { id }, 
      data: this.sanitize(data) 
    });
  }

  @Delete('brands/:id')
  async deleteBrand(@Param('id') id: string) {
    return this.prisma.brand.delete({ where: { id } });
  }

  // Models
  @Get('brands/:id/models')
  async getModels(@Param('id') brandId: string) {
    return this.prisma.deviceModel.findMany({
      where: { brandId },
      include: { protocol: true }
    });
  }

  @Post('brands/:id/models')
  async createModel(@Param('id') brandId: string, @Body() data: any) {
    return this.prisma.deviceModel.create({
      data: { ...this.sanitize(data), brandId }
    });
  }

  @Patch('models/:id')
  async updateModel(@Param('id') id: string, @Body() data: any) {
    return this.prisma.deviceModel.update({ 
      where: { id }, 
      data: this.sanitize(data) 
    });
  }

  @Delete('models/:id')
  async deleteModel(@Param('id') id: string) {
    return this.prisma.deviceModel.delete({ where: { id } });
  }

  // Protocols
  @Get('protocols')
  async getProtocols() {
    return this.prisma.protocol.findMany();
  }

  @Post('protocols')
  async createProtocol(@Body() data: any) {
    return this.prisma.protocol.create({ 
      data: this.sanitize(data) 
    });
  }

  @Patch('protocols/:id')
  async updateProtocol(@Param('id') id: string, @Body() data: any) {
    return this.prisma.protocol.update({ 
      where: { id }, 
      data: this.sanitize(data) 
    });
  }

  @Delete('protocols/:id')
  async deleteProtocol(@Param('id') id: string) {
    return this.prisma.protocol.delete({ where: { id } });
  }

  // Versions
  @Get('protocols/:id/versions')
  async getProtocolVersions(@Param('id') protocolId: string) {
    return this.prisma.protocolVersion.findMany({
      where: { protocolId },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post('protocols/:id/versions')
  async createProtocolVersion(@Param('id') protocolId: string, @Body() data: any) {
    return this.prisma.protocolVersion.create({
      data: { ...this.sanitize(data), protocolId }
    });
  }

  @Patch('protocol-versions/:id')
  async updateProtocolVersion(@Param('id') id: string, @Body() data: any) {
    return this.prisma.protocolVersion.update({ 
      where: { id }, 
      data: this.sanitize(data) 
    });
  }

  @Delete('protocol-versions/:id')
  async deleteProtocolVersion(@Param('id') id: string) {
    return this.prisma.protocolVersion.delete({ where: { id } });
  }

  // Visual Design Persistence (JSON integral)
  @Get('protocol-versions/:id/design')
  async getVisualDesign(@Param('id') protocolVersionId: string) {
    const result = await this.prisma.protocolFrameModel.findFirst({
      where: { protocolVersionId },
      orderBy: { updatedAt: 'desc' }
    });
    
    if (result && result.designJson) {
      return {
        ...result,
        designJson: JSON.parse(result.designJson)
      };
    }
    return result;
  }

  @Post('protocol-versions/:id/design')
  async saveVisualDesign(
    @Param('id') protocolVersionId: string,
    @Body() designData: any
  ) {
    const designJsonString = JSON.stringify(designData);
    
    // Check if design already exists to update or create
    const existing = await this.prisma.protocolFrameModel.findFirst({
      where: { protocolVersionId }
    });

    if (existing) {
      return this.prisma.protocolFrameModel.update({
        where: { id: existing.id },
        data: { designJson: designJsonString }
      });
    }

    return this.prisma.protocolFrameModel.create({
      data: {
        protocolVersionId,
        designJson: designJsonString
      }
    });
  }

  // Reporting - Data Sources
  @Get('datasources')
  async getDataSources() {
    return this.prisma.dataSource.findMany({
      orderBy: { updatedAt: 'desc' }
    });
  }

  @Get('datasources/:id')
  async getDataSource(@Param('id') id: string) {
    return this.prisma.dataSource.findUnique({ where: { id } });
  }

  @Post('datasources')
  async createDataSource(@Body() data: any) {
    return this.prisma.dataSource.create({
      data: {
        ...this.sanitize(data),
        configJson: data.config ? JSON.stringify(data.config) : null
      }
    });
  }

  @Put('datasources/:id')
  async updateDataSource(@Param('id') id: string, @Body() data: any) {
    return this.prisma.dataSource.update({
      where: { id },
      data: {
        ...this.sanitize(data),
        configJson: data.config ? JSON.stringify(data.config) : null
      }
    });
  }

  @Delete('datasources/:id')
  async deleteDataSource(@Param('id') id: string) {
    return this.prisma.dataSource.delete({ where: { id } });
  }

  // Reporting - Reports
  @Get('reports')
  async getReports() {
    const reports = await this.prisma.report.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return reports.map(r => ({
      ...r,
      measures: r.measures ? JSON.parse(r.measures) : [],
      dimensions: r.dimensions ? JSON.parse(r.dimensions) : [],
      filters: r.filters ? JSON.parse(r.filters) : [],
      delivery: r.deliveryJson ? JSON.parse(r.deliveryJson) : {}
    }));
  }

  @Get('reports/:id')
  async getReport(@Param('id') id: string) {
    const r = await this.prisma.report.findUnique({ where: { id } });
    if (!r) return null;
    return {
      ...r,
      measures: r.measures ? JSON.parse(r.measures) : [],
      dimensions: r.dimensions ? JSON.parse(r.dimensions) : [],
      filters: r.filters ? JSON.parse(r.filters) : [],
      delivery: r.deliveryJson ? JSON.parse(r.deliveryJson) : {}
    };
  }

  @Post('reports')
  async createReport(@Body() data: any) {
    return this.prisma.report.create({
      data: {
        name: data.name,
        cubeName: data.cubeName,
        format: data.format,
        measures: JSON.stringify(data.measures || []),
        dimensions: JSON.stringify(data.dimensions || []),
        filters: JSON.stringify(data.filters || []),
        deliveryJson: JSON.stringify(data.delivery || {})
      }
    });
  }

  @Put('reports/:id')
  async updateReport(@Param('id') id: string, @Body() data: any) {
    return this.prisma.report.update({
      where: { id },
      data: {
        name: data.name,
        cubeName: data.cubeName,
        format: data.format,
        measures: JSON.stringify(data.measures || []),
        dimensions: JSON.stringify(data.dimensions || []),
        filters: JSON.stringify(data.filters || []),
        deliveryJson: JSON.stringify(data.delivery || {})
      }
    });
  }
}
