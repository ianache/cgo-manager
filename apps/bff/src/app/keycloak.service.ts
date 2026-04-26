import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Issuer, Client, generators } from 'openid-client';
import axios from 'axios';

@Injectable()
export class KeycloakService implements OnModuleInit {
  private readonly logger = new Logger(KeycloakService.name);
  private client: Client;
  private readonly issuerUrl = 'https://oauth2.qa.comsatel.com.pe/realms/Apps';
  private readonly adminBaseUrl = 'https://oauth2.qa.comsatel.com.pe/admin/realms/Apps';
  private readonly clientId = 'cgobackoffice';
  private readonly clientSecret = process.env['KEYCLOAK_CLIENT_SECRET'] || 'PONER_AQUI_TU_CLIENT_SECRET';
  private readonly redirectUri = 'http://localhost:3000/api/auth/callback';
  private readonly logoutRedirectUri = 'http://localhost:4200/';

  private adminAccessToken: string | null = null;
  private tokenExpiresAt = 0;

  async onModuleInit() {
    const keycloakIssuer = await Issuer.discover(this.issuerUrl);
    
    const clientMetadata: any = {
      client_id: this.clientId,
      redirect_uris: [this.redirectUri],
      response_types: ['code'],
    };

    if (this.clientSecret && this.clientSecret !== 'PONER_AQUI_TU_CLIENT_SECRET') {
      clientMetadata.client_secret = this.clientSecret;
      clientMetadata.token_endpoint_auth_method = 'client_secret_post';
    } else {
      clientMetadata.token_endpoint_auth_method = 'none';
    }

    this.client = new keycloakIssuer.Client(clientMetadata);
  }

