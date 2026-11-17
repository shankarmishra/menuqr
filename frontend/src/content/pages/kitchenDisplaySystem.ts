import type { LongFormPage } from '../types.ts';

export const kitchenDisplaySystem: LongFormPage = {
  path: '/kitchen-display-system',
  label: 'Kitchen Display System',
  title: 'Kitchen Display System (KDS) for Restaurants | MenusQR',
  description:
    'A simple kitchen display system for Indian restaurants: table orders appear on any tablet with a sound, staff mark them preparing and ready, KOTs still print.',
  h1: 'A Simple Kitchen Display System for Indian Restaurant Kitchens',
  intro:
    'A kitchen display system, or KDS, puts orders on a screen in the kitchen in place of paper slips. MenusQR includes one on the Premium plan. It works on any tablet, phone or computer with a browser, receives orders straight from guests’ phones, and keeps the waiter and cashier in step with the kitchen.',
  updated: '2026-11-15',
  sections: [
    {
      id: 'what-a-kds-is',
      heading: 'What a kitchen display system does',
      blocks: [
        {
          type: 'p',
          text: 'In a kitchen that runs on paper, orders arrive as handwritten slips or printed KOTs pinned above the counter. They get wet, fall behind the stove and cannot tell anyone outside the kitchen that a dish is ready. A KDS shows the same orders on a screen, in the order they arrived, and lets kitchen staff change each order’s status with a tap. That status is seen by the people who need it: the cashier, the waiter and, with QR ordering, the guest.',
        },
      ],
      links: [{ to: '/guides/kot-kitchen-order-ticket', label: 'What a KOT is and how it relates to a KDS' }],
    },
    {
      id: 'how-it-works',
      heading: 'How the MenusQR kitchen screen works',
      blocks: [
        {
          type: 'steps',
          items: [
            { lead: 'An order arrives.', text: 'A guest orders from the table QR, or the order is placed for takeaway or delivery. It appears on the orders screen with a sound so it is noticed in a noisy kitchen.' },
            { lead: 'Staff read the ticket.', text: 'Table number or order type, dishes, half or full, add-ons, quantity and the guest’s own note such as "less spicy".' },
            { lead: 'Staff accept it.', text: 'Nothing is cooked until someone accepts the order. An order that looks wrong can be rejected.' },
            { lead: 'Preparing, then ready.', text: 'Each tap updates the cashier’s screen and the guest’s phone, so nobody walks to the kitchen to ask.' },
            { lead: 'Finished orders move away.', text: 'Completed tickets are archived automatically so the screen shows only what still needs cooking.' },
          ],
        },
        {
          type: 'p',
          text: 'Kitchens that prefer paper for each station can still print a KOT from the order.',
        },
      ],
    },
    {
      id: 'benefits',
      heading: 'What changes in the kitchen',
      blocks: [
        {
          type: 'table',
          caption: 'Paper slips compared with a kitchen screen',
          head: ['', 'Paper slips', 'Kitchen screen'],
          rows: [
            ['Reading the order', 'Depends on handwriting', 'Printed clearly, with notes on the same ticket'],
            ['Order of cooking', 'Slips get shuffled', 'Shown in the order received'],
            ['Telling the floor a dish is ready', 'Shouting or walking out', 'One tap, seen by cashier and guest'],
            ['Lost tickets', 'Common in a rush', 'Stay on screen until finished'],
            ['A second round from the same table', 'A new slip, easy to miss', 'Arrives as a new order for that table'],
          ],
        },
        {
          type: 'p',
          text: 'We do not claim a fixed time saving per order; that depends on your kitchen. What disappears is the guessing: unreadable slips, forgotten notes and the question "table five ka kya hua?".',
        },
      ],
    },
    {
      id: 'hardware',
      heading: 'Hardware: use what you have',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'Screen.', text: 'Any tablet, spare phone, laptop or desktop with a modern browser. A 10-inch tablet is comfortable for most kitchens.' },
            { lead: 'Placement.', text: 'At the pass or where the head cook stands, away from direct heat and water. A simple wall or stand mount helps.' },
            { lead: 'Sound.', text: 'Keep the device volume up so new orders are heard.' },
            { lead: 'Internet.', text: 'Orders arrive over the internet, so the kitchen needs a steady Wi-Fi or mobile connection.' },
            { lead: 'Printer, optional.', text: 'For KOTs, use the printer you already have through the browser’s print window.' },
          ],
        },
      ],
    },
    {
      id: 'rush-hour',
      heading: 'Running the screen in a rush hour',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'One person owns the screen.', text: 'Usually the head cook or the person at the pass. They accept orders and call them out to the line.' },
            { lead: 'Accept quickly, even if cooking starts later.', text: 'Accepting tells the guest and the cashier that the kitchen has seen the order, which stops waiters coming in to check.' },
            { lead: 'Mark ready the moment the plate is up.', text: 'The cashier and guest rely on it. A screen that is updated late is worse than none.' },
            { lead: 'Keep notes visible.', text: 'Read the guest’s note before cooking, not after plating. Notes such as "no onion" are on the same ticket for this reason.' },
            { lead: 'Check the screen at shift change.', text: 'Anything still open should be handed over by name, so nothing is lost between shifts or forgotten when the next cook takes over the pass.' },
          ],
        },
      ],
    },
    {
      id: 'fit',
      heading: 'Who it suits, and who needs more',
      blocks: [
        {
          type: 'p',
          text: 'The MenusQR kitchen screen suits single restaurants, cafés, dhabas and small groups where one kitchen cooks everything, and where most orders come from tables or from your own takeaway and delivery link. It is part of the Premium plan along with table ordering and billing, so there is nothing else to connect.',
        },
        {
          type: 'p',
          text: 'Very large kitchens that split each order across many stations (tandoor, Chinese, bar, dessert) on separate screens, or chains that route orders to a central kitchen, usually need a full POS with station routing. If that is you, say so when you call us and we will tell you honestly whether MenusQR fits.',
        },
      ],
    },
    {
      id: 'with-ordering',
      heading: 'Kitchen screen with QR ordering and billing',
      blocks: [
        {
          type: 'p',
          text: 'The kitchen screen is the middle of a three-part flow. Guests order from the table on their phones; the kitchen sees the order and marks it ready; the cashier sees every round for that table on one running bill and prints a receipt with CGST, SGST and round-off. Because all three use the same order, the bill always matches what the kitchen cooked.',
        },
      ],
      links: [
        { to: '/qr-ordering-for-restaurants', label: 'How QR table ordering works' },
        { to: '/restaurant-billing-software', label: 'Billing and receipts' },
      ],
    },
    {
      id: 'getting-started',
      heading: 'Getting started',
      blocks: [
        {
          type: 'steps',
          items: [
            { lead: 'Choose Premium.', text: 'Ordering, the kitchen screen and billing come together at ₹1,119 a month or ₹6,799 a year.' },
            { lead: 'Set up the menu and table codes.', text: 'The first menu is set up for you; print one QR per table.' },
            { lead: 'Open the orders screen on the kitchen device.', text: 'Log in once and keep the screen on.' },
            { lead: 'Run test orders.', text: 'Place two or three orders from a table on a quiet afternoon and walk the staff through accept, preparing and ready.' },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: 'What is a KDS in a restaurant?',
      answer: 'KDS stands for kitchen display system: a screen in the kitchen that shows orders in place of paper slips and lets staff mark each order as preparing and ready.',
    },
    {
      question: 'Do I need a special KDS device?',
      answer: 'No. The MenusQR kitchen screen runs in a browser on any tablet, phone or computer.',
    },
    {
      question: 'Can I still print KOTs?',
      answer: 'Yes. A KOT can be printed from the order for kitchens or stations that prefer paper.',
    },
    {
      question: 'Which plan includes the kitchen screen?',
      answer: 'Premium, at ₹1,119 a month or ₹6,799 a year, together with table ordering and billing.',
    },
  ],
  related: [
    { to: '/guides/kot-kitchen-order-ticket', label: 'What is a KOT' },
    { to: '/guides/reduce-order-mistakes', label: 'Reduce order mistakes' },
    { to: '/restaurant-software', label: 'Everything MenusQR does' },
  ],
  cta: {
    heading: 'Put your orders on a screen',
    text: 'Premium includes the kitchen screen, table ordering and billing. No commission.',
    to: '/plans',
    label: 'See the Premium plan',
  },
};
