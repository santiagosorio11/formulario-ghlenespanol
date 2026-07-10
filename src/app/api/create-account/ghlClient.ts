type FetchImpl = typeof fetch;
const RATE_LIMIT_RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 16000];
const DEFAULT_REQUEST_SPACING_MS = 350;

export const REBILLING_PRODUCTS = [
  "contentAI",
  "workflow_premium_actions",
  "workflow_ai",
  "conversationAI",
  "EmailNotification",
  "whatsApp",
  "reviewsAI",
  "funnelAI",
  "domainPurchase",
  "Phone",
  "Email",
] as const;

export const DEFAULT_ADMIN_SCOPES = [
  "campaigns.readonly",
  "campaigns.write",
  "calendars.readonly",
  "calendars/events.write",
  "calendars/groups.write",
  "calendars.write",
  "contacts.write",
  "contacts/bulkActions.write",
  "workflows.readonly",
  "workflows.write",
  "triggers.write",
  "funnels.write",
  "forms.write",
  "surveys.write",
  "quizzes.write",
  "websites.write",
  "medias.write",
  "medias.readonly",
  "opportunities.write",
  "opportunities/leadValue.readonly",
  "opportunities/bulkActions.write",
  "pipelines.create",
  "reporting/phone.readonly",
  "reporting/adwords.readonly",
  "reporting/facebookAds.readonly",
  "reporting/attributions.readonly",
  "prospecting/auditReport.write",
  "reporting/reports.readonly",
  "reporting/agent.readonly",
  "reporting/reports.write",
  "reporting/stats.export",
  "payments.write",
  "payments/records.write",
  "payments/orders.readonly",
  "payments/orders.export",
  "payments/orders.import",
  "payments/orders.collectPayment",
  "payments/subscriptions.readonly",
  "payments/subscriptions.write",
  "payments/subscriptions.update",
  "payments/subscriptions.export",
  "payments/subscriptions.pauseResumeCancel",
  "payments/subscriptions.sharePaymentMethod",
  "payments/transactions.readonly",
  "payments/transactions.export",
  "payments/transactions.import",
  "payments/transactions.refund",
  "payments/transactions.viewReceipts",
  "payments/taxesSettings.readonly",
  "payments/settings.readonly",
  "payments/taxesSettings.updateInclusiveExclusive",
  "payments/taxesSettings.manageRates",
  "payments/taxesSettings.configureAutomatic",
  "products.readonly",
  "products.write",
  "products.delete",
  "products.duplicate",
  "products.bulkActions",
  "payments/settings.write",
  "payments/settings.configureReceipt",
  "payments/settings.configureSubscription",
  "invoices.write",
  "invoices.readonly",
  "invoices/schedule.readonly",
  "invoices/schedule.write",
  "invoices/template.readonly",
  "invoices/template.write",
  "reputation/review.write",
  "reputation/listing.write",
  "reputation/reviewsAIAgents.write",
  "reputation/gbp.write",
  "conversations.write",
  "conversations.readonly",
  "conversations/message.readonly",
  "conversations/message.write",
  "contentAI.write",
  "ai-studio.readonly",
  "ai-studio.write",
  "dashboard/stats.readonly",
  "locations/tags.write",
  "locations/tags.readonly",
  "marketing.write",
  "eliza.write",
  "settings.write",
  "socialplanner/post.write",
  "socialplanner/account.readonly",
  "socialplanner/account.write",
  "socialplanner/category.readonly",
  "socialplanner/category.write",
  "socialplanner/csv.readonly",
  "socialplanner/csv.write",
  "socialplanner/group.write",
  "socialplanner/hashtag.readonly",
  "socialplanner/hashtag.write",
  "socialplanner/oauth.readonly",
  "socialplanner/oauth.write",
  "socialplanner/post.readonly",
  "socialplanner/recurring.readonly",
  "socialplanner/recurring.write",
  "socialplanner/review.readonly",
  "socialplanner/review.write",
  "socialplanner/rss.readonly",
  "socialplanner/rss.write",
  "socialplanner/search.readonly",
  "socialplanner/setting.readonly",
  "socialplanner/setting.write",
  "socialplanner/stat.readonly",
  "socialplanner/tag.readonly",
  "socialplanner/tag.write",
  "socialplanner/filters.readonly",
  "socialplanner/medias.readonly",
  "socialplanner/medias.write",
  "socialplanner/watermarks.readonly",
  "socialplanner/watermarks.write",
  "socialplanner/metatag.readonly",
  "socialplanner/facebook.readonly",
  "socialplanner/linkedin.readonly",
  "socialplanner/twitter.readonly",
  "socialplanner/notification.readonly",
  "socialplanner/notification.write",
  "socialplanner/snapshot.readonly",
  "socialplanner/snapshot.write",
  "marketing/affiliate.write",
  "blogs.write",
  "membership.write",
  "communities.write",
  "gokollab.write",
  "certificates.write",
  "certificates.readonly",
  "adPublishing.write",
  "adPublishing.readonly",
  "prospecting.write",
  "prospecting.readonly",
  "prospecting/reports.readonly",
  "private-integration-location.readonly",
  "private-integration-location.write",
  "private-integration-company.readonly",
  "private-integration-company.write",
  "native-integrations.readonly",
  "native-integrations.write",
  "wordpress.write",
  "wordpress.read",
  "custom-menu-link.write",
  "qrcodes.write",
  "users/team-management.write",
  "users/team-management.readonly",
  "loginas.write",
  "users-sso-login-management.write",
  "users-sso-login-management.readonly",
  "sso-config.write",
  "snapshots/api.readonly",
  "snapshots/api.create",
  "snapshots/api.edit",
  "snapshots/api.push",
  "snapshots/api.refresh",
  "snapshots/api.share",
  "snapshots/api.delete",
  "internaltools.location-transfer.write",
  "internaltools.location-transfer.readonly",
  "affiliateportal.write",
  "affiliateportal.readonly",
  "companies.write",
  "internaltools.billing.write",
  "internaltools.billing.readonly",
  "internaltools.billing-common.readonly",
  "internaltools.billing-common.write",
  "voice-ai-agents.write",
  "voice-ai-agents.readonly",
  "voice-ai-common.readonly",
  "voice-ai-common.write",
  "voice-ai-agent-goals.readonly",
  "voice-ai-agent-goals.write",
  "voice-ai-dashboard.readonly",
  "agency/launchpad.write",
  "agency/launchpad.readonly",
  "launchpad/location.write",
  "launchpad/location.readonly",
  "text-ai-agents.write",
  "text-ai-agent-goals.readonly",
  "text-ai-agent-goals.write",
  "text-ai-agent-training.write",
  "text-ai-agents-dashboard.readonly",
  "locations.create",
  "locations.delete",
  "askai.write",
  "copilot.readonly",
  "locations.export.list",
  "locations.features-limits.manage",
  "locations.pause-resume",
  "locations.agency-subaccounts.manage",
  "locations.billing.manage",
  "locations.details.manage",
  "audit-logs.readonly",
  "audit-logs.export",
] as const;

