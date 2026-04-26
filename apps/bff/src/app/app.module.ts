import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth.controller';
import { KeycloakService } from './keycloak.service';
import { PrismaService } from './prisma.service';
import { LanguagesService } from './languages.service';
import { SecurityMgmtService } from './security-mgmt.service';
import { LanguagesController } from './languages.controller';
import { SecurityMgmtController } from './security-mgmt.controller';

@Module({
  imports: [],
  controllers: [
    AppController, 
    AuthController, 
    LanguagesController, 
    SecurityMgmtController
  ],
  providers: [
    AppService, 
    KeycloakService, 
    PrismaService, 
    LanguagesService, 
    SecurityMgmtService
  ],
})
export class AppModule {}
