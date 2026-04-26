import { Controller, Get, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { KeycloakService } from './keycloak.service';
import { PrismaService } from './prisma.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly keycloakService: KeycloakService,
    private readonly prisma: PrismaService
  ) {}
  
  @Get('login')
  login(@Req() req: Request, @Res() res: Response) {
    const url = this.keycloakService.getAuthorizationUrl(req.session);
    res.redirect(url);
  }

  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    try {
      const { tokenSet, roles } = await this.keycloakService.handleCallback(req);
      const userinfo: any = await this.keycloakService.getUserInfo(tokenSet.access_token);

      // --- Iteration 3: Auto-registration in local DB ---
      const userId = userinfo.sub;
      const email = userinfo.email;

      if (userId && email) {
        await this.prisma.user.upsert({
          where: { id: userId },
          update: { email: email }, 
          create: {
            id: userId,
            email: email,
            is_active: true
          }
        });
      }

      const dbUser = await this.prisma.user.findUnique({ where: { id: userId } });

      // Guardamos todo en la sesión segura del servidor
      (req.session as any).user = { 
        ...userinfo, 
        roles,
        avatar: dbUser?.avatar 
      };
      (req.session as any).tokens = {
        accessToken: tokenSet.access_token,
        idToken: tokenSet.id_token,
        refreshToken: tokenSet.refresh_token,
        expiresAt: tokenSet.expires_at
      };

      // Limpiamos estados temporales de OIDC
      delete (req.session as any).auth_state;
      delete (req.session as any).auth_nonce;

      // EXPLICIT SAVE before redirect to ensure frontend sees the session
      req.session.save((err) => {
        if (err) {
          this.logger.error('Error saving session', err);
          return res.redirect('http://localhost:4200/login-error');
        }
        res.redirect('http://localhost:4200/dashboard');
      });

    } catch (err) {
      this.logger.error('Error en callback de Keycloak', err);
      res.redirect('http://localhost:4200/login-error');
    }
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const sessionUser = (req.session as any).user;
    if (!sessionUser) {
      return { authenticated: false, user: null };
    }

    // Refresh from DB to get latest avatar/status
    try {
      const dbUser = await this.prisma.user.findUnique({ where: { id: sessionUser.sub } });
      return { 
        authenticated: true, 
        user: {
          ...sessionUser,
          avatar: dbUser?.avatar,
          is_active: dbUser?.is_active
        } 
      };
    } catch (e) {
      return { authenticated: true, user: sessionUser };
    }
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    const idToken = (req.session as any).tokens?.idToken;
    const logoutUrl = this.keycloakService.getLogoutUrl(idToken);

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      if (logoutUrl) {
        res.redirect(logoutUrl);
      } else {
        res.redirect('http://localhost:4200/');
      }
    });
  }
}