export const DEFAULT_ADMIN_PERMISSIONS = {
  adPublishingEnabled: true,
  adPublishingReadOnly: true,
  adwordsReportingEnabled: true,
  affiliateManagerEnabled: true,
  agentReportingEnabled: true,
  appointmentsEnabled: true,
  assignedDataOnly: false,
  attributionsReportingEnabled: true,
  bloggingEnabled: true,
  botService: true,
  bulkRequestsEnabled: true,
  campaignsEnabled: true,
  campaignsReadOnly: false,
  cancelSubscriptionEnabled: true,
  certificatesEnabled: true,
  communitiesEnabled: true,
  contactsEnabled: true,
  contentAiEnabled: true,
  conversationsEnabled: true,
  customMenuLinkReadOnly: true,
  customMenuLinkWrite: true,
  dashboardStatsEnabled: true,
  exportPaymentsEnabled: true,
  facebookAdsReportingEnabled: true,
  funnelsEnabled: true,
  gokollabEnabled: true,
  invoiceEnabled: true,
  leadValueEnabled: true,
  marketingEnabled: true,
  mediaStorageEnabled: true,
  membershipEnabled: true,
  onlineListingsEnabled: true,
  opportunitiesBulkActionsEnabled: true,
  opportunitiesEnabled: true,
  paymentsEnabled: true,
  phoneCallEnabled: true,
  recordPaymentEnabled: true,
  refundsEnabled: true,
  reportingEnabled: true,
  reviewsEnabled: true,
  settingsEnabled: true,
  socialPlanner: true,
  tagsEnabled: true,
  triggersEnabled: true,
  websitesEnabled: true,
  wordpressEnabled: true,
  workflowsEnabled: true,
  workflowsReadOnly: false,
  scopes: DEFAULT_ADMIN_SCOPES,
} as const;

