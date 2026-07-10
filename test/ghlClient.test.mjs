import assert from "node:assert/strict";
import test from "node:test";

import { GhlClient } from "../src/app/api/create-account/ghlClient.ts";

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
    stripeAccountId: "acct_123",
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

test("updateRebilling uses the confirmed v3 endpoint and locationIds payload", async () => {
  const calls = [];
  const client = new GhlClient({
    token: "token",
    companyId: "company_123",
    stripeAccountId: "acct_123",
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), body: JSON.parse(init.body) });
      return jsonResponse({ success: true }, 201);
    },
  });

  await client.updateRebilling("loc_123");

  assert.equal(calls[0].url, "https://services.leadconnectorhq.com/saas/update-rebilling/company_123");
  assert.deepEqual(calls[0].body, { locationIds: ["loc_123"], enableRebilling: true });
});

test("enableSaas sends the selected SaaS plan and price", async () => {
  const calls = [];
  const client = new GhlClient({
    token: "token",
    companyId: "company_123",
    stripeAccountId: "acct_123",
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), body: JSON.parse(init.body) });
      return jsonResponse({ success: true });
    },
  });

  await client.enableSaas({
    locationId: "loc_123",
    name: "Cliente Uno",
    email: "cliente@example.com",
    saasPlanId: "plan_123",
    priceId: "price_123",
    isSaaSV2: false,
  });

  assert.equal(calls[0].url, "https://services.leadconnectorhq.com/saas/enable-saas/loc_123");
  assert.equal(calls[0].body.stripeAccountId, "acct_123");
  assert.equal(calls[0].body.saasPlanId, "plan_123");
  assert.equal(calls[0].body.priceId, "price_123");
});

test("request failures throw instead of being silently ignored", async () => {
  const client = new GhlClient({
    token: "token",
    companyId: "company_123",
    stripeAccountId: "acct_123",
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
