import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Put, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { KeycloakService } from './keycloak.service';

const READONLY_FIELDS = new Set(['id', 'created_at', 'updated_at', '_count']);

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
    private readonly keycloak: KeycloakService
  ) {}

  private sanitize(data: any): any {
    const sanitized = { ...data };
    for (const field of READONLY_FIELDS) {
      delete sanitized[field];
    }
    return sanitized;
  }

  private parseJson(val: string | null | undefined): any {
    if (!val) return {};
    try {
      return JSON.parse(val);
    } catch {
      return {};
    }
  }

  @Get()
  getData() {
    return this.appService.getData();
  }

  // --- Iteration 3: Current User (Me) ---

  @Patch('users/me/avatar')
  async updateMyAvatar(@Req() req: Request, @Body('avatar') avatar: string) {
    const user = (req.session as any).user;
    if (!user) throw new UnauthorizedException();

    const userId = user.sub;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar }
    });

    // Sync session
    (req.session as any).user.avatar = updated.avatar;
    return { success: true, avatar: updated.avatar };
  }

  @Get('users/me/permissions')
  async getMyPermissions(@Req() req: Request) {
    const user = (req.session as any).user;
    if (!user) throw new UnauthorizedException();

    const roles = user.roles || [];
    
    // Fetch products hierarchy
    const products = await this.prisma.product.findMany({
      where: { is_active: true },
      include: {
        modules: {
          where: { is_active: true },
          include: {
            features: {
              where: { is_active: true },
              include: {
                actions: {
                  where: { is_active: true }
                }
              }
            }
          }
        }
      }
    });

    const results = products.map(p => {
       const modules = p.modules.map(m => {
          const features = m.features.filter(f => {
             const allowed = this.parseJson(f.allowed_roles) as string[];
             return allowed.length === 0 || allowed.some(r => roles.includes(r));
          }).map(f => {
             const actions = f.actions.filter(a => {
                const allowed = this.parseJson(a.allowed_roles) as string[];
                return allowed.length === 0 || allowed.some(r => roles.includes(r));
             }).map(a => ({
                id: a.id,
                name: this.parseJson(a.name)
             }));

             return {
                id: f.id,
                name: this.parseJson(f.name),
                description: this.parseJson(f.description),
                actions
             };
          });

          return {
             id: m.id,
             name: this.parseJson(m.name),
             features: features
          };
       }).filter(m => m.features.length > 0);

       return {
          id: p.id,
          name: this.parseJson(p.name),
          modules
       };
    }).filter(p => p.modules.length > 0);

    return results;
  }

  @Post('users/me/password')
  async changeMyPassword(@Req() req: Request, @Body('password') password: string) {
    const user = (req.session as any).user;
    if (!user) throw new UnauthorizedException();

    await this.keycloak.updateUserPassword(user.sub, password);
    return { success: true };
  }

  // Dashboard Stats
  @Get('metrics')
  async getMetrics() {
    const tenantCount = await this.prisma.tenant.count();
    const manufacturerCount = await this.prisma.manufacturer.count();
    const protocolCount = await this.prisma.protocol.count();
    const reportCount = await this.prisma.report.count();

    return [
      { label: 'Active Tenants', value: tenantCount, trend: 12 },
      { label: 'Manufacturers', value: manufacturerCount, trend: 0 },
      { label: 'Protocols', value: protocolCount, trend: 8 },
      { label: 'Reports Generated', value: reportCount, trend: -3 },
    ];
  }

  // Tenants
  @Get('tenants')
  async getTenants(@Query('status') status?: string) {
    const where = status ? { status } : {};
    return this.prisma.tenant.findMany({ 
      where, 
      orderBy: { created_at: 'desc' }
    });
  }

  @Get('tenants/:id')
  async getTenant(@Param('id') id: string) {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  @Post('tenants')
  async createTenant(@Body() data: any) {
    return this.prisma.tenant.create({ 
      data: { ...this.sanitize(data), created_by: 'admin' } 
    });
  }

  @Put('tenants/:id')
  async updateTenant(@Param('id') id: string, @Body() data: any) {
    return this.prisma.tenant.update({
      where: { id },
      data: { ...this.sanitize(data), modified_by: 'admin' }
    });
  }

  @Delete('tenants/:id')
  async deleteTenant(@Param('id') id: string) {
    return this.prisma.tenant.delete({ where: { id } });
  }

  // Manufacturers
  @Get('manufacturers')
  async getManufacturers() {
    return this.prisma.manufacturer.findMany({
      include: { _count: { select: { brands: true } } },
      orderBy: { name: 'asc' }
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
  async getBrands(@Param('id') manufacturer_id: string) {
    return this.prisma.brand.findMany({
      where: { manufacturer_id },
      include: { _count: { select: { device_models: true } } }
    });
  }

  @Post('manufacturers/:id/brands')
  async createBrand(@Param('id') manufacturer_id: string, @Body() data: any) {
    return this.prisma.brand.create({
      data: { ...this.sanitize(data), manufacturer_id }
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
  async getModels(@Param('id') brand_id: string) {
    return this.prisma.deviceModel.findMany({
      where: { brand_id },
      include: { protocol: true }
    });
  }

  @Post('brands/:id/models')
  async createModel(@Param('id') brand_id: string, @Body() data: any) {
    return this.prisma.deviceModel.create({
      data: { ...this.sanitize(data), brand_id }
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
    return this.prisma.protocol.findMany({
      include: { _count: { select: { versions: true } } },
      orderBy: { name: 'asc' }
    });
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

  @Get('protocols/:id/versions')
  async getProtocolVersions(@Param('id') protocol_id: string) {
    return this.prisma.protocolVersion.findMany({
      where: { protocol_id },
      orderBy: { created_at: 'desc' }
    });
  }

  @Post('protocols/:id/versions')
  async createProtocolVersion(@Param('id') protocol_id: string, @Body() data: any) {
    return this.prisma.protocolVersion.create({
      data: { ...this.sanitize(data), protocol_id }
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

  @Get('protocol-versions/:id/design')
  async getVisualDesign(@Param('id') protocol_version_id: string) {
    const result = await this.prisma.protocolFrameModel.findFirst({
      where: { protocol_version_id },
      orderBy: { updated_at: 'desc' }
    });

    if (result && result.design_json) {
      return {
        ...result,
        designJson: typeof result.design_json === 'string' ? JSON.parse(result.design_json) : result.design_json
      };
    }
    return result;
  }

  @Post('protocol-versions/:id/design')
  async saveVisualDesign(@Param('id') protocol_version_id: string, @Body() data: any) {
    const designJsonString = JSON.stringify(data);
    
    // Check if design already exists to update or create
    const existing = await this.prisma.protocolFrameModel.findFirst({
      where: { protocol_version_id }
    });

    if (existing) {
      return this.prisma.protocolFrameModel.update({
        where: { id: existing.id },
        data: { design_json: designJsonString }
      });
    }

    return this.prisma.protocolFrameModel.create({
      data: {
        protocol_version_id,
        design_json: designJsonString
      }
    });
  }

  // Data Sources
  @Get('datasources')
  async getDataSources() {
    return this.prisma.dataSource.findMany({
      orderBy: { updated_at: 'desc' }
    });
  }

  @Get('datasources/:id')
  async getDataSource(@Param('id') id: string) {
    return this.prisma.dataSource.findUnique({ where: { id } });
  }

  @Post('datasources')
  async createDataSource(@Body() data: any) {
    return this.prisma.dataSource.create({
      data: this.sanitize(data)
    });
  }

  @Put('datasources/:id')
  async updateDataSource(@Param('id') id: string, @Body() data: any) {
    return this.prisma.dataSource.update({
      where: { id },
      data: this.sanitize(data)
    });
  }

  @Delete('datasources/:id')
  async deleteDataSource(@Param('id') id: string) {
    return this.prisma.dataSource.delete({ where: { id } });
  }

  // Reports
  @Get('reports')
  async getReports() {
    const reports = await this.prisma.report.findMany({
      orderBy: { updated_at: 'desc' }
    });
    return reports.map(r => ({
      ...r,
      measures: r.measures ? (typeof r.measures === 'string' ? JSON.parse(r.measures) : r.measures) : [],
      dimensions: r.dimensions ? (typeof r.dimensions === 'string' ? JSON.parse(r.dimensions) : r.dimensions) : [],
      filters: r.filters ? (typeof r.filters === 'string' ? JSON.parse(r.filters) : r.filters) : [],
      delivery: r.delivery_json ? (typeof r.delivery_json === 'string' ? JSON.parse(r.delivery_json) : r.delivery_json) : {}
    }));
  }

  @Get('reports/:id')
  async getReport(@Param('id') id: string) {
    const r = await this.prisma.report.findUnique({ where: { id } });
    if (!r) return null;
    return {
      ...r,
      measures: r.measures ? (typeof r.measures === 'string' ? JSON.parse(r.measures) : r.measures) : [],
      dimensions: r.dimensions ? (typeof r.dimensions === 'string' ? JSON.parse(r.dimensions) : r.dimensions) : [],
      filters: r.filters ? (typeof r.filters === 'string' ? JSON.parse(r.filters) : r.filters) : [],
      delivery: r.delivery_json ? (typeof r.delivery_json === 'string' ? JSON.parse(r.delivery_json) : r.delivery_json) : {}
    };
  }

  @Post('reports')
  async createReport(@Body() data: any) {
    return this.prisma.report.create({
      data: {
        name: data.name,
        cube_name: data.cubeName,
        format: data.format,
        measures: JSON.stringify(data.measures || []),
        dimensions: JSON.stringify(data.dimensions || []),
        filters: JSON.stringify(data.filters || []),
        delivery_json: JSON.stringify(data.delivery || {}),
        data_source_id: data.dataSourceId
      }
    });
  }

  @Put('reports/:id')
  async updateReport(@Param('id') id: string, @Body() data: any) {
    return this.prisma.report.update({
      where: { id },
      data: {
        name: data.name,
        cube_name: data.cubeName,
        format: data.format,
        measures: JSON.stringify(data.measures || []),
        dimensions: JSON.stringify(data.dimensions || []),
        filters: JSON.stringify(data.filters || []),
        delivery_json: JSON.stringify(data.delivery || {}),
        data_source_id: data.dataSourceId
      }
    });
  }

  // Scheduled Tasks
  @Get('scheduled-tasks')
  async getScheduledTasks() {
    const tasks = await this.prisma.scheduledTask.findMany({
      include: { report: { select: { name: true } } },
      orderBy: { updated_at: 'desc' }
    });
    return tasks.map(t => ({
      ...t,
      reportName: (t as any).report?.name
    }));
  }

  @Get('scheduled-tasks/:id')
  async getScheduledTask(@Param('id') id: string) {
    return this.prisma.scheduledTask.findUnique({ where: { id } });
  }

  @Post('scheduled-tasks')
  async createScheduledTask(@Body() data: any) {
    return this.prisma.scheduledTask.create({
      data: { ...this.sanitize(data), status: 'pending' }
    });
  }

  @Put('scheduled-tasks/:id')
  async updateScheduledTask(@Param('id') id: string, @Body() data: any) {
    return this.prisma.scheduledTask.update({
      where: { id },
      data: this.sanitize(data)
    });
  }

  @Delete('scheduled-tasks/:id')
  async deleteScheduledTask(@Param('id') id: string) {
    return this.prisma.scheduledTask.delete({ where: { id } });
  }

  // User Management (Keycloak)
  @Get('users')
  async getUsers(@Query('search') search?: string) {
    return this.keycloak.getUsers(search);
  }

  @Post('users')
  async createUser(@Body() data: any) {
    return this.keycloak.createUser(data);
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.keycloak.getUserById(id);
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.keycloak.updateUser(id, data);
  }

  @Get('roles')
  async getRoles() {
    return this.keycloak.getAvailableRoles();
  }

  @Post('roles')
  async createRole(@Body() data: any) {
    console.log('Creating role with data:', data);
    try {
      const result = await this.keycloak.createRole(data);
      console.log('Role creation result:', result);
      return result;
    } catch (err: any) {
      console.error('Error in createRole controller:', err.response?.data || err.message);
      throw err;
    }
  }

  // Reporting - Executions
  @Get('report-executions')
  async getReportExecutions(@Query('reportId') reportId?: string) {
    const where = reportId ? { report_id: reportId } : {};
    return this.prisma.reportExecution.findMany({
      where,
      include: { report: { select: { name: true } } },
      orderBy: { executed_at: 'desc' }
    });
  }

  @Get('report-executions/:id')
  async getReportExecution(@Param('id') id: string) {
    return this.prisma.reportExecution.findUnique({
      where: { id },
      include: { report: { select: { name: true } } }
    });
  }
}
