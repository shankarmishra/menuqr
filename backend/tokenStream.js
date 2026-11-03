/**
 * Real-Time Customer Token Stream Manager (Server-Sent Events)
 * Provides token-isolated SSE streaming for customer-facing live thermal bill pages.
 * Endpoint: GET /api/public/tokens/:tokenId/stream
 */

// Map<tokenId, Set<ClientRecord>>
// Strict isolation: Client A on Token A NEVER receives events from Token B.
const clientsByToken = new Map();

/**
 * Register a customer SSE client for a specific token
 * @param {string} tokenId - UUID of the table token
 * @param {import('node:http').ServerResponse} res - HTTP server response
 * @param {import('node:http').IncomingMessage} req - HTTP server request
 * @param {object} [options]
 * @param {object} [options.initialToken] - Current token snapshot for instant state push
 */
export function registerTokenClient(tokenId, res, req, options = {}) {
  if (!tokenId || !res) return;

  const origin = req?.headers?.origin || '*';

  // 1. Set SSE HTTP response headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Critical for Nginx / Cloudflare
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': origin !== '*' ? 'true' : 'false',
    'Vary': 'Origin',
  });

  // 2. Initial Handshake & Initial State Push (immediate flush)
  res.write(`event: connected\ndata: ${JSON.stringify({ tokenId, connectedAt: new Date().toISOString() })}\n\n`);

  if (options.initialToken) {
    res.write(`event: token_status\ndata: ${JSON.stringify({
      status: options.initialToken.status,
      token: options.initialToken,
    })}\n\n`);
  }

  // 3. Keep-alive ping interval (every 25 seconds)
  const pingInterval = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch {
      cleanup();
    }
  }, 25000);

  // 4. Registry management
  if (!clientsByToken.has(tokenId)) {
    clientsByToken.set(tokenId, new Set());
  }

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    clearInterval(pingInterval);
    const clientSet = clientsByToken.get(tokenId);
    if (clientSet) {
      clientSet.delete(clientRecord);
      if (clientSet.size === 0) {
        clientsByToken.delete(tokenId);
      }
    }
    try {
      if (!res.writableEnded) res.end();
    } catch {}
  };

  const clientRecord = {
    res,
    req,
    timer: pingInterval,
    connectedAt: new Date().toISOString(),
    cleanup,
  };

  clientsByToken.get(tokenId).add(clientRecord);

  // 5. Connection lifecycle event listeners
  req.on('close', cleanup);
  req.on('end', cleanup);
  res.on('close', cleanup);
  res.on('finish', cleanup);
  res.on('error', cleanup);
}

/**
 * Broadcast an event strictly to customer tabs connected to this token ID
 * @param {string} tokenId
 * @param {string} eventType
 * @param {object} eventData
 */
export function broadcastTokenEvent(tokenId, eventType, eventData) {
  if (!tokenId || !eventData) return;
  const clientSet = clientsByToken.get(tokenId);
  if (!clientSet || clientSet.size === 0) return;

  const payload = `event: ${eventType}\ndata: ${JSON.stringify(eventData)}\n\n`;

  for (const client of Array.from(clientSet)) {
    try {
      client.res.write(payload);
    } catch (err) {
      console.warn(`[tokenStream] Write error on token ${tokenId}: ${err.message}`);
      client.cleanup();
    }
  }
}

/**
 * Broadcast token status update to customer tabs
 * @param {string} tokenId
 * @param {object} token
 */
export function broadcastTokenStatus(tokenId, token) {
  if (!tokenId || !token) return;
  broadcastTokenEvent(tokenId, 'token_status', {
    status: token.status,
    token,
  });
}

/**
 * Broadcast token item additions / bill updates to customer tabs
 * @param {string} tokenId
 * @param {Array} items
 * @param {object} tokenTotals
 */
export function broadcastTokenItems(tokenId, items, tokenTotals = {}) {
  if (!tokenId) return;
  broadcastTokenEvent(tokenId, 'token_items_updated', {
    tokenId,
    items,
    ...tokenTotals,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Get count of active listeners for a specific token
 * @param {string} tokenId
 */
export function getActiveTokenListenerCount(tokenId) {
  return clientsByToken.get(tokenId)?.size || 0;
}

/**
 * Forcibly close all active connections for a token (e.g. upon table closure)
 * @param {string} tokenId
 */
export function closeTokenClients(tokenId) {
  const clientSet = clientsByToken.get(tokenId);
  if (!clientSet) return;
  for (const client of Array.from(clientSet)) {
    client.cleanup();
  }
  clientsByToken.delete(tokenId);
}
