type FetchImpl = typeof fetch;

interface GhlClientOptions {
  token: string;
  companyId: string;
  stripeAccountId?: string;
  fetchImpl?: FetchImpl;
}

interface CreateLocationInput {
  name: string;
  phone: string;
  email: string;
  website: string;
  country: string;
  logoUrl?: string;
  snapshotId: string;
}

interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  locationIds: string[];
}

interface EnableSaasInput {
  locationId: string;
  name: string;
  email: string;
  saasPlanId: string;
  priceId: string;
  isSaaSV2: boolean;
}

interface GhlUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  type?: string;
  role?: string;
  locationIds?: string[];
  permissions?: Record<string, unknown>;
}

interface SearchUsersResponse {
  users?: GhlUser[];
}

export class GhlClient {
  private readonly token: string;
  private readonly companyId: string;
  private readonly stripeAccountId?: string;
  private readonly fetchImpl: FetchImpl;

  constructor({ token, companyId, stripeAccountId, fetchImpl = fetch }: GhlClientOptions) {
    this.token = token;
    this.companyId = companyId;
    this.stripeAccountId = stripeAccountId;
    this.fetchImpl = fetchImpl;
  }

  async createLocation(input: CreateLocationInput) {
    const payload: Record<string, string> = {
      companyId: this.companyId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      website: input.website,
      country: input.country,
      snapshotId: input.snapshotId,
    };

    if (input.logoUrl) {
      payload.logoUrl = input.logoUrl;
    }

    const data = await this.request<{ location?: { id?: string }; id?: string }>(
      "https://services.leadconnectorhq.com/locations/",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      "No se pudo crear la subcuenta en GHL",
    );
    const locationId = data.location?.id ?? data.id;

    if (!locationId) {
      throw new Error("GHL no devolvio un ID de Location valido");
    }

    return locationId;
  }

  async createUser(input: CreateUserInput) {
    await this.request(
      "https://services.leadconnectorhq.com/users/",
      {
        method: "POST",
        body: JSON.stringify({
          companyId: this.companyId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          password: input.password,
          type: "account",
          role: "admin",
          locationIds: input.locationIds,
        }),
      },
      "No se pudo crear el usuario administrador",
    );
  }

  async updateRebilling(locationId: string) {
    await this.request(
      `https://services.leadconnectorhq.com/saas/update-rebilling/${this.companyId}`,
      {
        method: "POST",
        body: JSON.stringify({
          locationIds: [locationId],
          enableRebilling: true,
        }),
      },
      "No se pudo activar la refacturacion en GHL",
      [200, 201],
    );
  }

  async enableSaas(input: EnableSaasInput) {
    if (!this.stripeAccountId) {
      throw new Error("Configuracion de Stripe faltante en el servidor");
    }

    await this.request(
      `https://services.leadconnectorhq.com/saas/enable-saas/${input.locationId}`,
      {
        method: "POST",
        body: JSON.stringify({
          stripeAccountId: this.stripeAccountId,
          name: input.name,
          email: input.email,
          companyId: this.companyId,
          isSaaSV2: input.isSaaSV2,
          providerLocationId: input.locationId,
          saasPlanId: input.saasPlanId,
          priceId: input.priceId,
        }),
      },
      "No se pudo activar SaaS en la subcuenta",
    );
  }

  async findUserByEmail(email: string) {
    const data = await this.request<SearchUsersResponse>(
      `https://services.leadconnectorhq.com/users/search?companyId=${encodeURIComponent(this.companyId)}&query=${encodeURIComponent(email)}&limit=20`,
      { method: "GET" },
      "No se pudo buscar el usuario partner en GHL",
    );
    const normalizedEmail = email.trim().toLowerCase();

    return data.users?.find((user) => user.email?.trim().toLowerCase() === normalizedEmail) ?? null;
  }

  async addAdminLocationToExistingUser(user: GhlUser, locationId: string) {
    const locationIds = Array.from(new Set([...(user.locationIds ?? []), locationId]));

    await this.request(
      `https://services.leadconnectorhq.com/users/${user.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          companyId: this.companyId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          type: "account",
          role: "admin",
          locationIds,
          permissions: user.permissions,
        }),
      },
      "No se pudo agregar el partner como administrador de la subcuenta",
    );
  }

  private async request<T>(
    url: string,
    init: RequestInit,
    errorMessage: string,
    okStatuses?: number[],
  ): Promise<T> {
    const response = await this.fetchImpl(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init.headers,
      },
    });

    const isOk = okStatuses ? okStatuses.includes(response.status) : response.ok;

    if (!isOk) {
      const errorText = await response.text();
      throw new Error(`${errorMessage}: ${errorText || response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const text = await response.text();
    return (text ? JSON.parse(text) : {}) as T;
  }
}