function getAdminPermissions(existingPermissions?: Record<string, unknown>) {
  return {
    ...existingPermissions,
    ...DEFAULT_ADMIN_PERMISSIONS,
  };
}

interface GhlClientOptions {
  token: string;
  companyId: string;
  stripeAccountId?: string;
  fetchImpl?: FetchImpl;
  requestSpacingMs?: number;
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
  private readonly requestSpacingMs: number;

  constructor({
    token,
    companyId,
    stripeAccountId,
    fetchImpl = fetch,
    requestSpacingMs = DEFAULT_REQUEST_SPACING_MS,
  }: GhlClientOptions) {
    this.token = token;
    this.companyId = companyId;
    this.stripeAccountId = stripeAccountId;
    this.fetchImpl = fetchImpl;
    this.requestSpacingMs = Math.max(0, requestSpacingMs);
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
          permissions: getAdminPermissions(),
        }),
      },
      "No se pudo crear el usuario administrador",
    );
  }

  async upsertAdminUser(input: CreateUserInput) {
    try {
      await this.createUser(input);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      if (!message.includes("A user with this email already exists")) {
        throw error;
      }
    }

    const existingUser = await this.findUserByEmail(input.email);

    if (!existingUser) {
      throw new Error("El usuario ya existe en GHL, pero no se pudo encontrar para asignarlo a la nueva subcuenta");
    }

    await this.addAdminLocationToExistingUser(
      {
        ...existingUser,
        firstName: existingUser.firstName ?? input.firstName,
        lastName: existingUser.lastName ?? input.lastName,
        phone: existingUser.phone ?? input.phone,
      },
      input.locationIds[0],
    );
  }

  async updateRebilling(locationId: string) {
    for (const product of REBILLING_PRODUCTS) {
      await this.request(
        `https://services.leadconnectorhq.com/saas/update-rebilling/${this.companyId}`,
        {
          method: "POST",
          body: JSON.stringify({
            locationIds: [locationId],
            product,
            config: {
              optIn: true,
              enabled: true,
              markup: 0,
            },
          }),
        },
        `No se pudo activar la refacturacion de ${product} en GHL`,
        [200, 201],
      );
    }
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

    // small delay to reduce chance of hitting per-second rate limits for this critical update
    await sleep(1000);

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
          permissions: getAdminPermissions(user.permissions),
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
    let response: Response;

    for (let attempt = 0; ; attempt += 1) {
      response = await this.fetchImpl(url, {
        ...init,
        headers: {
          Authorization: `Bearer ${this.token}`,
          Version: "2021-07-28",
          "Content-Type": "application/json",
          Accept: "application/json",
          ...init.headers,
        },
      });

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        console.warn(`GHL 429 on ${url} (attempt ${attempt}) retry-after=${retryAfter}`);

        if (attempt < RATE_LIMIT_RETRY_DELAYS_MS.length) {
          await sleep(getRetryDelayMs(response, attempt));
          continue;
        }
      }

      // Break for any non-429 response or when retries exhausted
      break;
    }

    const isOk = okStatuses ? okStatuses.includes(response.status) : response.ok;

    if (!isOk) {
      const errorText = await response.text();
      throw new Error(`${errorMessage}: ${errorText || response.status}`);
    }

    if (response.status === 204) {
      await this.waitBetweenRequests();
      return {} as T;
    }

    const text = await response.text();
    const data = (text ? JSON.parse(text) : {}) as T;
    await this.waitBetweenRequests();
    return data;
  }

  private async waitBetweenRequests() {
    if (this.requestSpacingMs <= 0) {
      return;
    }

    await sleep(this.requestSpacingMs);
  }
}

function getRetryDelayMs(response: Response, attempt: number) {
  const retryAfter = response.headers.get("retry-after");
  const retryAfterSeconds = retryAfter ? Number(retryAfter) : Number.NaN;

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    // add small jitter to avoid thundering herd
    const base = retryAfterSeconds * 1000;
    const jitter = Math.floor(Math.random() * 500) - 250; // +/-250ms
    return Math.max(0, base + jitter);
  }

  const base = RATE_LIMIT_RETRY_DELAYS_MS[Math.min(attempt, RATE_LIMIT_RETRY_DELAYS_MS.length - 1)];
  const jitter = Math.floor(Math.random() * 500) - 250; // +/-250ms
  return Math.max(0, base + jitter);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
