import assert from "node:assert/strict";
import test from "node:test";

import {
  DIRECT_FORM_CONFIGS,
  getDirectFormConfig,
  validatePasswordPolicy,
} from "../src/app/api/create-account/directForms.ts";

test("direct form configs expose the three public form URLs", () => {
  assert.deepEqual(
    DIRECT_FORM_CONFIGS.map((config) => config.slug),
    ["psicologos", "impulso-digital-anual", "partner-multimarca"],
  );
  assert.ok(DIRECT_FORM_CONFIGS.every((config) => config.snapshotId === "XYvYKvT2RqitSJFAseuS"));
});

test("psicologos form applies its snapshot without billing configuration", () => {
  const config = getDirectFormConfig("psicologos");

  assert.equal(config?.snapshotId, "XYvYKvT2RqitSJFAseuS");
  assert.equal(config?.requiresPartnerEmail, false);
});

test("impulso digital applies its snapshot without billing configuration", () => {
  const config = getDirectFormConfig("impulso-digital-anual");

  assert.equal(config?.snapshotId, "XYvYKvT2RqitSJFAseuS");
  assert.equal(config?.requiresPartnerEmail, false);
});

test("partner multimarca requires partner email", () => {
  const config = getDirectFormConfig("partner-multimarca");

  assert.equal(config?.requiresPartnerEmail, true);
});

test("validatePasswordPolicy requires 10 chars with upper, lower, number and special", () => {
  assert.equal(validatePasswordPolicy("Abcdefgh1*"), null);
  assert.equal(validatePasswordPolicy("Abc1*"), "La contraseña debe tener mínimo 10 caracteres");
  assert.equal(validatePasswordPolicy("abcdefgh1*"), "La contraseña debe incluir al menos una mayúscula");
  assert.equal(validatePasswordPolicy("ABCDEFGH1*"), "La contraseña debe incluir al menos una minúscula");
  assert.equal(validatePasswordPolicy("Abcdefghij*"), "La contraseña debe incluir al menos un número");
  assert.equal(validatePasswordPolicy("Abcdefghi1"), "La contraseña debe incluir al menos un carácter especial");
});
