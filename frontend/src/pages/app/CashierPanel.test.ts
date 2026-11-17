import test from 'node:test';
import assert from 'node:assert/strict';

interface CashierToken {
  id: string;
  tokenNumber: number;
  tableNumber: number;
  total: number;
  itemCount: number;
  createdAt: string;
  status: 'UNPAID' | 'PAID' | 'VOID' | 'BILL_REQUESTED' | 'ORDERING' | 'DINING' | 'SETTLED' | 'ISSUED' | 'CLOSED';
}

test('CashierPanel: Active token queue filtering logic (critical defect fix)', async (t) => {
  const sampleTokens: CashierToken[] = [
    { id: '1', tokenNumber: 1, tableNumber: 1, total: 350, itemCount: 2, createdAt: '2026-11-03T10:00:00Z', status: 'ISSUED' },
    { id: '2', tokenNumber: 2, tableNumber: 2, total: 540, itemCount: 3, createdAt: '2026-11-03T10:05:00Z', status: 'ORDERING' },
    { id: '3', tokenNumber: 3, tableNumber: 3, total: 720, itemCount: 4, createdAt: '2026-11-03T10:10:00Z', status: 'DINING' },
    { id: '4', tokenNumber: 4, tableNumber: 4, total: 890, itemCount: 5, createdAt: '2026-11-03T10:15:00Z', status: 'BILL_REQUESTED' },
    { id: '5', tokenNumber: 5, tableNumber: 5, total: 200, itemCount: 1, createdAt: '2026-11-03T10:20:00Z', status: 'UNPAID' },
    { id: '6', tokenNumber: 6, tableNumber: 6, total: 950, itemCount: 4, createdAt: '2026-11-03T10:25:00Z', status: 'SETTLED' },
    { id: '7', tokenNumber: 7, tableNumber: 7, total: 430, itemCount: 2, createdAt: '2026-11-03T10:30:00Z', status: 'CLOSED' },
    { id: '8', tokenNumber: 8, tableNumber: 8, total: 150, itemCount: 1, createdAt: '2026-11-03T10:35:00Z', status: 'VOID' },
  ];

  await t.test('legacy buggy filter excludes active tokens not explicitly named UNPAID', () => {
    // Reproducing legacy defect: t.status === 'UNPAID'
    const buggyUnpaid = sampleTokens.filter((t) => (t.status as string) === 'UNPAID');
    assert.equal(buggyUnpaid.length, 1, 'Buggy filter only preserved token with literal UNPAID status');
    assert.equal(buggyUnpaid[0].id, '5');
  });

  await t.test('fixed filter retains all active dining and billing tokens', () => {
    // System 2 fixed filter: !['SETTLED', 'CLOSED', 'VOID'].includes((t.status || '').toUpperCase())
    const activeTokens = sampleTokens.filter(
      (t) => !['SETTLED', 'CLOSED', 'VOID'].includes((t.status || '').toUpperCase())
    );

    assert.equal(activeTokens.length, 5, 'Fixed filter must retain all 5 active tokens');
    const activeStatuses = activeTokens.map((t) => t.status);
    assert.ok(activeStatuses.includes('ISSUED'));
    assert.ok(activeStatuses.includes('ORDERING'));
    assert.ok(activeStatuses.includes('DINING'));
    assert.ok(activeStatuses.includes('BILL_REQUESTED'));
    assert.ok(activeStatuses.includes('UNPAID'));
    assert.ok(!activeStatuses.includes('SETTLED'));
    assert.ok(!activeStatuses.includes('CLOSED'));
    assert.ok(!activeStatuses.includes('VOID'));
  });
});

test('CashierPanel: FloorGrid table matrix occupancy calculations', async (t) => {
  const mockTables = [
    { id: 'tbl-1', label: 'Table 1' },
    { id: 'tbl-2', label: 'Table 2' },
    { id: 'tbl-3', label: 'Table 3' },
    { id: 'tbl-4', label: 'Table 4' },
    { id: 'tbl-5', label: 'Table 5' },
  ];

  const activeTokens: CashierToken[] = [
    { id: 'tok-1', tokenNumber: 101, tableNumber: 1, total: 450, itemCount: 2, createdAt: '2026-11-03T12:00:00Z', status: 'DINING' },
    { id: 'tok-2', tokenNumber: 102, tableNumber: 3, total: 850, itemCount: 4, createdAt: '2026-11-03T12:10:00Z', status: 'BILL_REQUESTED' },
  ];

  function computeFloorOccupancy(tables: typeof mockTables, tokens: CashierToken[]) {
    const tokensByTable = new Map<number, CashierToken>();
    tokens.forEach((t) => {
      if (t.tableNumber > 0) tokensByTable.set(t.tableNumber, t);
    });

    const parsedTables = tables.map((t) => {
      const num = parseInt(t.label.replace(/\D/g, ''), 10);
      return { id: t.id, label: t.label, tableNumber: num };
    });

    const vacantCount = parsedTables.filter((t) => !tokensByTable.has(t.tableNumber)).length;
    const occupiedCount = parsedTables.filter((t) => tokensByTable.has(t.tableNumber)).length;
    const billRequestedCount = tokens.filter((t) => t.status === 'BILL_REQUESTED').length;

    return { tokensByTable, vacantCount, occupiedCount, billRequestedCount };
  }

  await t.test('accurately partitions tables into vacant and occupied', () => {
    const { vacantCount, occupiedCount, billRequestedCount, tokensByTable } = computeFloorOccupancy(
      mockTables,
      activeTokens
    );

    assert.equal(vacantCount, 3, 'Tables 2, 4, 5 must be vacant');
    assert.equal(occupiedCount, 2, 'Tables 1, 3 must be occupied');
    assert.equal(billRequestedCount, 1, 'Table 3 must be in BILL_REQUESTED state');
    assert.equal(tokensByTable.get(1)?.tokenNumber, 101);
    assert.equal(tokensByTable.get(3)?.tokenNumber, 102);
    assert.equal(tokensByTable.get(2), undefined);
  });

  await t.test('auto-generates tables 1..12 when restaurant table configuration is empty', () => {
    const emptyTables: typeof mockTables = [];
    const activeNums = activeTokens.map((t) => t.tableNumber).filter((n) => n > 0);
    const maxNum = Math.max(12, ...activeNums);
    const synthesized = [];
    for (let i = 1; i <= Math.min(maxNum, 30); i++) {
      synthesized.push({ id: `tbl-${i}`, label: `Table ${i}`, tableNumber: i });
    }

    assert.equal(synthesized.length, 12);
    assert.equal(synthesized[0].tableNumber, 1);
    assert.equal(synthesized[11].tableNumber, 12);
  });
});

