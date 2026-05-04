import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

const jwtSecret: string = process.env.JWT_SECRET ?? 'default-secret-change-in-production';
const jwtExpiresIn: string = process.env.JWT_EXPIRES_IN ?? '24h';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtSecret as string,
      signOptions: { expiresIn: jwtExpiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}