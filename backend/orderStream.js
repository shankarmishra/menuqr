/**
 * Real-Time Order Stream Manager (Server-Sent Events)
 * Manages active SSE connections for kitchen / reception dashboard per tenant.
 */

// Map<tenantId, Set<{ res: ServerResponse, req: IncomingMessage, timer: NodeJS.Timeout }>>
const clientsByTenant = new Map();

/**
 * Register a client for SSE order updates
 */
export function registerOrderClient(tenantId, res, req) {
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

  const clientRecord = { res, req, timer: pingInterval };
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
 * @param {'new_order'|'order_status_updated'|'order_time_updated'} eventType 
 * @param {object} orderData 
 */
export function broadcastOrderEvent(tenantId, eventType, orderData) {
  if (!tenantId || !orderData) return;
  const tenantSet = clientsByTenant.get(tenantId);
  if (!tenantSet || tenantSet.size === 0) return;

  const payload = `event: ${eventType}\ndata: ${JSON.stringify(orderData)}\n\n`;

  for (const client of tenantSet) {
    try {
      client.res.write(payload);
    } catch (err) {
      console.warn(`[orderStream] Failed to push to client: ${err.message}`);
    }
  }
}

/**
 * Get count of active SSE listeners for a tenant
 */
export function getActiveListenerCount(tenantId) {
  return clientsByTenant.get(tenantId)?.size || 0;
}
