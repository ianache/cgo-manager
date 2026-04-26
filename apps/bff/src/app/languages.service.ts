import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class LanguagesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.language.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(data: { iso_code: string; name: string }) {
    return this.prisma.language.create({
      data: {
        iso_code: data.iso_code,
        name: data.name,
      },
    });
  }

  async update(id: string, data: { is_active?: boolean; name?: string }) {
    return this.prisma.language.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.language.delete({
      where: { id },
    });
  }
}
