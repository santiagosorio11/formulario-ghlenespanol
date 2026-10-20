import assert from "node:assert/strict";
import test from "node:test";

import {
  DIRECT_FORM_CONFIGS,
  getDirectFormConfig,
  validatePasswordPolicy,
} from "../src/app/api/create-account/directForms.ts";

const EXPECTED_SLUGS = [
  "cuenta-anual-partners-ghl",
  "cuenta-multimarca-anual-ghl",
  "cuenta-partner-ghl-lifetime",
  "cuenta-ghl-premium-clientes",
];

test("direct form configs expose the four Bold redirect destinations", () => {
  assert.deepEqual(
    DIRECT_FORM_CONFIGS.map((config) => config.slug),
    EXPECTED_SLUGS,
  );
  assert.ok(DIRECT_FORM_CONFIGS.every((config) => config.snapshotId === "XYvYKvT2RqitSJFAseuS"));
});

test("the previous form URLs are no longer valid", () => {
  assert.equal(getDirectFormConfig("psicologos"), null);
  assert.equal(getDirectFormConfig("impulso-digital-anual"), null);
  assert.equal(getDirectFormConfig("partner-multimarca"), null);
});

test("annual partners form creates the primary administrator", () => {
  const config = getDirectFormConfig("cuenta-anual-partners-ghl");

  assert.equal(config?.requiresPartnerEmail, false);
});

test("multimarca annual requires the existing partner email", () => {
  const config = getDirectFormConfig("cuenta-multimarca-anual-ghl");

  assert.equal(config?.requiresPartnerEmail, true);
});

test("lifetime and premium forms create only their primary administrator", () => {
  const lifetime = getDirectFormConfig("cuenta-partner-ghl-lifetime");
  const premium = getDirectFormConfig("cuenta-ghl-premium-clientes");

  assert.equal(lifetime?.requiresPartnerEmail, false);
  assert.equal(premium?.requiresPartnerEmail, false);
});

test("validatePasswordPolicy requires 10 chars with upper, lower, number and special", () => {
  assert.equal(validatePasswordPolicy("Abcdefgh1*"), null);
  assert.equal(validatePasswordPolicy("Abc1*"), "La contraseña debe tener mínimo 10 caracteres");
  assert.equal(validatePasswordPolicy("abcdefgh1*"), "La contraseña debe incluir al menos una mayúscula");
  assert.equal(validatePasswordPolicy("ABCDEFGH1*"), "La contraseña debe incluir al menos una minúscula");
  assert.equal(validatePasswordPolicy("Abcdefghij*"), "La contraseña debe incluir al menos un número");
  assert.equal(validatePasswordPolicy("Abcdefghi1"), "La contraseña debe incluir al menos un carácter especial");
});
