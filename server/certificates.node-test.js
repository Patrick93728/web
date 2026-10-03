import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CertificatesError, loadCertificates, mapCertificateRows } from './certificates.js';

const environment = {
  FRUITASK_API_KEY: 'test-only-key',
  FRUITASK_CERTIFICATES_WORKSPACE_TOKEN: 'test-only-token',
};

test('maps certificate fields and tolerates missing image attachments', () => {
  const mapped = mapCertificateRows([
    { id: 'one', cells: { 'Certificate Name': { value: 'Example' }, Issuer: { value: 'Issuer' }, 'Date Issued': { value: '2025-09-06' }, 'Certificate Image': { value: [{ url: 'https://example.com/certificate.png' }] } } },
    { id: 'two', cells: { 'Certificate Name': { value: 'Second' }, 'Certificate Image': { value: null } } },
    { id: 'three', cells: { Issuer: { value: 'No title' } } },
  ]);
  assert.equal(mapped.length, 2);
  assert.equal(mapped[0].image, 'https://example.com/certificate.png');
  assert.equal(mapped[1].image, null);
  assert.equal(mapped[1].issuer, '');
});

test('loads Certificates table through a server-only authenticated request', async () => {
  const records = await loadCertificates(environment, async (url, options) => {
    assert.equal(url, 'https://integrations.fruitask.com/Certificates/test-only-token/rows?limit=200');
    assert.equal(options.headers['X-API-Key'], environment.FRUITASK_API_KEY);
    return { ok: true, json: async () => ({ data: { rows: [{ cells: { 'Certificate Name': { value: 'Example' } } }] } }) };
  });
  assert.equal(records[0].name, 'Example');
  assert.equal(JSON.stringify(records).includes(environment.FRUITASK_API_KEY), false);
  assert.equal(JSON.stringify(records).includes(environment.FRUITASK_CERTIFICATES_WORKSPACE_TOKEN), false);
});

test('missing server credentials cause a configuration error', async () => {
  await assert.rejects(() => loadCertificates({}), (error) => error instanceof CertificatesError && error.status === 503);
});
