import type { LongFormPage } from '../types.ts';

export const qrMenuForRestaurants: LongFormPage = {
  path: '/qr-menu-for-restaurants',
  label: 'QR Menu for Restaurants',
  title: 'QR Menu for Restaurants in India: Setup and Cost | MenusQR',
  description:
    'How to set up a QR menu for a restaurant in India: what to prepare, the steps, where to place the QR codes, what it costs and the mistakes to avoid.',
  h1: 'QR Menu for Restaurants: How to Set One Up and What It Costs',
  intro:
    'This is a practical guide for a restaurant owner who has decided to try a QR menu and wants to do it properly. It covers what to get ready, the setup steps, where to put the codes, how to bring staff and guests along, what it costs and what usually goes wrong.',
  updated: '2026-11-14',
  sections: [
    {
      id: 'before-you-start',
      heading: 'What to get ready before you start',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'Your current menu.', text: 'A clear photo of the printed card, a PDF or a typed list. Check that every price is today’s price.' },
            { lead: 'Categories in the order you want.', text: 'Most restaurants put the sections that sell best at the top, not the ones that come first on the old card.' },
            { lead: 'Veg and non-veg for every dish.', text: 'This is the first thing an Indian guest checks. Do not leave any dish unmarked.' },
            { lead: 'Portions and add-ons.', text: 'Write down which dishes have half and full prices, sizes or extras such as an extra butter naan.' },
            { lead: 'Photos, if you have them.', text: 'Phone photos in daylight are enough. A menu with ten good photos is better than one with sixty poor ones.' },
            { lead: 'Number of tables.', text: 'Count dine-in tables and any counter or takeaway point that needs its own code.' },
            { lead: 'Your logo and restaurant name', text: 'as you want guests to see them.' },
          ],
        },
        {
          type: 'p',
          text: 'Also do one check that has nothing to do with software: sit at your farthest table, and at one in the corner, and open any website on your phone. If pages load slowly there, fix the Wi-Fi or plan to keep printed cards for those tables.',
        },
      ],
    },
    {
      id: 'setup-steps',
      heading: 'Setting up a QR menu, step by step',
      blocks: [
        {
          type: 'steps',
          items: [
            { lead: 'Choose a plan and pay.', text: 'Pick Basic, Intermediate or Premium on the plans page. Payment is online; you get a login for your owner dashboard.' },
            { lead: 'Send your menu.', text: 'During onboarding you share your menu and restaurant details. On every plan the first menu is set up for you from what you send.' },
            { lead: 'Pick a design.', text: 'Choose a menu design that suits your food and your room. Designs can be changed later without touching the QR codes.' },
            { lead: 'Check the menu on your own phone.', text: 'Read every category as a guest would. Look for wrong prices, missing veg marks and spelling. This is the step most owners skip.' },
            { lead: 'Create the table QR codes.', text: 'Enter your tables in the dashboard. Each table gets its own code, with the table number printed under it.' },
            { lead: 'Print and place them.', text: 'Download the QR sheet, print it and fix one code to each table.' },
            { lead: 'Brief your staff and go live.', text: 'Show every waiter how to scan and where to find the popular dishes. Then start with one section of the restaurant or go fully live.' },
          ],
        },
        {
          type: 'p',
          text: 'How long this takes depends mostly on how complete your menu is when you send it. A typed list with correct prices goes up much faster than a blurred photo of an old card.',
        },
      ],
      links: [{ to: '/how-it-works', label: 'See these steps with screenshots' }],
    },
    {
      id: 'placing-codes',
      heading: 'Where and how to place the QR codes',
      blocks: [
        {
          type: 'p',
          text: 'A code the guest has to hunt for is a code nobody scans. Put it where the eyes land when someone sits down: the middle of the table or the edge facing the seat, not under the napkin holder.',
        },
        {
          type: 'list',
          items: [
            { lead: 'Size.', text: 'Print the code at least 3 cm wide for a table stand. Larger is easier in dim light.' },
            { lead: 'Contrast.', text: 'Dark code on a white or very light background. Coloured or inverted codes fail on older phones.' },
            { lead: 'Material.', text: 'Paper stickers are cheapest and wear out with wet cloths. Laminated tent cards last longer. Acrylic stands cost the most and survive daily wiping.' },
            { lead: 'A line of instruction.', text: 'Print "Scan for menu" above the code, in English and in your local language. Some guests still do not know what the square is for.' },
            { lead: 'Table number.', text: 'Keep the table number visible under the code. If a stand moves to another table, staff can see the mismatch at once.' },
            { lead: 'One more at the entrance.', text: 'A larger code at the door or the waiting area lets people read the menu before they are seated.' },
          ],
        },
        {
          type: 'p',
          text: 'Do not laminate with a glossy film under bright spot lights; the reflection stops cameras from reading the code. Matt lamination scans better.',
        },
      ],
    },
    {
      id: 'writing-the-menu',
      heading: 'Writing a menu that works on a phone',
      blocks: [
        {
          type: 'p',
          text: 'A phone screen shows four or five dishes at a time. A menu that looked fine as one large card can feel endless when scrolled. A few habits make it easier to read:',
        },
        {
          type: 'list',
          items: [
            { lead: 'Short category names.', text: '"Tandoor" is better than "From Our Clay Oven Specialities".' },
            { lead: 'Six to twelve dishes per category.', text: 'Split anything longer, for example Paneer and Vegetables in place of one long Veg Main Course list.' },
            { lead: 'One line of description, only where it helps.', text: 'Guests know what dal makhani is. They may not know your house special.' },
            { lead: 'Photos for the dishes you want to sell.', text: 'Start with your best sellers and the high-margin items.' },
            { lead: 'Round, final prices.', text: 'Say clearly whether taxes are included, the same way your printed card does.' },
            { lead: 'Mark what is sold out.', text: 'Use the sold-out switch during service so the menu matches the kitchen.' },
          ],
        },
      ],
      links: [{ to: '/templates', label: 'See how different designs present a menu' }],
    },
    {
      id: 'staff-and-guests',
      heading: 'Bringing staff and guests along',
      blocks: [
        {
          type: 'p',
          text: 'A QR menu fails when staff see it as extra work or as a threat. Tell them what changes: they still greet the table, recommend dishes and take the order (unless you use table ordering). What goes away is carrying cards, wiping them and apologising for dishes that are finished.',
        },
        {
          type: 'p',
          text: 'For guests, the first two weeks decide the habit. Ask waiters to say one sentence when seating people: "The menu is on this code, I can also bring a card if you prefer." Keep five or six printed cards for those who ask. Most restaurants find the request for cards drops on its own; forcing it creates complaints.',
        },
        {
          type: 'p',
          text: 'Give one person the job of keeping the menu right, usually the owner or the manager on duty. That person marks items sold out, changes prices and adds specials. The dashboard works on a phone, so it can be done from the floor.',
        },
      ],
    },
    {
      id: 'cost',
      heading: 'What a QR menu costs a restaurant in India',
      blocks: [
        {
          type: 'p',
          text: 'There are two costs: the software subscription and the one-time printing of codes.',
        },
        {
          type: 'table',
          caption: 'MenusQR subscription, per restaurant',
          head: ['Plan', 'Monthly', 'Yearly', 'Choose it if'],
          rows: [
            ['Basic', '₹559', '₹1,999', 'Your menu rarely changes and you want it set up for you. One edit is included.'],
            ['Intermediate', '₹959', '₹3,199', 'You change prices or dishes often and want to do it yourself, with premium designs.'],
            ['Premium', '₹1,119', '₹6,799', 'You want guests to order from the table, with a kitchen screen and cashier billing.'],
          ],
        },
        {
          type: 'p',
          text: 'Paying yearly costs much less than twelve monthly payments on every plan. For printing, budget per table: a paper sticker is the cheapest, a laminated tent card is in the middle and an acrylic stand is the most expensive. Since the code does not change when the menu does, you pay this once and again only when a stand breaks or you add tables.',
        },
        {
          type: 'p',
          text: 'Compare that with what you spend today on designing, printing and laminating menu cards every time prices move. For many restaurants one avoided reprint covers the yearly Basic plan.',
        },
      ],
      links: [
        { to: '/qr-menu-price-india', label: 'QR menu price in India: every cost explained' },
        { to: '/plans', label: 'Full plan comparison' },
      ],
    },
    {
      id: 'mistakes',
      heading: 'Seven mistakes to avoid',
      blocks: [
        {
          type: 'steps',
          items: [
            { lead: 'Linking the code to a PDF.', text: 'It is slow, hard to read and has to be replaced for every change.' },
            { lead: 'Using a free QR generator with a short link.', text: 'If that service stops or starts charging, every printed code stops working.' },
            { lead: 'Removing all printed cards on day one.', text: 'Keep a few for guests who ask and for a network failure.' },
            { lead: 'Not testing in your own lighting.', text: 'Scan every code at its table, in the evening, before guests arrive.' },
            { lead: 'Uploading the menu and never opening it again.', text: 'An out-of-date digital menu loses trust faster than a printed one.' },
            { lead: 'Too many photos of poor quality.', text: 'A dark, blurred photo sells less than no photo.' },
            { lead: 'Forgetting the staff.', text: 'If the waiter cannot explain the code, the guest will not use it.' },
          ],
        },
      ],
    },
    {
      id: 'business-types',
      heading: 'Different kinds of food businesses',
      blocks: [
        {
          type: 'p',
          text: 'The steps are the same everywhere, but the details differ. A café cares about breakfast hours and seasonal drinks. A dhaba needs a simple list that loads fast on a highway connection. A bar has a long drinks list and happy-hour prices. A hotel has room service next to the restaurant. We have a separate page for each.',
        },
      ],
      links: [
        { to: '/qr-menu-for-cafes', label: 'Cafés' },
        { to: '/qr-menu-for-dhabas', label: 'Dhabas' },
        { to: '/qr-menu-for-bars-and-pubs', label: 'Bars and pubs' },
        { to: '/qr-menu-for-hotels', label: 'Hotels' },
        { to: '/qr-menu-for-bakeries', label: 'Bakeries' },
        { to: '/qr-menu-for-food-trucks', label: 'Food trucks' },
      ],
    },
  ],
  faqs: [
    {
      question: 'How do I make a QR code menu for my restaurant?',
      answer: 'Choose a plan, send your menu during onboarding, pick a design, check the menu on your phone, then create and print one QR code per table from the dashboard.',
    },
    {
      question: 'Do I need a separate QR code for every table?',
      answer: 'For a view-only menu one code would work, but a code per table is better: it shows the table number, and it is required if you later switch on ordering so each order reaches the right table.',
    },
    {
      question: 'How much does a QR menu cost in India?',
      answer: 'MenusQR costs ₹559 a month or ₹1,999 a year on Basic, ₹959 or ₹3,199 on Intermediate and ₹1,119 or ₹6,799 on Premium. Printing the codes is a separate one-time cost.',
    },
    {
      question: 'Will I have to reprint the QR codes when prices change?',
      answer: 'No. The codes point to a fixed address for your restaurant. Changing prices, dishes or the design does not change the code.',
    },
    {
      question: 'Can I update the menu from my phone?',
      answer: 'Yes. The owner dashboard works in a phone browser. On Intermediate and Premium you can edit as often as you like; Basic includes one edit.',
    },
    {
      question: 'What if some guests do not want to scan?',
      answer: 'Keep a few printed cards and offer them. A QR menu is meant to replace most cards, not to refuse service to anyone.',
    },
    {
      question: 'Do you support Hindi?',
      answer: 'Support is available in English and Hindi by phone, WhatsApp and email. Dish names can be typed in any language you choose.',
    },
  ],
  related: [
    { to: '/digital-qr-menu', label: 'What a digital QR menu is' },
    { to: '/qr-ordering-for-restaurants', label: 'QR ordering for restaurants' },
    { to: '/how-it-works', label: 'How it works' },
    { to: '/contact', label: 'Talk to us' },
  ],
  cta: {
    heading: 'Ready to set up your QR menu?',
    text: 'Plans start at ₹559 a month or ₹1,999 a year. The first menu is set up for you.',
    to: '/plans',
    label: 'Choose a plan',
  },
};
