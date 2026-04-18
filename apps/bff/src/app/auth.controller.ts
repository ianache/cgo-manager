import { Controller, Get, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { KeycloakService } from './keycloak.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly keycloakService: KeycloakService) {}
  
  @Get('login')
  login(@Req() req: Request, @Res() res: Response) {
    const url = this.keycloakService.getAuthorizationUrl(req.session);
    res.redirect(url);
  }

  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    try {
      const tokenSet = await this.keycloakService.handleCallback(req);
      const userinfo = await this.keycloakService.getUserInfo(tokenSet.access_token);

      // Guardamos todo en la sesión segura del servidor
      (req.session as any).user = userinfo;
      (req.session as any).tokens = {
        accessToken: tokenSet.access_token,
        idToken: tokenSet.id_token,
        refreshToken: tokenSet.refresh_token,
        expiresAt: tokenSet.expires_at
      };

      // Limpiamos estados temporales de OIDC
      delete (req.session as any).auth_state;
      delete (req.session as any).auth_nonce;

      res.redirect('http://localhost:4200/dashboard');
    } catch (err) {
      this.logger.error('Error en callback de Keycloak', err);
      res.redirect('http://localhost:4200/login-error');
    }
  }

  @Get('me')
  getMe(@Req() req: Request) {
    const user = (req.session as any).user;
    return { 
      authenticated: !!user, 
      user: user || null 
    };
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.send({ success: true });
    });
  }
}
