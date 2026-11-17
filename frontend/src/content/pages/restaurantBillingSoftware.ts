import type { LongFormPage } from '../types.ts';

export const restaurantBillingSoftware: LongFormPage = {
  path: '/restaurant-billing-software',
  label: 'Restaurant Billing',
  title: 'Restaurant Billing Software for Small Restaurants | MenusQR',
  description:
    'Simple billing for small restaurants and cafés in India: a running bill per table, thermal-style receipt with CGST and SGST, cash, UPI or card, no new hardware.',
  h1: 'Simple Restaurant Billing Software for Small Restaurants and Cafés',
  intro:
    'Most small restaurants do not need a heavy POS. They need a bill that adds up every round a table ordered, prints cleanly with the right taxes, and closes the table when the guest pays. MenusQR’s cashier screen does exactly that, in a browser, as part of the Premium plan. Here is what it does and what it leaves out.',
  updated: '2026-11-15',
  sections: [
    {
      id: 'what-it-does',
      heading: 'What the cashier screen does',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'Floor view.', text: 'Your tables as a grid. Tables with an open bill stand out, so you see at a glance who is still eating.' },
            { lead: 'One running bill per table.', text: 'Every order placed from that table’s QR is added to the same bill, round after round.' },
            { lead: 'Add items by hand.', text: 'For a dish ordered through the waiter, the cashier adds it to the same bill.' },
            { lead: 'Open a bill from the counter.', text: 'For guests who did not scan, the cashier opens a bill for the table directly.' },
            { lead: 'Print the receipt.', text: 'A thermal-style receipt with your restaurant name, table, items, CGST, SGST and round-off.' },
            { lead: 'Record the payment.', text: 'Mark the bill paid by cash, UPI or card. The table is then free.' },
            { lead: 'Guest’s copy on the phone.', text: 'The guest can open the bill on their phone from the table.' },
          ],
        },
      ],
    },
    {
      id: 'receipt',
      heading: 'What is on the receipt',
      blocks: [
        {
          type: 'table',
          caption: 'Parts of a MenusQR restaurant receipt',
          head: ['Part', 'Details'],
          rows: [
            ['Header', 'Restaurant name'],
            ['Bill details', 'Bill or token number, table, date and time'],
            ['Items', 'Each dish with portion, quantity and amount'],
            ['Taxes', 'CGST 2.5% and SGST 2.5% on the taxable amount'],
            ['Total', 'Round-off and the final amount payable'],
          ],
        },
        {
          type: 'p',
          text: 'The receipt prints through the browser’s print window, so you can use the receipt printer or office printer you already have. Five per cent GST, split as 2.5% CGST and 2.5% SGST, is the usual rate for standalone restaurants. If your restaurant is taxed differently, for example inside a hotel, talk to your accountant and to us before you rely on the printed tax lines.',
        },
      ],
    },
    {
      id: 'why-simple',
      heading: 'Why simple billing is enough for many restaurants',
      blocks: [
        {
          type: 'p',
          text: 'A full restaurant POS includes inventory, purchase orders, staff attendance, multi-outlet reports and integrations with delivery apps. For a chain these are essential. For a 12-table restaurant or a café, many of them sit unused while the monthly cost and the training time stay.',
        },
        {
          type: 'p',
          text: 'MenusQR starts from the other end: the menu and the table. Because guests order from the same menu the cashier bills from, the bill is built automatically from what was ordered. There is no re-typing of orders, which is where most billing mistakes in small restaurants come from.',
        },
      ],
      links: [{ to: '/guides/reduce-order-mistakes', label: 'Where order and billing mistakes come from' }],
    },
    {
      id: 'billing-mistakes',
      heading: 'Billing mistakes small restaurants make, and how to avoid them',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'Forgetting a later round.', text: 'The dessert or the extra roti ordered at the end never reaches the bill. A running bill that collects every order from the table fixes this.' },
            { lead: 'Re-typing orders at the counter.', text: 'Every time an order is copied from a slip into a billing system, a dish can be missed or doubled. Billing straight from the order removes the copying.' },
            { lead: 'Wrong portion on the bill.', text: 'Half ordered, full billed. Using the same dish names and portions on the menu, the order and the bill makes disputes easy to settle.' },
            { lead: 'Closing the wrong table.', text: 'In a rush, the cashier settles table 12 for the guests at table 21. A floor view with the table number on every bill reduces this.' },
            { lead: 'Not recording how a bill was paid.', text: 'At the end of the day, cash in the drawer will not match without it. Record cash, UPI or card on each bill.' },
          ],
        },
      ],
    },
    {
      id: 'end-of-day',
      heading: 'End of the day',
      blocks: [
        {
          type: 'p',
          text: 'Because every bill records the payment method, closing the day is a matter of comparing the cash in the drawer with the cash bills, and your UPI and card statements with the rest. Any table still open on the floor view at closing time is either a guest still sitting or a bill that was never settled, and both are worth checking before you lock up.',
        },
        {
          type: 'p',
          text: 'For deeper numbers, such as which dishes sold most and which hours were busiest, the reports in your dashboard show the trend over days and weeks.',
        },
      ],
    },
    {
      id: 'not-included',
      heading: 'What is not included',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'Inventory and recipe costing.', text: 'Stock is not tracked.' },
            { lead: 'GST return filing and accounting.', text: 'Use your accountant or accounting software; MenusQR shows taxes on each bill.' },
            { lead: 'Card machine or UPI integration.', text: 'Payments are taken on your existing machine or UPI QR; the cashier records the method.' },
            { lead: 'Offline billing.', text: 'The cashier screen needs internet.' },
            { lead: 'Aggregator orders.', text: 'Orders from delivery apps are not pulled in.' },
          ],
        },
        {
          type: 'p',
          text: 'If you need these, a full POS is the better tool. Many restaurants use MenusQR for the menu and table ordering alongside a POS they already have.',
        },
      ],
    },
    {
      id: 'setup',
      heading: 'Setting it up',
      blocks: [
        {
          type: 'steps',
          items: [
            { lead: 'Choose Premium.', text: 'Billing comes with table ordering and the kitchen screen at ₹1,119 a month or ₹6,799 a year.' },
            { lead: 'Create your tables.', text: 'Each table gets its own QR code and appears on the cashier’s floor view.' },
            { lead: 'Open the cashier screen at the counter.', text: 'On a computer, tablet or phone, connected to your printer.' },
            { lead: 'Print a test bill.', text: 'Check the layout on your printer before the first service.' },
          ],
        },
      ],
    },
    {
      id: 'who-it-suits',
      heading: 'Who it suits',
      blocks: [
        {
          type: 'p',
          text: 'Small and mid-size restaurants, cafés, dhabas and bars that bill mainly for dine-in, that want guests to order from the table, and that would rather not pay for and learn a large POS. It suits owners who want the menu, the kitchen and the bill to agree without anyone adding up slips at the end of the night.',
        },
      ],
      links: [{ to: '/restaurant-software', label: 'Everything MenusQR does, and what it does not' }],
    },
  ],
  faqs: [
    {
      question: 'Does MenusQR show GST on bills?',
      answer: 'Yes. Receipts show CGST and SGST at 2.5% each and the round-off. Check with your accountant that this matches how your restaurant is taxed.',
    },
    {
      question: 'Do I need a special billing printer?',
      answer: 'No. Bills print through the browser’s print window to the printer you already use, including common receipt printers.',
    },
    {
      question: 'Can guests pay through MenusQR?',
      answer: 'No. Guests pay you directly by cash, UPI or card, and the cashier records the method on the bill.',
    },
    {
      question: 'Does it track inventory?',
      answer: 'No. MenusQR handles the menu, ordering, kitchen and bills. Inventory needs a separate tool or a full POS.',
    },
  ],
  related: [
    { to: '/kitchen-display-system', label: 'Kitchen display system' },
    { to: '/qr-ordering-for-restaurants', label: 'QR table ordering' },
    { to: '/restaurant-software', label: 'Restaurant software overview' },
  ],
  cta: {
    heading: 'Billing that matches what the kitchen cooked',
    text: 'Premium: table ordering, kitchen screen and billing at ₹6,799 a year.',
    to: '/plans',
    label: 'See the Premium plan',
  },
};
