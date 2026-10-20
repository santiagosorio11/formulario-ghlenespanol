import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_ADMIN_PERMISSIONS,
  DEFAULT_ADMIN_SCOPES,
  GhlClient,
} from "../src/app/api/create-account/ghlClient.ts";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("createLocation sends snapshotId with the sub-account payload", async () => {
  const calls = [];
  const client = new GhlClient({
    token: "token",
    companyId: "company_123",
    requestSpacingMs: 0,
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), body: JSON.parse(init.body) });
      return jsonResponse({ location: { id: "loc_123" } });
    },
  });

  const locationId = await client.createLocation({
    name: "Cuenta",
    phone: "+573001112233",
    email: "cliente@example.com",
    website: "https://example.com",
    country: "CO",
    logoUrl: "https://cdn.example.com/logo.png",
    snapshotId: "snapshot_123",
  });

  assert.equal(locationId, "loc_123");
  assert.equal(calls[0].url, "https://services.leadconnectorhq.com/locations/");
  assert.equal(calls[0].body.snapshotId, "snapshot_123");
});

test("request failures throw instead of being silently ignored", async () => {
  const client = new GhlClient({
    token: "token",
    companyId: "company_123",
    requestSpacingMs: 0,
    fetchImpl: async () => new Response("bad request", { status: 400 }),
  });

  await assert.rejects(
    () =>
      client.createUser({
        firstName: "Cliente",
        lastName: "Uno",
        email: "cliente@example.com",
        phone: "+573001112233",
        password: "Password123*",
        locationIds: ["loc_123"],
      }),
    /No se pudo crear el usuario administrador/,
  );
});

test("request retries when GHL returns rate limit", async () => {
  const calls = [];
  const client = new GhlClient({
    token: "token",
    companyId: "company_123",
    requestSpacingMs: 0,
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), body: JSON.parse(init.body) });

      if (calls.length === 1) {
        return new Response(JSON.stringify({ statusCode: 429, message: "Too Many Requests !" }), {
          status: 429,
          headers: { "Retry-After": "0" },
        });
      }

      return jsonResponse({ success: true }, 201);
    },
  });

  await client.createUser({
    firstName: "Cliente",
    lastName: "Uno",
    email: "cliente@example.com",
    phone: "+573001112233",
    password: "Password123*",
    locationIds: ["loc_123"],
  });

  assert.equal(calls.length, 2);
});

test("createUser sends admin payment permissions", async () => {
  const calls = [];
  const client = new GhlClient({
    token: "token",
    companyId: "company_123",
    requestSpacingMs: 0,
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), body: JSON.parse(init.body) });
      return jsonResponse({ id: "user_123" }, 201);
    },
  });

  await client.createUser({
    firstName: "Cliente",
    lastName: "Uno",
    email: "cliente@example.com",
    phone: "+573001112233",
    password: "Password123*",
    locationIds: ["loc_123"],
  });

  assert.equal(calls[0].url, "https://services.leadconnectorhq.com/users/");
  assert.deepEqual(calls[0].body.permissions, DEFAULT_ADMIN_PERMISSIONS);
  assert.equal(calls[0].body.permissions.paymentsEnabled, true);
  assert.equal(calls[0].body.permissions.recordPaymentEnabled, true);
  assert.equal(calls[0].body.permissions.settingsEnabled, true);
  assert.deepEqual(calls[0].body.permissions.scopes, DEFAULT_ADMIN_SCOPES);
  assert.ok(calls[0].body.permissions.scopes.includes("payments/settings.write"));
  assert.ok(calls[0].body.permissions.scopes.includes("payments/subscriptions.sharePaymentMethod"));
  assert.ok(calls[0].body.permissions.scopes.includes("locations.billing.manage"));
});

test("upsertAdminUser attaches an existing user when GHL rejects duplicate email", async () => {
  const calls = [];
  const client = new GhlClient({
    token: "token",
    companyId: "company_123",
    requestSpacingMs: 0,
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), method: init.method, body: init.body ? JSON.parse(init.body) : null });

      if (String(url) === "https://services.leadconnectorhq.com/users/") {
        return new Response(JSON.stringify({ message: "A user with this email already exists." }), { status: 400 });
      }

      if (String(url).startsWith("https://services.leadconnectorhq.com/users/search")) {
        return jsonResponse({
          users: [
            {
              id: "user_123",
              email: "cliente@example.com",
              firstName: "Cliente",
              lastName: "Uno",
              locationIds: ["loc_old"],
              permissions: {
                contactsEnabled: true,
                paymentsEnabled: false,
              },
            },
          ],
        });
      }

      return jsonResponse({ success: true });
    },
  });

  await client.upsertAdminUser({
    firstName: "Cliente",
    lastName: "Uno",
    email: "cliente@example.com",
    phone: "+573001112233",
    password: "Password123*",
    locationIds: ["loc_new"],
  });

  const updateCall = calls.find((call) => call.url === "https://services.leadconnectorhq.com/users/user_123");
  assert.equal(updateCall.method, "PUT");
  assert.deepEqual(updateCall.body.locationIds, ["loc_old", "loc_new"]);
  assert.equal(updateCall.body.role, "admin");
  assert.equal(updateCall.body.permissions.contactsEnabled, true);
  assert.equal(updateCall.body.permissions.paymentsEnabled, true);
  assert.equal(updateCall.body.permissions.recordPaymentEnabled, true);
  assert.equal(updateCall.body.permissions.settingsEnabled, true);
  assert.deepEqual(updateCall.body.permissions.scopes, DEFAULT_ADMIN_SCOPES);
});
