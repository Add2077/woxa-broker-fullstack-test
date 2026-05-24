import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BrokersModule } from './brokers/brokers.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'local-dev-secret',
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
    AuthModule,
    BrokersModule,
  ],
})
export class AppModule {}
