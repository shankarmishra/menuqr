import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, parseApiResponse, safeJsonParse } from '../../frontend/src/utils/api.ts';

describe('API Response Parser & ApiError Invariants', () => {
  test('parses valid 200 JSON responses correctly', async () => {
    const payload = { success: true, count: 5, items: ['a', 'b'] };
    const mockRes = new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    const parsed = await parseApiResponse(mockRes);
    assert.deepEqual(parsed, payload);
  });

  test('parses valid 201 JSON responses correctly', async () => {
    const payload = { id: 'cpn_123', status: 'AVAILABLE' };
    const mockRes = new Response(JSON.stringify(payload), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

    const parsed = await parseApiResponse(mockRes);
    assert.deepEqual(parsed, payload);
  });

  test('handles 204 No Content without throwing "Unexpected end of JSON input"', async () => {
    const mockRes = new Response(null, {
      status: 204,
      statusText: 'No Content',
    });

    const parsed = await parseApiResponse(mockRes);
    assert.equal(parsed, undefined);
  });

  test('rejects 200 with empty body when content is expected', async () => {
    const mockRes = new Response('', {
      status: 200,
      statusText: 'OK',
    });

    await assert.rejects(
      async () => parseApiResponse(mockRes),
      (err) => {
        assert(err instanceof ApiError);
        assert.equal(err.status, 200);
        assert.match(err.message, /empty response where content was expected/);
        return true;
      }
    );
  });

  test('accepts 200 with empty body when allowEmpty is explicitly enabled', async () => {
    const mockRes = new Response('', {
      status: 200,
      statusText: 'OK',
    });

    const parsed = await parseApiResponse(mockRes, { allowEmpty: true });
    assert.equal(parsed, undefined);
  });

  test('handles empty body with error status (e.g. 404) by throwing ApiError with status', async () => {
    const mockRes = new Response('', {
      status: 404,
      statusText: 'Not Found',
    });

    await assert.rejects(
      async () => parseApiResponse(mockRes),
      (err) => {
        assert(err instanceof ApiError);
        assert.equal(err.status, 404);
        assert.equal(err.message, 'Not Found');
        return true;
      }
    );
  });

  test('detects HTML response on 200 OK (Vercel SPA rewrite) and throws actionable ApiError', async () => {
    const htmlPayload = '<!DOCTYPE html><html><head><title>MenusQR</title></head><body><div id="root"></div></body></html>';
    const mockRes = new Response(htmlPayload, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });

    await assert.rejects(
      async () => parseApiResponse(mockRes),
      (err) => {
        assert(err instanceof ApiError);
        assert.equal(err.status, 200);
        assert.equal(err.isHtml, true);
        assert.match(err.message, /Expected JSON response.*received HTML.*SPA fallback rewrite/);
        return true;
      }
    );
  });

  test('detects HTML response on 502/503 (proxy error) and throws actionable ApiError', async () => {
    const htmlPayload = '<html><body><h1>502 Bad Gateway</h1><p>Render server is booting...</p></body></html>';
    const mockRes = new Response(htmlPayload, {
      status: 502,
      statusText: 'Bad Gateway',
      headers: { 'Content-Type': 'text/html' },
    });

    await assert.rejects(
      async () => parseApiResponse(mockRes),
      (err) => {
        assert(err instanceof ApiError);
        assert.equal(err.status, 502);
        assert.equal(err.isHtml, true);
        assert.match(err.message, /Server returned an HTML error page \(502 Bad Gateway\)/);
        return true;
      }
    );
  });

  test('extracts structured JSON error message on 400 Bad Request', async () => {
    const errorJson = { error: 'Coupon code MQ15-ABCD-1234 has expired.' };
    const mockRes = new Response(JSON.stringify(errorJson), {
      status: 400,
      statusText: 'Bad Request',
      headers: { 'Content-Type': 'application/json' },
    });

    await assert.rejects(
      async () => parseApiResponse(mockRes),
      (err) => {
        assert(err instanceof ApiError);
        assert.equal(err.status, 400);
        assert.equal(err.message, 'Coupon code MQ15-ABCD-1234 has expired.');
        assert.deepEqual(err.data, errorJson);
        return true;
      }
    );
  });

  test('extracts structured JSON error message with "message" field', async () => {
    const errorJson = { message: 'Unauthorized super admin access.' };
    const mockRes = new Response(JSON.stringify(errorJson), {
      status: 401,
      statusText: 'Unauthorized',
      headers: { 'Content-Type': 'application/json' },
    });

    await assert.rejects(
      async () => parseApiResponse(mockRes),
      (err) => {
        assert(err instanceof ApiError);
        assert.equal(err.status, 401);
        assert.equal(err.message, 'Unauthorized super admin access.');
        return true;
      }
    );
  });

  test('handles malformed non-HTML response without crashing uncaught', async () => {
    const invalidJson = 'Not A JSON: {something broken';
    const mockRes = new Response(invalidJson, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });

    await assert.rejects(
      async () => parseApiResponse(mockRes),
      (err) => {
        assert(err instanceof ApiError);
        assert.equal(err.message, 'Failed to parse JSON response from server.');
        return true;
      }
    );
  });

  test('safeJsonParse parses valid json and returns null for invalid input', () => {
    assert.deepEqual(safeJsonParse('{"a":1}'), { a: 1 });
    assert.equal(safeJsonParse('invalid json'), null);
    assert.equal(safeJsonParse(''), null);
  });
});
