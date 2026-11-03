/**
 * Real-Time Order Stream Manager (Server-Sent Events)
 * Manages active SSE connections for kitchen / reception dashboard per tenant.
 */

// Map<tenantId, Set<{ res: ServerResponse, req: IncomingMessage, timer: NodeJS.Timeout, canReceiveOrders: boolean }>>
const clientsByTenant = new Map();

const ORDER_SPECIFIC_EVENTS = new Set([
  'new_order',
  'order_status_updated',
  'order_time_updated',
  'service_request',
  // System 2: Table Token Events (entitlement-gated)
  'new_token',
  'token_settled',
  'token_closed',
  'bill_requested',
  'token_item_added',
  'token_items_updated',
  'token_voided',
]);

/**
 * Register a client for SSE order updates
 */
export function registerOrderClient(tenantId, res, req, options = {}) {
  if (!tenantId || !res) return;

  // Set SSE HTTP response headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Critical for Nginx / Cloudflare to disable buffering
    'Access-Control-Allow-Credentials': 'true',
  });

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ tenantId, connectedAt: new Date().toISOString() })}\n\n`);

  // Heartbeat / ping timer every 25 seconds to keep connection alive through proxies / Cloudflare
  const pingInterval = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch {
      clearInterval(pingInterval);
    }
  }, 25000);

  if (!clientsByTenant.has(tenantId)) {
    clientsByTenant.set(tenantId, new Set());
  }

  const clientRecord = {
    res,
    req,
    timer: pingInterval,
    canReceiveOrders: options.canReceiveOrders !== false,
  };
  clientsByTenant.get(tenantId).add(clientRecord);

  // Handle connection cleanup on client disconnect or network abort
  const cleanup = () => {
    clearInterval(pingInterval);
    const tenantSet = clientsByTenant.get(tenantId);
    if (tenantSet) {
      tenantSet.delete(clientRecord);
      if (tenantSet.size === 0) {
        clientsByTenant.delete(tenantId);
      }
    }
  };

  req.on('close', cleanup);
  req.on('end', cleanup);
  res.on('error', cleanup);
}

/**
 * Broadcast an order event to all active kitchen/reception tabs for a tenant
 * @param {string} tenantId 
 * @param {'new_order'|'order_status_updated'|'order_time_updated'|string} eventType 
 * @param {object} orderData 
 */
export function broadcastOrderEvent(tenantId, eventType, orderData) {
  if (!tenantId || !orderData) return;
  const tenantSet = clientsByTenant.get(tenantId);
  if (!tenantSet || tenantSet.size === 0) return;

  const payload = `event: ${eventType}\ndata: ${JSON.stringify(orderData)}\n\n`;

  for (const client of tenantSet) {
    if (ORDER_SPECIFIC_EVENTS.has(eventType) && client.canReceiveOrders === false) {
      continue;
    }
    try {
      client.res.write(payload);
    } catch (err) {
      console.warn(`[orderStream] Failed to push to client: ${err.message}`);
    }
  }
}

/**
 * Broadcast subscription/plan update event to all active client tabs for a tenant
 * @param {string} tenantId
 * @param {object} planData
 */
export function broadcastPlanEvent(tenantId, planData) {
  if (!tenantId || !planData) return;
  broadcastOrderEvent(tenantId, 'plan_updated', planData);
}

/**
 * Get count of active SSE listeners for a tenant
 */
export function getActiveListenerCount(tenantId) {
  return clientsByTenant.get(tenantId)?.size || 0;
}

/**
 * Broadcast new token event to staff order stream
 * @param {string} tenantId
 * @param {object} token
 */
export function broadcastNewToken(tenantId, token) {
  if (!tenantId || !token) return;
  broadcastOrderEvent(tenantId, 'new_token', token);
}

/**
 * Broadcast token settled event to staff order stream
 * @param {string} tenantId
 * @param {object} token
 */
export function broadcastTokenSettled(tenantId, token) {
  if (!tenantId || !token) return;
  broadcastOrderEvent(tenantId, 'token_settled', token);
}

/**
 * Broadcast token closed event to staff order stream
 * @param {string} tenantId
 * @param {object} token
 */
export function broadcastTokenClosed(tenantId, token) {
  if (!tenantId || !token) return;
  broadcastOrderEvent(tenantId, 'token_closed', token);
}

/**
 * Broadcast bill requested event to staff order stream
 * @param {string} tenantId
 * @param {object} token
 */
export function broadcastBillRequested(tenantId, token) {
  if (!tenantId || !token) return;
  broadcastOrderEvent(tenantId, 'bill_requested', token);
}