  private decodeToken(token: string) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return {};
      return JSON.parse(Buffer.from(parts[1], 'base64').toString());
    } catch {
      return {};
    }
  }

  // --- Auth Flow ---

  getAuthorizationUrl(session: any) {
    const state = generators.state();
    const nonce = generators.nonce();
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
    const tokenSet = await this.client.callback(this.redirectUri, params, {
      state: req.session.auth_state,
      nonce: req.session.auth_nonce,
    });

    const payload = this.decodeToken(tokenSet.access_token);
    
    const realmRoles = payload.realm_access?.roles || [];
    const clientRoles = payload.resource_access?.[this.clientId]?.roles || [];
    const allRoles = [...new Set([...realmRoles, ...clientRoles])];

    return { tokenSet, roles: allRoles };
  }

  async getUserInfo(accessToken: string) {
    return await this.client.userinfo(accessToken);
  }

  getLogoutUrl(idToken: string) {
    return this.client.endSessionUrl({
      id_token_hint: idToken,
      post_logout_redirect_uri: this.logoutRedirectUri,
    });
  }

  // --- Admin API Helpers ---

  private async getAdminToken() {
    if (this.adminAccessToken && Date.now() < this.tokenExpiresAt) {
      return this.adminAccessToken;
    }

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);

      const response = await axios.post(`${this.issuerUrl}/protocol/openid-connect/token`, params);
      this.adminAccessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in - 30) * 1000;
      return this.adminAccessToken;
    } catch (error) {
      this.logger.error('Failed to obtain Keycloak Admin Token', error);
      throw error;
    }
  }

  private async adminRequest(method: string, path: string, data?: any) {
    try {
      const token = await this.getAdminToken();
      const url = path.startsWith('http') ? path : `${this.adminBaseUrl}${path}`;
      const response = await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      this.logger.error(`Keycloak Admin Request Failed [${method} ${path}]: Status ${status}`, errorData);
      throw error;
    }
  }

  private providersCache: any[] | null = null;

  async getProviders() {
    if (this.providersCache) return this.providersCache;
    try {
      this.providersCache = await this.adminRequest('GET', '/components?type=org.keycloak.storage.UserStorageProvider');
      return this.providersCache;
    } catch (error) {
      return [];
    }
  }

  private enrichUser(user: any, providers: any[]) {
    const federationName = user.federationLink 
      ? providers.find(p => p.id === user.federationLink)?.name || 'Unknown Federation'
      : null;

    return {
      ...user,
      isFederated: !!user.federationLink,
      federationName,
      locale: user.attributes?.['locale']?.[0] || null,
      distributor: user.attributes?.['distributor']?.[0] || null,
      codigoPais: user.attributes?.['codigoPais']?.[0] || null
    };
  }

  // --- User Management ---

  async getUsers(search?: string) {
    const path = search ? `/users?search=${encodeURIComponent(search)}` : '/users';
    const users = await this.adminRequest('GET', path);
    const providers = await this.getProviders();
    return users.map((u: any) => this.enrichUser(u, providers));
  }

  async createUser(data: any) {
    await this.adminRequest('POST', '/users', {
      username: data.email,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      enabled: data.enabled ?? true,
      emailVerified: true,
      attributes: {
        locale: [data.locale || 'es'],
        distributor: [data.distributor || ''],
        codigoPais: [data.codigoPais || '']
      }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = await this.getUsers(data.email);
    const newUser = users.find((u: any) => u.email === data.email);

    if (newUser && data.roles && data.roles.length > 0) {
      await this.updateUserRoles(newUser.id, data.roles);
    }

    return newUser;
  }

  async getUserById(userId: string) {
    const user = await this.adminRequest('GET', `/users/${userId}`);
    const roles = await this.getUserRoles(userId);
    const providers = await this.getProviders();
    return { ...this.enrichUser(user, providers), roles };
  }

  async updateUser(userId: string, data: any) {
    const currentUser = await this.adminRequest('GET', `/users/${userId}`);
    
    const updatedUser = {
      ...currentUser,
      firstName: data.firstName ?? currentUser.firstName,
      lastName: data.lastName ?? currentUser.lastName,
      enabled: data.enabled ?? currentUser.enabled,
      email: data.email ?? currentUser.email,
      attributes: {
        ...(currentUser.attributes || {}),
        locale: data.locale ? [data.locale] : currentUser.attributes?.['locale'],
        distributor: data.distributor ? [data.distributor] : currentUser.attributes?.['distributor'],
        codigoPais: data.codigoPais ? [data.codigoPais] : currentUser.attributes?.['codigoPais']
      }
    };

    try {
      await this.adminRequest('PUT', `/users/${userId}`, updatedUser);
    } catch (error: any) {
      if (error.response?.status === 400 && JSON.stringify(error.response?.data).includes('read-only')) {
        this.logger.warn(`User ${userId} has read-only attributes. Re-trying only with manageable fields.`);
        await this.adminRequest('PUT', `/users/${userId}`, {
          ...currentUser,
          enabled: data.enabled ?? currentUser.enabled,
          attributes: {
            ...(currentUser.attributes || {}),
            locale: data.locale ? [data.locale] : currentUser.attributes?.['locale']
          }
        });
      } else {
        throw error;
      }
    }

    if (data.roles) {
      await this.updateUserRoles(userId, data.roles);
    }
    return this.getUserById(userId);
  }

  async updateUserPassword(userId: string, password: string) {
    return this.adminRequest('PUT', `/users/${userId}/reset-password`, {
      type: 'password',
      value: password,
      temporary: false
    });
  }

  // --- Role Management ---

  async getAvailableRoles() {
    const realmRoles = await this.adminRequest('GET', '/roles');
    const clients = await this.adminRequest('GET', '/clients');
    const backofficeClient = clients.find((c: any) => c.clientId === this.clientId);
    
    let clientRoles: any[] = [];
    if (backofficeClient) {
      clientRoles = await this.adminRequest('GET', `/clients/${backofficeClient.id}/roles`);
    }

    return [
      ...realmRoles.map((r: any) => ({ ...r, level: 'realm' })),
      ...clientRoles.map((r: any) => ({ ...r, level: 'client', clientId: this.clientId }))
    ].filter(r => !r.name.startsWith('default-roles') && r.name !== 'offline_access' && r.name !== 'uma_authorization');
  }

  async createRole(data: { name: string; description?: string; level: 'realm' | 'client' }) {
    const roleRepresentation = {
      name: data.name,
      description: data.description || '',
    };

    try {
      if (data.level === 'realm') {
        await this.adminRequest('POST', '/roles', roleRepresentation);
      } else {
        const clients = await this.adminRequest('GET', '/clients');
        const backofficeClient = clients.find((c: any) => c.clientId === this.clientId);
        if (!backofficeClient) throw new Error('Client not found');
        
        await this.adminRequest('POST', `/clients/${backofficeClient.id}/roles`, roleRepresentation);
      }
      return { success: true };
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error(`Conflict: Role "${data.name}" already exists.`);
      }
      throw error;
    }
  }

  async getUserRoles(userId: string) {
    const realmMappings = await this.adminRequest('GET', `/users/${userId}/role-mappings/realm`);
    const clients = await this.adminRequest('GET', '/clients');
    const backofficeClient = clients.find((c: any) => c.clientId === this.clientId);
    
    let clientMappings: any[] = [];
    if (backofficeClient) {
      clientMappings = await this.adminRequest('GET', `/users/${userId}/role-mappings/clients/${backofficeClient.id}`);
    }

    return [
      ...realmMappings.map((r: any) => ({ ...r, level: 'realm' })),
      ...clientMappings.map((r: any) => ({ ...r, level: 'client', clientId: this.clientId }))
    ];
  }

  private sanitizeRole(role: any) {
    const { level, clientId, ...cleanRole } = role;
    return cleanRole;
  }

  async updateUserRoles(userId: string, roleNames: string[]) {
    const currentRoles = await this.getUserRoles(userId);
    const realmRolesToDelete = currentRoles
      .filter(r => r.level === 'realm' && !roleNames.includes(r.name))
      .map(r => this.sanitizeRole(r));
    const clientRolesToDelete = currentRoles
      .filter(r => r.level === 'client' && !roleNames.includes(r.name))
      .map(r => this.sanitizeRole(r));

    if (realmRolesToDelete.length > 0) {
      await this.adminRequest('DELETE', `/users/${userId}/role-mappings/realm`, realmRolesToDelete);
    }
    if (clientRolesToDelete.length > 0) {
      const clients = await this.adminRequest('GET', '/clients');
      const backofficeClient = clients.find((c: any) => c.clientId === this.clientId);
      if (backofficeClient) {
        await this.adminRequest('DELETE', `/users/${userId}/role-mappings/clients/${backofficeClient.id}`, clientRolesToDelete);
      }
    }

    const available = await this.getAvailableRoles();
    const rolesToAssign = available.filter(r => roleNames.includes(r.name));
    
    const realmRolesToAdd = rolesToAssign
      .filter(r => r.level === 'realm')
      .map(r => this.sanitizeRole(r));
    const clientRolesToAdd = rolesToAssign
      .filter(r => r.level === 'client')
      .map(r => this.sanitizeRole(r));

    if (realmRolesToAdd.length > 0) {
      await this.adminRequest('POST', `/users/${userId}/role-mappings/realm`, realmRolesToAdd);
    }

    if (clientRolesToAdd.length > 0) {
      const clients = await this.adminRequest('GET', '/clients');
      const backofficeClient = clients.find((c: any) => c.clientId === this.clientId);
      if (backofficeClient) {
        await this.adminRequest('POST', `/users/${userId}/role-mappings/clients/${backofficeClient.id}`, clientRolesToAdd);
      }
    }
  }
}
