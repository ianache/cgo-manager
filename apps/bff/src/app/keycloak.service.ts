import { Injectable, OnModuleInit } from '@nestjs/common';
import { Issuer, Client, generators } from 'openid-client';

@Injectable()
export class KeycloakService implements OnModuleInit {
  private client: Client;
  private readonly issuerUrl = 'https://oauth2.qa.comsatel.com.pe/realms/Apps';
  private readonly clientId = 'cgobackoffice';
  private readonly clientSecret = 'PONER_AQUI_TU_CLIENT_SECRET'; // En producción usar variables de entorno
  private readonly redirectUri = 'http://localhost:3000/api/auth/callback';

  async onModuleInit() {
    const keycloakIssuer = await Issuer.discover(this.issuerUrl);
    
    const clientMetadata: any = {
      client_id: this.clientId,
      redirect_uris: [this.redirectUri],
      response_types: ['code'],
    };

    // Si tenemos un secreto real, lo usamos. 
    // Si no, marcamos el cliente como público para que no pida secreto en el intercambio de tokens.
    if (this.clientSecret && this.clientSecret !== 'PONER_AQUI_TU_CLIENT_SECRET') {
      clientMetadata.client_secret = this.clientSecret;
    } else {
      clientMetadata.token_endpoint_auth_method = 'none';
    }

    this.client = new keycloakIssuer.Client(clientMetadata);
  }

  getAuthorizationUrl(session: any) {
    const state = generators.state();
    const nonce = generators.nonce();
    
    // Guardamos en la sesión del servidor para validar en el callback
    session.auth_state = state;
    session.auth_nonce = nonce;

    return this.client.authorizationUrl({
      scope: 'openid profile email',
      state,
      nonce,
    });
  }

  async handleCallback(req: any) {
    const params = this.client.callbackParams(req);
    const tokenSet = await this.client.callback(
      this.redirectUri,
      params,
      {
        state: req.session.auth_state,
        nonce: req.session.auth_nonce,
      }
    );

    return tokenSet;
  }

  async getUserInfo(accessToken: string) {
    return await this.client.userinfo(accessToken);
  }
}
