import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Broker as BrokerModel, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BrokerQueryDto, CreateBrokerDto } from './dto';

@Injectable()
export class BrokersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBrokerDto) {
    const slug = dto.slug.trim().toLowerCase();
    const existing = await this.prisma.broker.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Broker slug already exists');
    }

    const broker = await this.prisma.broker.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description.trim(),
        logo_url: dto.logo_url,
        website: dto.website,
        broker_type: dto.broker_type,
      },
    });

    return {
      message: 'Broker created successfully',
      broker: this.toResponse(broker),
    };
  }

  async findAll(query: BrokerQueryDto) {
    const where: Prisma.BrokerWhereInput = {};

    if (query.search?.trim()) {
      where.name = {
        contains: query.search.trim(),
        mode: 'insensitive',
      };
    }

    if (query.type) {
      where.broker_type = query.type;
    }

    const brokers = await this.prisma.broker.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return {
      data: brokers.map((broker) => this.toResponse(broker)),
    };
  }

  async findOne(slug: string) {
    const broker = await this.prisma.broker.findUnique({ where: { slug } });
    if (!broker) {
      throw new NotFoundException('Broker not found');
    }

    return this.toResponse(broker);
  }

  private toResponse(broker: BrokerModel) {
    return {
      id: broker.id,
      name: broker.name,
      slug: broker.slug,
      description: broker.description,
      logo_url: broker.logo_url,
      website: broker.website,
      broker_type: broker.broker_type,
      createdAt: broker.created_at,
      updatedAt: broker.updated_at,
    };
  }
}
