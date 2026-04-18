import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth.controller';
import { KeycloakService } from './keycloak.service';

@Module({
  imports: [],
  controllers: [AppController, AuthController],
  providers: [AppService, KeycloakService],
})
export class AppModule {}