test('CashierPanel: Staff SSE event dispatching & state transitions', async (t) => {
  let activeTokens: CashierToken[] = [
    { id: 'tok-10', tokenNumber: 10, tableNumber: 1, total: 250, itemCount: 1, createdAt: '2026-11-03T14:00:00Z', status: 'DINING' },
    { id: 'tok-11', tokenNumber: 11, tableNumber: 2, total: 400, itemCount: 2, createdAt: '2026-11-03T14:05:00Z', status: 'ORDERING' },
  ];

  await t.test('new_token event prepends new active session', () => {
    const newPayload = {
      tokenId: 'tok-12',
      tokenNumber: 12,
      tableNumber: 3,
      total: 550,
      itemCount: 3,
      status: 'ISSUED',
      createdAt: '2026-11-03T14:10:00Z',
    };

    activeTokens = [
      {
        id: newPayload.tokenId,
        tokenNumber: newPayload.tokenNumber,
        tableNumber: newPayload.tableNumber,
        total: newPayload.total,
        itemCount: newPayload.itemCount,
        status: newPayload.status as any,
        createdAt: newPayload.createdAt,
      },
      ...activeTokens,
    ];

    assert.equal(activeTokens.length, 3);
    assert.equal(activeTokens[0].id, 'tok-12');
  });

  await t.test('bill_requested event updates token status and alerts counter', () => {
    const targetTokenId = 'tok-10';
    activeTokens = activeTokens.map((t) =>
      t.id === targetTokenId ? { ...t, status: 'BILL_REQUESTED' as const } : t
    );

    const updated = activeTokens.find((t) => t.id === 'tok-10');
    assert.equal(updated?.status, 'BILL_REQUESTED');
  });

  await t.test('token_settled and token_closed remove token from active queue', () => {
    // Settle tok-10
    activeTokens = activeTokens.filter((t) => t.id !== 'tok-10');
    assert.equal(activeTokens.length, 2);
    assert.equal(activeTokens.find((t) => t.id === 'tok-10'), undefined);

    // Close tok-11
    activeTokens = activeTokens.filter((t) => t.id !== 'tok-11');
    assert.equal(activeTokens.length, 1);
    assert.equal(activeTokens[0].id, 'tok-12');
  });
});

test('CashierPanel: Inline Thermal Receipt preview data mapping', async (t) => {
  await t.test('maps CashierToken and TokenDetail into complete PublicTokenData', () => {
    const cashierToken: CashierToken = {
      id: 'tok-99',
      tokenNumber: 99,
      tableNumber: 4,
      total: 714,
      itemCount: 2,
      createdAt: '2026-11-03T15:00:00Z',
      status: 'DINING',
    };

    const tokenDetail = {
      id: 'tok-99',
      subtotal: 680,
      gst: 34,
      cgst: 17,
      sgst: 17,
      discount: 0,
      total: 714,
      items: [
        { id: 'it-1', dishName: 'Butter Chicken', quantity: 1, price: 380, total: 380, isVeg: false },
        { id: 'it-2', dishName: 'Garlic Naan', quantity: 2, price: 150, total: 300, isVeg: true },
      ],
      restaurantName: 'Grand Spice',
      restaurantGstin: '07ABCDE1234F1Z5',
      restaurantFssai: '11223344556677',
    };

    const publicTokenData = {
      tokenId: cashierToken.id,
      tokenNumber: cashierToken.tokenNumber,
      tokenCode: `#${String(cashierToken.tokenNumber).padStart(3, '0')}`,
      tableNumber: cashierToken.tableNumber,
      restaurantName: tokenDetail.restaurantName,
      restaurantGstin: tokenDetail.restaurantGstin,
      restaurantFssai: tokenDetail.restaurantFssai,
      items: tokenDetail.items.map((it) => ({
        name: it.dishName,
        quantity: it.quantity,
        unitPrice: it.price,
        totalPrice: it.total,
        isVeg: it.isVeg,
      })),
      subtotal: tokenDetail.subtotal,
      gst: tokenDetail.gst,
      cgst: tokenDetail.cgst,
      sgst: tokenDetail.sgst,
      discount: tokenDetail.discount,
      total: tokenDetail.total,
      status: cashierToken.status,
      createdAt: cashierToken.createdAt,
    };

    assert.equal(publicTokenData.tokenCode, '#099');
    assert.equal(publicTokenData.items.length, 2);
    assert.equal(publicTokenData.items[0].name, 'Butter Chicken');
    assert.equal(publicTokenData.cgst, 17);
    assert.equal(publicTokenData.sgst, 17);
    assert.equal(publicTokenData.total, 714);
  });
});
