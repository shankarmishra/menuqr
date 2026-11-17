import type { LongFormPage } from '../types.ts';

export const reduceOrderMistakes: LongFormPage = {
  path: '/guides/reduce-order-mistakes',
  label: 'Reduce order mistakes',
  title: 'How to Reduce Order Mistakes in a Restaurant',
  description:
    'Why wrong orders happen between the table and the kitchen, and ten practical fixes, from reading the order back to sold-out updates and QR ordering.',
  h1: 'How to Reduce Order Mistakes in Your Restaurant',
  intro:
    'A wrong dish costs you twice: the food that goes back and the guest who does not come again. Most order mistakes are not about careless staff. They come from the way an order travels from the guest to the cook. Fix the path and the mistakes drop.',
  updated: '2026-11-15',
  sections: [
    {
      id: 'where-mistakes-happen',
      heading: 'Where order mistakes come from',
      blocks: [
        {
          type: 'p',
          text: 'Follow one order through a busy evening. The guest says it in a noisy room. The waiter writes it quickly, perhaps in a private short form. The slip is carried to the kitchen and read by a cook who is already making four other dishes. The finished plate is picked up by someone who did not take the order and carried to a table identified only by memory. Every hand-off is a chance for something to change.',
        },
        {
          type: 'list',
          items: [
            { lead: 'Hearing.', text: 'Paneer tikka and paneer tikka masala sound alike across a loud room.' },
            { lead: 'Writing.', text: 'Hurried handwriting and short forms that the cook reads differently.' },
            { lead: 'Changes.', text: '"Less spicy" or "no onion" said aloud but not written down.' },
            { lead: 'Availability.', text: 'A dish ordered after the kitchen has run out of it, then swapped without asking.' },
            { lead: 'Table identity.', text: 'Food for table 12 served to table 21.' },
            { lead: 'Portions.', text: 'Half ordered, full served, and the bill disagrees with both.' },
          ],
        },
      ],
    },
    {
      id: 'fixes',
      heading: 'Ten fixes that work',
      blocks: [
        {
          type: 'steps',
          items: [
            { lead: 'Read the order back.', text: 'The waiter repeats the full order, including portions and notes, before leaving the table. It takes fifteen seconds and catches a large share of hearing mistakes.' },
            { lead: 'One list of short forms.', text: 'Agree on short forms for every dish and put the list up in the kitchen. Nobody invents their own.' },
            { lead: 'Notes on the ticket, not in the head.', text: 'Every request is written on the same KOT as the dish it belongs to.' },
            { lead: 'Number every table clearly.', text: 'A visible number on each table, and a floor plan at the pass for new staff.' },
            { lead: 'Seat numbers for big groups.', text: 'For tables of six or more, note which seat ordered what, so the right plate reaches the right person.' },
            { lead: 'Update sold-out items before service.', text: 'Tell waiters what has run out at the start of service and the moment something else runs out.' },
            { lead: 'Check at the pass.', text: 'One person compares each plate to its KOT before it leaves the kitchen. In a small restaurant this can be the cook who plates.' },
            { lead: 'Give dishes distinct names.', text: 'If two dishes are often confused, rename one. "Paneer Tikka (dry)" and "Paneer Tikka Masala (gravy)" are harder to mix up.' },
            { lead: 'Keep a mistakes log.', text: 'Write down every wrong order for two weeks: what, which table, at which step. Patterns appear fast.' },
            { lead: 'Let guests write their own order.', text: 'With QR ordering, the guest picks the dish, portion and note on their phone. Nothing is heard or rewritten.' },
          ],
        },
      ],
    },
    {
      id: 'sold-out',
      heading: 'The sold-out problem',
      blocks: [
        {
          type: 'p',
          text: 'A surprising number of order problems start with a dish that is no longer available. The guest orders it, the kitchen sends back word that it is finished, the waiter returns to the table, and the guest has to choose again while their friends are already eating. Sometimes the kitchen quietly makes something similar, which is worse.',
        },
        {
          type: 'p',
          text: 'The fix is to make "sold out" visible before the guest chooses. On a printed menu that means waiters announcing it. On a digital menu it means one tap: in MenusQR a dish marked sold out shows "Sold out today" on the guest’s menu, cannot be ordered and comes back automatically the next day, so nobody has to remember to switch it on again.',
        },
      ],
      links: [{ to: '/digital-qr-menu', label: 'How a digital QR menu handles sold-out dishes' }],
    },
    {
      id: 'portions-addons',
      heading: 'Portions and add-ons',
      blocks: [
        {
          type: 'p',
          text: 'Half and full portions, regular and large sizes, extra cheese, butter or plain naan: these small choices cause a large share of disputes at billing time. The guest remembers ordering a half; the kitchen made a full; the bill shows something else again.',
        },
        {
          type: 'list',
          items: [
            { lead: 'Write the portion every time.', text: 'Make "H" or "F" compulsory on the KOT, even when most guests order full.' },
            { lead: 'Price add-ons separately on the menu.', text: 'If extra cheese costs extra, the guest should see that before ordering.' },
            { lead: 'Use the same names on the menu, the KOT and the bill.', text: 'When all three agree, a disagreement is easy to trace.' },
          ],
        },
      ],
    },
    {
      id: 'training',
      heading: 'Training that sticks',
      blocks: [
        {
          type: 'p',
          text: 'New staff make the most mistakes, and they usually join just before the busiest season. A short routine helps more than a long lecture:',
        },
        {
          type: 'steps',
          items: [
            { lead: 'Taste the menu.', text: 'A waiter who has tasted the dishes describes them better and confuses them less.' },
            { lead: 'Shadow for two services.', text: 'Pair the new person with an experienced waiter before giving them their own section.' },
            { lead: 'Quiz the short forms.', text: 'Five minutes before service on the first few days.' },
            { lead: 'Review the mistakes log together.', text: 'Once a week, without blame. The goal is to fix the step, not punish the person.' },
          ],
        },
      ],
    },
    {
      id: 'qr-ordering',
      heading: 'Where QR ordering helps, and where it does not',
      blocks: [
        {
          type: 'p',
          text: 'When guests order from the table on their own phones, three hand-offs disappear: hearing, writing and rewriting. The dish, the portion, the add-ons and the note are chosen by the guest and arrive on the kitchen screen exactly as chosen, marked with the right table because each table has its own QR code. A second round from the same table is added to the same bill.',
        },
        {
          type: 'p',
          text: 'It does not fix everything. A dish can still be plated wrong, a runner can still go to the wrong table, and some guests will always prefer to tell a waiter. Keep the pass check and the table numbers. QR ordering removes the mistakes that happen before the kitchen; the kitchen still has to get its part right.',
        },
      ],
      links: [{ to: '/qr-ordering-for-restaurants', label: 'How QR ordering works from table to bill' }],
    },
  ],
  faqs: [
    {
      question: 'What is the most common cause of wrong orders?',
      answer: 'In most restaurants it is the hand-off: an order heard in a noisy room, written quickly and read by someone else. Reading the order back and writing notes on the ticket fix much of it.',
    },
    {
      question: 'How do I stop guests ordering dishes that have run out?',
      answer: 'Tell waiters at the start of service, and on a digital menu mark the dish sold out so guests cannot choose it.',
    },
    {
      question: 'Does QR ordering remove all order mistakes?',
      answer: 'No. It removes mistakes in hearing and writing the order. Plating and serving the right table still depend on the kitchen and the floor staff.',
    },
  ],
  related: [
    { to: '/guides/kot-kitchen-order-ticket', label: 'What a KOT is and how to use it' },
    { to: '/guides/restaurant-menu-design-tips', label: 'Menu design tips' },
    { to: '/guides', label: 'All guides' },
  ],
  cta: {
    heading: 'Let guests order from the table',
    text: 'Premium includes QR ordering, the kitchen screen and cashier billing.',
    to: '/plans',
    label: 'Compare plans',
  },
};
