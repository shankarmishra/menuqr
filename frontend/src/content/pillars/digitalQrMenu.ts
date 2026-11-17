import type { LongFormPage } from '../types.ts';

export const digitalQrMenu: LongFormPage = {
  path: '/digital-qr-menu',
  label: 'Digital QR Menu',
  title: 'Digital QR Menu: What It Is and How It Works | MenusQR',
  description:
    'What a digital QR menu is, how it works on a guest’s phone, what it replaces, what it costs in India and when a printed menu is still the better choice.',
  h1: 'Digital QR Menu: What It Is, How It Works and Who Needs One',
  intro:
    'A digital QR menu is your restaurant’s menu on a web page, opened by scanning a QR code on the table. The printed code stays the same for years; the dishes, prices and availability behind it can change every day. This page explains how it works, what it replaces and where it does not help.',
  updated: '2026-11-14',
  sections: [
    {
      id: 'what-it-is',
      heading: 'What is a digital QR menu?',
      blocks: [
        {
          type: 'p',
          text: 'A digital QR menu has two parts. The first is a menu page on the internet with your categories, dishes, photos and prices. The second is a QR code printed on a sticker, tent card or acrylic stand that points to that page. A guest opens the phone camera, points it at the code and the menu opens in the browser. There is no app to install and no account to create.',
        },
        {
          type: 'p',
          text: 'The important word is "digital", not "QR". Many restaurants already have a QR code that opens a PDF or a photo of the printed card. That is a scanned menu, not a digital one. The guest has to pinch and zoom, the file is slow on mobile data, and changing one price means making a new file. A real digital menu is a page built for a phone screen: text that is readable without zooming, categories you can jump between, and content the owner can edit from a dashboard.',
        },
      ],
    },
    {
      id: 'how-it-works',
      heading: 'How it works, from scan to dish',
      blocks: [
        {
          type: 'steps',
          items: [
            { lead: 'The guest scans the code.', text: 'Every phone camera made in the last several years reads QR codes without a separate scanner app.' },
            { lead: 'The menu opens in the browser.', text: 'The page loads over mobile data or your Wi-Fi. Nothing is downloaded or installed.' },
            { lead: 'The guest browses.', text: 'Categories such as Starters, Main Course and Beverages sit at the top. Each dish shows its name, price, a veg or non-veg mark and, if you add one, a photo and a short description.' },
            { lead: 'The guest decides and orders.', text: 'On a view-only menu the guest tells the waiter as usual. With table ordering switched on, the guest adds dishes to a cart and sends the order from the phone.' },
          ],
        },
        {
          type: 'p',
          text: 'On the owner’s side there is a dashboard. You log in on a phone or laptop, change a price, hide a dish or mark it sold out, and the menu page shows the change the next time a guest opens it. The QR code on the table is not touched.',
        },
      ],
      links: [{ to: '/how-it-works', label: 'See the setup steps with screenshots' }],
    },
    {
      id: 'permanent-qr',
      heading: 'Why the QR code never needs reprinting',
      blocks: [
        {
          type: 'p',
          text: 'A QR code is only a link written as a pattern. If the link points to a fixed file, the code dies when the file changes. MenusQR prints a link to your restaurant’s menu address instead, and that address does not change when the content does. You can rewrite the whole menu, switch to a different design or add a new category and the code already stuck on forty tables keeps working.',
        },
        {
          type: 'p',
          text: 'Each table can also have its own code. The link carries a hidden table code, so when a guest orders from table 7 the order arrives marked as table 7 without the guest typing anything. A copied or photographed code from one table cannot be used to place orders against another.',
        },
      ],
    },
    {
      id: 'vs-printed',
      heading: 'Digital QR menu vs printed menu vs PDF menu',
      blocks: [
        {
          type: 'table',
          caption: 'How the three kinds of menu compare in daily use',
          head: ['', 'Printed card', 'PDF behind a QR', 'Digital QR menu'],
          rows: [
            ['Change a price', 'Reprint or sticker over it', 'Make and upload a new file', 'Edit in the dashboard, live at once'],
            ['Dish runs out at 8 pm', 'Waiter has to say sorry', 'Waiter has to say sorry', 'Mark it sold out for today'],
            ['Reading on a phone', 'Not needed', 'Pinch and zoom', 'Built for the phone screen'],
            ['Dish photos', 'Costly to print', 'Makes the file heavy', 'One photo per dish, loaded when needed'],
            ['Guest can order from it', 'No', 'No', 'Yes, on the Premium plan'],
            ['Works without internet', 'Yes', 'No', 'No'],
          ],
        },
        {
          type: 'p',
          text: 'The last row matters. A digital menu needs a working data connection on the guest’s phone or a Wi-Fi network in the restaurant. In a basement, a highway stretch with weak signal or a place where most guests carry feature phones, keep a few printed cards as a backup.',
        },
      ],
    },
    {
      id: 'what-guests-see',
      heading: 'What your guests see',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'Veg and non-veg marks.', text: 'Every dish carries the green or red mark Indian diners look for first.' },
            { lead: 'Half and full portions.', text: 'One dish can show separate prices for half and full, or for sizes such as regular and large.' },
            { lead: 'Add-ons.', text: 'Extra cheese, an extra roti or a choice of gravy can be listed with its own price.' },
            { lead: 'Diet and allergen tags.', text: 'Mark a dish as Jain, eggless or spicy and list allergens such as nuts or dairy.' },
            { lead: 'Sold out today.', text: 'A dish that has run out stays visible with a "Sold out today" label and comes back by itself the next day.' },
            { lead: 'Serving hours.', text: 'A category such as Breakfast can be given a time window. Outside it, guests still see the dishes but cannot order them.' },
            { lead: 'Your look.', text: 'Ready-made designs for Indian food businesses, from a simple dhaba list to a photo-led café menu.' },
          ],
        },
      ],
      links: [{ to: '/templates', label: 'Browse the menu designs' }],
    },
    {
      id: 'benefits',
      heading: 'What changes for the restaurant',
      blocks: [
        {
          type: 'p',
          text: 'The first saving is printing. A restaurant that changes prices twice a year and reprints thirty laminated cards each time pays for design, printing and lamination again and again. With a digital menu the only thing printed is the QR code, once.',
        },
        {
          type: 'p',
          text: 'The second is accuracy. The menu the guest reads is the menu the kitchen can cook today. Nobody chooses a dish for five minutes and then hears it is finished. Seasonal items, festival specials and a new combo can go live the same afternoon you think of them and come off just as quickly.',
        },
        {
          type: 'p',
          text: 'The third is time at the table. Guests start reading the moment they sit down, so the waiter’s first visit is to take the order, not to hand over a card and come back later. How much time this saves depends on your service style, so we do not put a number on it.',
        },
      ],
    },
    {
      id: 'limits',
      heading: 'When a digital QR menu is not the right choice',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'Weak mobile signal and no Wi-Fi.', text: 'If pages will not load at your tables, guests will get annoyed. Test from several tables before you remove printed cards.' },
            { lead: 'Guests who prefer a card.', text: 'Older diners and large family groups often want something to pass around. Keeping a few printed menus costs little.' },
            { lead: 'A menu that never changes.', text: 'If you sell eight items at prices that have not moved in two years, the saving is small. The gain then is mostly photos and a cleaner look.' },
            { lead: 'Nobody to keep it updated.', text: 'A digital menu with last month’s prices is worse than a printed one. One person should own it.' },
          ],
        },
      ],
    },
    {
      id: 'cost',
      heading: 'What a digital QR menu costs in India',
      blocks: [
        {
          type: 'p',
          text: 'You pay for the software, usually by the month or year, and once for printing the QR codes. MenusQR has three plans, priced per restaurant:',
        },
        {
          type: 'table',
          caption: 'MenusQR plans',
          head: ['Plan', 'Monthly', 'Yearly', 'What it is for'],
          rows: [
            ['Basic', '₹559', '₹1,999', 'A digital menu and QR code. We set up the menu for you; one edit is included.'],
            ['Intermediate', '₹959', '₹3,199', 'Edit the menu yourself as often as you like, premium designs and menu analytics.'],
            ['Premium', '₹1,119', '₹6,799', 'Everything above plus ordering from the table, a kitchen screen and cashier billing.'],
          ],
        },
        {
          type: 'p',
          text: 'Printing is separate and depends on what you choose: paper stickers cost a few rupees each, acrylic stands cost more and last longer. Because the code never changes, this is a one-time cost.',
        },
      ],
      links: [
        { to: '/qr-menu-price-india', label: 'Full breakdown of QR menu costs in India' },
        { to: '/plans', label: 'Compare the plans in detail' },
        { to: '/qr-menu-for-restaurants', label: 'How to set up a QR menu, step by step' },
      ],
    },
    {
      id: 'ordering',
      heading: 'From menu to ordering',
      blocks: [
        {
          type: 'p',
          text: 'A digital menu is the first step. Once guests are already reading the menu on their phones, letting them send the order from the same screen is a small change for them and a large one for a busy floor. On the Premium plan the order goes to a kitchen screen, and the cashier sees one running bill for each table. You can start with a view-only menu and switch ordering on later; the QR codes stay the same.',
        },
      ],
      links: [{ to: '/qr-ordering-for-restaurants', label: 'How QR table ordering works' }],
    },
  ],
  faqs: [
    {
      question: 'Do guests need to download an app to open a digital QR menu?',
      answer: 'No. The menu is a web page. The phone camera reads the QR code and opens the menu in the browser already on the phone.',
    },
    {
      question: 'Does the QR code change when I edit the menu?',
      answer: 'No. The code points to your restaurant’s menu address, which stays the same. Price changes, new dishes and a new design all appear behind the same printed code.',
    },
    {
      question: 'Is a PDF behind a QR code a digital menu?',
      answer: 'It is a scanned menu. A PDF is hard to read on a phone, slow on mobile data and has to be replaced as a whole file for every change. A digital menu is a phone-sized page you edit dish by dish.',
    },
    {
      question: 'Can I show half and full prices?',
      answer: 'Yes. One dish can carry separate prices for half and full or for other sizes, and add-ons can have their own prices.',
    },
    {
      question: 'What happens if the internet is down?',
      answer: 'Guests need mobile data or Wi-Fi to open the menu. Keep a few printed cards for the rare day the network fails.',
    },
    {
      question: 'How much does a digital QR menu cost?',
      answer: 'MenusQR starts at ₹559 a month or ₹1,999 a year for the Basic plan. Printing the QR codes is a separate, one-time cost.',
    },
    {
      question: 'Can I change the menu myself?',
      answer: 'On the Intermediate and Premium plans you can add, edit and remove dishes yourself at any time. The Basic plan includes the first setup and one edit done for you.',
    },
  ],
  related: [
    { to: '/qr-menu-for-restaurants', label: 'QR menu for restaurants: setup and cost' },
    { to: '/qr-ordering-for-restaurants', label: 'QR ordering for restaurants' },
    { to: '/templates', label: 'Menu designs' },
    { to: '/faq', label: 'All questions and answers' },
  ],
  cta: {
    heading: 'See the plans',
    text: 'Start with a digital menu from ₹559 a month, or ₹1,999 for the year.',
    to: '/plans',
    label: 'View plans and pricing',
  },
};
