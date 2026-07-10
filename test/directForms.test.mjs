import assert from "node:assert/strict";
import test from "node:test";

import {
  DIRECT_FORM_CONFIGS,
  getDirectFormConfig,
  getSaasPriceIdForBillingInterval,
  validatePasswordPolicy,
} from "../src/app/api/create-account/directForms.ts";

test("direct form configs expose the three public form URLs", () => {
  assert.deepEqual(
    DIRECT_FORM_CONFIGS.map((config) => config.slug),
    ["psicologos", "impulso-digital-anual", "partner-multimarca"],
  );
});

test("psicologos form applies snapshot and rebilling without SaaS", () => {
  const config = getDirectFormConfig("psicologos");

  assert.equal(config?.snapshotId, "n4dhRqPryCmPDkmg85yo");
  assert.equal(config?.saasPlanId, null);
  assert.equal(config?.requiresBillingInterval, false);
  assert.equal(config?.requiresPartnerEmail, false);
});

test("impulso digital annual resolves monthly and annual SaaS prices", () => {
  const config = getDirectFormConfig("impulso-digital-anual");

  assert.equal(config?.saasPlanId, "6a4e7581e52f5816d8e1feb5");
  assert.equal(getSaasPriceIdForBillingInterval(config, "month"), "price_1TqxzRIGRrEnkipJMZ2ZiKRO");
  assert.equal(getSaasPriceIdForBillingInterval(config, "year"), "price_1TqxzRIGRrEnkipJHddz6lMd");
});

test("partner multimarca requires partner email and resolves SaaS prices", () => {
  const config = getDirectFormConfig("partner-multimarca");

  assert.equal(config?.requiresPartnerEmail, true);
  assert.equal(config?.saasPlanId, "6a39774f492b1bc3ff96410e");
  assert.equal(getSaasPriceIdForBillingInterval(config, "month"), "price_1TlC5DIGRrEnkipJNsQE6h1M");
  assert.equal(getSaasPriceIdForBillingInterval(config, "year"), "price_1TlC6DIGRrEnkipJDgY6yaE9");
});

test("SaaS forms reject missing billing interval", () => {
  const config = getDirectFormConfig("impulso-digital-anual");

  assert.throws(() => getSaasPriceIdForBillingInterval(config, ""), /Selecciona si el cobro sera mensual o anual/);
});

test("validatePasswordPolicy requires 10 chars with upper, lower, number and special", () => {
  assert.equal(validatePasswordPolicy("Abcdefgh1*"), null);
  assert.equal(validatePasswordPolicy("Abc1*"), "La contrasena debe tener minimo 10 caracteres");
  assert.equal(validatePasswordPolicy("abcdefgh1*"), "La contrasena debe incluir al menos una mayuscula");
  assert.equal(validatePasswordPolicy("ABCDEFGH1*"), "La contrasena debe incluir al menos una minuscula");
  assert.equal(validatePasswordPolicy("Abcdefghij*"), "La contrasena debe incluir al menos un numero");
  assert.equal(validatePasswordPolicy("Abcdefghi1"), "La contrasena debe incluir al menos un caracter especial");
});
