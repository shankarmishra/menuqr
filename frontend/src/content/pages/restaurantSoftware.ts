import type { LongFormPage } from '../types.ts';

export const restaurantSoftware: LongFormPage = {
  path: '/restaurant-software',
  label: 'Restaurant Software',
  title: 'Restaurant Software for Small Restaurants in India | MenusQR',
  description:
    'One simple restaurant software for Indian restaurants, cafés and dhabas: digital menu, menu designs, QR ordering, kitchen screen, billing, feedback and reports.',
  h1: 'Restaurant Software for Small and Mid-Size Restaurants in India',
  intro:
    'MenusQR is restaurant software built around the menu. It gives an Indian restaurant, café or dhaba a designed digital menu, ordering from the table, a kitchen screen, a cashier screen with printed bills, guest feedback and simple reports, all in the browser and without commission. This page lists everything it does, what it does not do, and who it suits.',
  updated: '2026-11-15',
  sections: [
    {
      id: 'at-a-glance',
      heading: 'MenusQR at a glance',
      blocks: [
        {
          type: 'table',
          caption: 'What MenusQR includes and on which plan',
          head: ['Part', 'What it does', 'Plan'],
          rows: [
            ['Digital menu', 'Your full menu on a phone-friendly page, opened by a QR code that never needs reprinting', 'All plans'],
            ['Menu designs', 'Ready-made designs themed for Indian food and for cafés, bars and fine dining', 'More designs on Intermediate and Premium'],
            ['Menu editing', 'Change dishes, prices, photos and sold-out status yourself', 'Intermediate and Premium (Basic: one edit)'],
            ['Table ordering', 'Guests order from their phones; each table has its own code', 'Premium'],
            ['Kitchen screen', 'New orders appear with a sound; staff accept, prepare and mark ready', 'Premium'],
            ['Cashier and billing', 'One running bill per table, printed thermal-style receipt, cash/UPI/card recorded', 'Premium'],
            ['Feedback', 'Private ratings and comments from diners, visible only to you', 'All plans with the menu'],
            ['Reports', 'Menu visits, busy hours, best-selling dishes, dine-in vs delivery', 'Intermediate and Premium'],
          ],
        },
      ],
      links: [{ to: '/plans', label: 'Compare the plans' }],
    },
    {
      id: 'menu-and-designs',
      heading: 'A menu that looks like your restaurant',
      blocks: [
        {
          type: 'p',
          text: 'Most QR menu tools give every restaurant the same list with a different colour. MenusQR has a set of complete menu designs, several of them made for particular kinds of Indian food: Rang-e-Punjab for a Punjabi or dhaba-style menu, Dakshin Heritage for South Indian food, Bombay Chowk for street food and chaat, Thali & Co for thali and home-style meals, and Maharaja Table for a royal or heritage look. There are also designs for cafés, bars, Japanese and Mediterranean menus, and a chalkboard style.',
        },
        {
          type: 'p',
          text: 'Every design carries what Indian guests look for: veg and non-veg marks, half and full prices side by side, add-ons, Jain and allergen tags, and a "sold out today" label that resets by itself the next morning. Categories can be given serving hours, so a breakfast section stops taking orders at the time you set. The Design Studio lets you set colours, logo and photos without touching code.',
        },
      ],
      links: [{ to: '/templates', label: 'See all menu designs' }],
    },
    {
      id: 'getting-the-menu-in',
      heading: 'Getting your menu in',
      blocks: [
        {
          type: 'p',
          text: 'On every plan the first menu is set up for you from the menu you already have. You share it during onboarding and we enter the categories, dishes, prices and marks. If you prefer to do it yourself, the dashboard can import a menu from an Excel or CSV sheet, and dishes can be added one by one from a phone. Photos taken on a phone can be uploaded directly; they are resized for fast loading.',
        },
      ],
      links: [{ to: '/qr-menu-for-restaurants', label: 'How setup works, step by step' }],
    },
    {
      id: 'ordering-kitchen-billing',
      heading: 'Ordering, kitchen and billing in one flow',
      blocks: [
        {
          type: 'steps',
          items: [
            { lead: 'Guest orders.', text: 'From the table QR, with portions, add-ons and a note. Dine-in, takeaway and delivery are supported, and you decide whether delivery is switched on.' },
            { lead: 'Kitchen cooks.', text: 'The order appears on the kitchen screen with the table number and a sound. Staff accept, mark it preparing and then ready. A KOT can be printed.' },
            { lead: 'Cashier bills.', text: 'Every round from a table adds to one running bill. Dishes ordered through a waiter are added by hand. The bill prints in thermal style with CGST, SGST and round-off.' },
            { lead: 'Guest sees the bill.', text: 'The guest can open the bill on the phone, and you record whether it was paid by cash, UPI or card.' },
          ],
        },
        {
          type: 'p',
          text: 'Everything runs in a web browser, so the kitchen and counter screens can be any phone, tablet or computer you already own. There is no commission on orders; you pay only the plan price.',
        },
      ],
      links: [
        { to: '/qr-ordering-for-restaurants', label: 'QR ordering in detail' },
        { to: '/kitchen-display-system', label: 'The kitchen screen' },
        { to: '/restaurant-billing-software', label: 'Billing and receipts' },
      ],
    },
    {
      id: 'feedback-reports',
      heading: 'Feedback and reports',
      blocks: [
        {
          type: 'p',
          text: 'Guests can leave a star rating and a comment from the menu. These stay private to you, so you hear about a cold dish before it becomes a public review. An optional Google Reviews add-on puts a "Write a Google review" button on your menu for happy guests.',
        },
        {
          type: 'p',
          text: 'Reports show how many people opened your menu each day, which hours are busiest, when orders arrive, your top five dishes by quantity and how orders split between dine-in and delivery. They are simple on purpose: enough to decide what to put at the top of the menu and when to add staff.',
        },
      ],
    },
    {
      id: 'what-it-does-not-do',
      heading: 'What MenusQR does not do',
      blocks: [
        {
          type: 'p',
          text: 'It is better to know this before you buy than after:',
        },
        {
          type: 'list',
          items: [
            { lead: 'No inventory or recipe stock tracking.', text: 'If you need to track raw material, you need a separate inventory tool or a full POS.' },
            { lead: 'No GST return filing or accounting.', text: 'Bills show taxes, but returns and books stay with your accountant or accounting software.' },
            { lead: 'No delivery marketplace.', text: 'Delivery orders come from your own menu link, not from an aggregator app, and you arrange the delivery.' },
            { lead: 'No offline billing.', text: 'Ordering and billing need an internet connection.' },
            { lead: 'Not built for large chains.', text: 'It is designed for single restaurants and small groups, not for central kitchens and dozens of outlets.' },
          ],
        },
      ],
    },
    {
      id: 'who-it-suits',
      heading: 'Who it suits',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'Restaurants that want their menu to look good on a phone', text: 'and to change it without reprinting.' },
            { lead: 'Cafés, dhabas, bars, bakeries and food trucks', text: 'that want a simple setup, done for them, at a small yearly price.' },
            { lead: 'Busy dine-in floors', text: 'where taking orders is the bottleneck and handwritten slips cause mistakes.' },
            { lead: 'Owners who do not want to pay commission', text: 'on orders from their own tables.' },
          ],
        },
        {
          type: 'p',
          text: 'If you need inventory, accounting, multiple kitchens and a large chain setup, a full POS system is the better choice, and you can still use MenusQR for the designed menu on top of it.',
        },
      ],
      links: [
        { to: '/qr-menu-for-cafes', label: 'Cafés' },
        { to: '/qr-menu-for-dhabas', label: 'Dhabas' },
        { to: '/qr-menu-for-bars-and-pubs', label: 'Bars and pubs' },
        { to: '/qr-menu-for-hotels', label: 'Hotels' },
      ],
    },
    {
      id: 'price',
      heading: 'What it costs',
      blocks: [
        {
          type: 'table',
          caption: 'MenusQR plans per restaurant',
          head: ['Plan', 'Monthly', 'Yearly', 'Includes'],
          rows: [
            ['Basic', '₹559', '₹1,999', 'Digital menu, QR code, menu set up for you, one edit'],
            ['Intermediate', '₹959', '₹3,199', 'Unlimited edits by you, premium designs, reports'],
            ['Premium', '₹1,119', '₹6,799', 'Everything, plus table ordering, kitchen screen and billing'],
          ],
        },
      ],
      links: [{ to: '/qr-menu-price-india', label: 'Monthly vs yearly maths and other costs' }],
    },
  ],
  faqs: [
    {
      question: 'Is MenusQR a POS system?',
      answer: 'It covers the parts a small restaurant uses most: menu, table ordering, kitchen screen and billing with printed receipts. It does not do inventory, accounting or GST returns, which a full POS may include.',
    },
    {
      question: 'Do I need to buy hardware?',
      answer: 'No. MenusQR runs in a web browser on phones, tablets and computers you already have. Receipts print through the browser to your existing printer.',
    },
    {
      question: 'Is there a commission on orders?',
      answer: 'No. You pay the plan price only, whatever your number of orders.',
    },
    {
      question: 'Can I start with only the menu and add ordering later?',
      answer: 'Yes. Start on Basic or Intermediate and upgrade to Premium when you want ordering, the kitchen screen and billing. The QR codes stay the same.',
    },
  ],
  related: [
    { to: '/templates', label: 'Menu designs' },
    { to: '/qr-ordering-for-restaurants', label: 'QR ordering' },
    { to: '/kitchen-display-system', label: 'Kitchen display system' },
    { to: '/restaurant-billing-software', label: 'Restaurant billing' },
  ],
  cta: {
    heading: 'Start with the menu, add the rest when you need it',
    text: 'Plans from ₹1,999 a year. The first menu is set up for you. No commission.',
    to: '/plans',
    label: 'See plans',
  },
};
