import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SecurityMgmtService } from './security-mgmt.service';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('security-mgmt')
@UseGuards(RolesGuard)
@Roles('Admin')
export class SecurityMgmtController {
  constructor(private readonly service: SecurityMgmtService) {}

  // --- Products ---
  @Get('products')
  async findAllProducts() {
    return this.service.findAllProducts();
  }

  @Post('products')
  async createProduct(@Body() data: any) {
    return this.service.createProduct(data);
  }

  @Put('products/:id')
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.service.updateProduct(id, data);
  }

  // --- Modules ---
  @Get('modules')
  async findAllModules(@Query('product_id') product_id?: string) {
    return this.service.findAllModules(product_id);
  }

  @Post('modules')
  async createModule(@Body() data: any) {
    return this.service.createModule(data);
  }

  @Put('modules/:id')
  async updateModule(@Param('id') id: string, @Body() data: any) {
    return this.service.updateModule(id, data);
  }

  // --- Features ---
  @Get('features')
  async findAllFeatures(@Query('module_id') module_id?: string) {
    return this.service.findAllFeatures(module_id);
  }

  @Post('features')
  async createFeature(@Body() data: any) {
    return this.service.createFeature(data);
  }

  @Put('features/:id')
  async updateFeature(@Param('id') id: string, @Body() data: any) {
    return this.service.updateFeature(id, data);
  }

  // --- Actions ---
  @Get('actions')
  async findAllActions(@Query('feature_id') feature_id?: string) {
    return this.service.findAllActions(feature_id);
  }

  @Post('actions')
  async createAction(@Body() data: any) {
    return this.service.createAction(data);
  }

  @Put('actions/:id')
  async updateAction(@Param('id') id: string, @Body() data: any) {
    return this.service.updateAction(id, data);
  }
}
