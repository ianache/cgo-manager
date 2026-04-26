import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LanguagesService } from './languages.service';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  async findAll() {
    return this.languagesService.findAll();
  }

  @Post()
  async create(@Body() data: any) {
    return this.languagesService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.languagesService.update(id, data);
  }
}
