import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BrokersService } from './brokers.service';
import { BrokerQueryDto, CreateBrokerDto } from './dto';

@Controller('brokers')
export class BrokersController {
  constructor(private readonly brokersService: BrokersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateBrokerDto) {
    return this.brokersService.create(dto);
  }

  @Get()
  findAll(@Query() query: BrokerQueryDto) {
    return this.brokersService.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.brokersService.findOne(slug);
  }
}
