import type { LongFormPage } from '../types.ts';

export const kotKitchenOrderTicket: LongFormPage = {
  path: '/guides/kot-kitchen-order-ticket',
  label: 'What is a KOT',
  title: 'What Is a KOT (Kitchen Order Ticket)? A Simple Guide',
  description:
    'What a KOT is, what goes on it, how it differs from the bill, why it stops leakage and how to run KOTs on paper or on a kitchen screen.',
  h1: 'What Is a KOT (Kitchen Order Ticket) and How to Use It Well',
  intro:
    'A KOT, or kitchen order ticket, is the slip that tells the kitchen what to cook. It looks like a small thing, but a restaurant that runs KOTs properly makes fewer mistakes, wastes less food and can match every plate that left the kitchen to a bill. This guide explains how.',
  updated: '2026-11-15',
  sections: [
    {
      id: 'what-is-a-kot',
      heading: 'What a KOT is',
      blocks: [
        {
          type: 'p',
          text: 'When a waiter takes an order, the kitchen needs a written instruction it can cook from. That instruction is the KOT. In most Indian restaurants it is printed on a small thermal printer or written in a numbered KOT book with a carbon copy. One copy goes to the kitchen; the other stays with the counter so the bill can be made from it later.',
        },
        {
          type: 'p',
          text: 'A table usually gets several KOTs in one visit: one for starters, one for main course, one for the extra rotis and one for dessert. All of them together make up the bill. That is the core idea: nothing is cooked without a KOT, and nothing is billed that does not have one.',
        },
      ],
    },
    {
      id: 'what-goes-on-it',
      heading: 'What goes on a KOT',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'KOT number.', text: 'A running number, so a missing or duplicate ticket is easy to spot.' },
            { lead: 'Table number or order type.', text: 'Table 7, takeaway, or delivery. Without it the food goes to the wrong place.' },
            { lead: 'Date and time.', text: 'Shows how long an order has been waiting and helps when a guest complains.' },
            { lead: 'Items and quantity.', text: 'Written the way the kitchen knows them, with half or full portions.' },
            { lead: 'Notes.', text: 'Less spicy, no onion, Jain, serve with the main course. The note travels with the dish.' },
            { lead: 'Waiter or captain name.', text: 'So the kitchen knows whom to call when a dish is ready or a question comes up.' },
          ],
        },
        {
          type: 'p',
          text: 'Prices are usually left off the KOT. The kitchen does not need them, and leaving them off keeps the ticket short and easy to read at a glance.',
        },
      ],
    },
    {
      id: 'kot-vs-bill',
      heading: 'KOT and bill: how they differ',
      blocks: [
        {
          type: 'table',
          caption: 'Differences between a KOT and a bill',
          head: ['', 'KOT', 'Bill'],
          rows: [
            ['Who reads it', 'Kitchen staff', 'The guest'],
            ['When it is made', 'Each time something is ordered', 'Once, at the end of the meal'],
            ['Shows prices', 'Usually not', 'Yes, with taxes and total'],
            ['How many per table', 'Several', 'One'],
            ['What it proves', 'That a dish was asked for', 'What the guest has to pay'],
          ],
        },
        {
          type: 'p',
          text: 'The bill should always equal the sum of the KOTs for that table, minus anything cancelled. When the two do not match, either a dish went out without being billed or something was billed that was never cooked. Both are worth finding out about.',
        },
      ],
    },
    {
      id: 'why-it-matters',
      heading: 'Why KOTs matter more than they look',
      blocks: [
        {
          type: 'p',
          text: 'The first reason is accuracy. A cook working from a printed or clearly written ticket makes fewer mistakes than one working from a shouted order. Notes such as "no garlic" are not forgotten between the table and the stove.',
        },
        {
          type: 'p',
          text: 'The second reason is control. In a restaurant without KOTs it is possible for food to leave the kitchen without ever reaching a bill, whether by mistake or on purpose. A strict rule of "no KOT, no cooking" closes that gap. At the end of the day the manager can count KOTs, count bills and see whether they agree.',
        },
        {
          type: 'p',
          text: 'The third reason is timing. A KOT with a time on it lets the kitchen cook in order, and lets the manager see which table has waited too long. During a rush this is the difference between a calm pass and an angry floor.',
        },
      ],
    },
    {
      id: 'cancellations',
      heading: 'Handling changes and cancellations',
      blocks: [
        {
          type: 'p',
          text: 'Guests change their minds. A dish ordered by mistake, a starter that took too long, a table that leaves early. How you handle this decides whether your KOT system stays honest.',
        },
        {
          type: 'steps',
          items: [
            { lead: 'Never tear up a KOT.', text: 'Mark it cancelled and keep it. A missing number in the sequence should always have an explanation.' },
            { lead: 'Write the reason.', text: 'Guest changed order, kitchen ran out, wrong item taken. Two words are enough.' },
            { lead: 'Let one person approve.', text: 'Usually the manager or captain. Cancellations approved by anyone become a leak.' },
            { lead: 'Check if the dish was already cooked.', text: 'Cooked and cancelled dishes are wastage. Count them, because they tell you where service is going wrong.' },
          ],
        },
      ],
    },
    {
      id: 'paper-vs-screen',
      heading: 'Paper KOT or kitchen screen?',
      blocks: [
        {
          type: 'p',
          text: 'A paper KOT is cheap, works without electricity once printed and every cook understands it. Its weakness is that it gets wet, gets lost and cannot tell the waiter when the food is ready.',
        },
        {
          type: 'p',
          text: 'A kitchen screen, sometimes called a KDS or kitchen display system, shows the same information on a tablet or monitor. Orders appear in sequence, staff tap to mark them as being prepared or ready, and the waiter or cashier sees the change. Nothing gets lost under a pan.',
        },
        {
          type: 'p',
          text: 'Many kitchens use both: a screen for tracking and a printed ticket for the station that cooks the dish. If your kitchen is very hot or very wet, put the screen where it is protected and readable, not over the tandoor.',
        },
      ],
    },
    {
      id: 'qr-ordering-kot',
      heading: 'KOTs when guests order by QR',
      blocks: [
        {
          type: 'p',
          text: 'When guests order from their phones, the order itself becomes the KOT. In MenusQR an order placed from a table appears on the orders screen with the table, the items, portions, add-ons and the guest’s note. Staff accept it, mark it as preparing and then ready, and a KOT can be printed for kitchens that want paper. Every round from that table is added to one running bill, so the "sum of KOTs equals the bill" rule holds without anyone adding slips by hand.',
        },
        {
          type: 'p',
          text: 'Waiter-taken orders still fit in: the cashier can add dishes to the same table’s bill, so phone orders and spoken orders end up together.',
        },
      ],
      links: [{ to: '/qr-ordering-for-restaurants', label: 'How QR ordering, the kitchen screen and billing fit together' }],
    },
    {
      id: 'mistakes',
      heading: 'Common KOT mistakes',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'Unreadable handwriting.', text: 'If a cook has to guess, the KOT has already failed. Print, or use capital letters and fixed short forms.' },
            { lead: 'Short forms only one waiter knows.', text: 'Keep a single list of short forms on the kitchen wall.' },
            { lead: 'Notes on a separate slip.', text: 'The note belongs on the same ticket as the dish.' },
            { lead: 'KOTs for "staff food" and tastings left out.', text: 'Make a KOT for them too, marked as such, so wastage and staff meals are counted.' },
            { lead: 'No end-of-day check.', text: 'Matching KOTs to bills only helps if somebody actually does it.' },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: 'What is the full form of KOT in a restaurant?',
      answer: 'KOT stands for kitchen order ticket: the slip or screen entry that tells the kitchen what to cook for a table or order.',
    },
    {
      question: 'Does a KOT show prices?',
      answer: 'Usually not. The kitchen needs the items, quantities, table and notes. Prices go on the bill.',
    },
    {
      question: 'Is a KOT the same as a bill?',
      answer: 'No. A table may have several KOTs during a meal but only one bill. The bill should equal the KOTs minus anything cancelled.',
    },
    {
      question: 'Can I use a tablet in place of KOT paper?',
      answer: 'Yes. A kitchen screen shows the same details, keeps orders in sequence and lets staff mark them ready. Some kitchens keep a printer as well.',
    },
  ],
  related: [
    { to: '/guides/reduce-order-mistakes', label: 'How to reduce order mistakes' },
    { to: '/qr-ordering-for-restaurants', label: 'QR ordering for restaurants' },
    { to: '/guides', label: 'All guides' },
  ],
  cta: {
    heading: 'Orders, kitchen screen and bill in one place',
    text: 'The Premium plan includes table ordering, a kitchen screen and cashier billing at ₹1,119 a month or ₹6,799 a year.',
    to: '/plans',
    label: 'See the Premium plan',
  },
};
