import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class SecurityMgmtService {
  constructor(private prisma: PrismaService) {}

  // --- Helpers for JSON strings (MySQL 5.6 compatibility) ---
  
  private parseJson(val: string | null | undefined): any {
    if (!val) return {};
    try {
      return typeof val === 'string' ? JSON.parse(val) : val;
    } catch {
      return {};
    }
  }

  private stringifyJson(val: any): string {
    return JSON.stringify(val || {});
  }

  // --- Products ---

  async findAllProducts() {
    const products = await this.prisma.product.findMany({
      include: { _count: { select: { modules: true } } },
      orderBy: { created_at: 'desc' }
    });
    return products.map(p => ({
      ...p,
      name: this.parseJson(p.name),
      description: this.parseJson(p.description)
    }));
  }

  async createProduct(data: any) {
    return this.prisma.product.create({
      data: {
        name: this.stringifyJson(data.name),
        description: this.stringifyJson(data.description),
        icon: data.icon,
        is_active: data.is_active ?? true
      }
    });
  }

  async updateProduct(id: string, data: any) {
    return this.prisma.product.update({
      where: { id },
      data: {
        name: data.name ? this.stringifyJson(data.name) : undefined,
        description: data.description ? this.stringifyJson(data.description) : undefined,
        icon: data.icon,
        is_active: data.is_active
      }
    });
  }

  // --- Modules ---

  async findAllModules(product_id?: string) {
    const modules = await this.prisma.module.findMany({
      where: product_id ? { product_id } : {},
      include: { product: true, _count: { select: { features: true } } },
      orderBy: { created_at: 'desc' }
    });
    return modules.map(m => ({
      ...m,
      name: this.parseJson(m.name),
      description: this.parseJson(m.description),
      product: m.product ? { ...m.product, name: this.parseJson(m.product.name) } : null
    }));
  }

  async createModule(data: any) {
    return this.prisma.module.create({
      data: {
        product_id: data.product_id,
        name: this.stringifyJson(data.name),
        description: this.stringifyJson(data.description),
        icon: data.icon,
        is_active: data.is_active ?? true
      }
    });
  }

  async updateModule(id: string, data: any) {
    return this.prisma.module.update({
      where: { id },
      data: {
        name: data.name ? this.stringifyJson(data.name) : undefined,
        description: data.description ? this.stringifyJson(data.description) : undefined,
        icon: data.icon,
        is_active: data.is_active,
        product_id: data.product_id
      }
    });
  }

  // --- Features ---

  async findAllFeatures(module_id?: string) {
    const features = await this.prisma.feature.findMany({
      where: module_id ? { module_id } : {},
      include: { module: true, _count: { select: { actions: true } } },
      orderBy: { created_at: 'desc' }
    });
    return features.map(f => ({
      ...f,
      name: this.parseJson(f.name),
      description: this.parseJson(f.description),
      allowed_roles: this.parseJson(f.allowed_roles),
      module: f.module ? { ...f.module, name: this.parseJson(f.module.name) } : null
    }));
  }

  async createFeature(data: any) {
    return this.prisma.feature.create({
      data: {
        module_id: data.module_id,
        name: this.stringifyJson(data.name),
        description: this.stringifyJson(data.description),
        icon: data.icon,
        is_active: data.is_active ?? true,
        allowed_roles: this.stringifyJson(data.allowed_roles || [])
      }
    });
  }

  async updateFeature(id: string, data: any) {
    return this.prisma.feature.update({
      where: { id },
      data: {
        name: data.name ? this.stringifyJson(data.name) : undefined,
        description: data.description ? this.stringifyJson(data.description) : undefined,
        icon: data.icon,
        is_active: data.is_active,
        module_id: data.module_id,
        allowed_roles: data.allowed_roles ? this.stringifyJson(data.allowed_roles) : undefined
      }
    });
  }

  // --- Actions ---

  async findAllActions(feature_id?: string) {
    const actions = await this.prisma.action.findMany({
      where: feature_id ? { feature_id } : {},
      include: { feature: true },
      orderBy: { created_at: 'desc' }
    });
    return actions.map(a => ({
      ...a,
      name: this.parseJson(a.name),
      description: this.parseJson(a.description),
      allowed_roles: this.parseJson(a.allowed_roles),
      feature: a.feature ? { ...a.feature, name: this.parseJson(a.feature.name) } : null
    }));
  }

  async createAction(data: any) {
    return this.prisma.action.create({
      data: {
        feature_id: data.feature_id,
        name: this.stringifyJson(data.name),
        description: this.stringifyJson(data.description),
        icon: data.icon,
        is_active: data.is_active ?? true,
        allowed_roles: this.stringifyJson(data.allowed_roles || [])
      }
    });
  }

  async updateAction(id: string, data: any) {
    return this.prisma.action.update({
      where: { id },
      data: {
        name: data.name ? this.stringifyJson(data.name) : undefined,
        description: data.description ? this.stringifyJson(data.description) : undefined,
        icon: data.icon,
        is_active: data.is_active,
        feature_id: data.feature_id,
        allowed_roles: data.allowed_roles ? this.stringifyJson(data.allowed_roles) : undefined
      }
    });
  }
}
