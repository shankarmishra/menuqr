import type { LongFormPage } from '../types.ts';

export const qrMenuPriceIndia: LongFormPage = {
  path: '/qr-menu-price-india',
  label: 'QR Menu Price in India',
  title: 'QR Menu Price in India: What You Actually Pay | MenusQR',
  description:
    'What a QR menu costs a restaurant in India: the kinds of options, monthly vs yearly maths, printing, hidden costs to check and MenusQR’s exact prices.',
  h1: 'QR Menu Price in India: What a Restaurant Actually Pays',
  intro:
    'Asking "how much does a QR menu cost" is a bit like asking how much a menu card costs: it depends on what you get. This page lays out the kinds of options available to an Indian restaurant, what each one really costs over a year, the costs people forget, and our own prices without any fine print.',
  updated: '2026-11-15',
  sections: [
    {
      id: 'options',
      heading: 'The five kinds of QR menu, from cheapest to most complete',
      blocks: [
        {
          type: 'table',
          caption: 'Kinds of QR menu options and what they cost',
          head: ['Option', 'What you pay', 'What you get', 'Main catch'],
          rows: [
            ['Free QR generator pointing to a photo or PDF', 'Nothing, or a small fee for the code', 'A code that opens your printed menu as a file', 'Hard to read on a phone; every change means a new file; the link may stop working if the service does'],
            ['Menu on your own website', 'Website hosting and someone to update it', 'A page you control', 'Changes need whoever built the site; rarely built for a phone menu'],
            ['QR menu software (subscription)', 'A monthly or yearly fee', 'A phone-friendly menu you edit yourself, permanent QR codes', 'Ongoing cost; check what each plan includes'],
            ['QR menu with table ordering', 'A higher monthly or yearly fee', 'Guests order from the phone; orders reach the kitchen and cashier', 'Needs a screen in the kitchen and steady internet'],
            ['Full POS system with a QR add-on', 'Software plus hardware, often with setup charges', 'Billing, inventory and reports with QR as one part', 'Most expensive; more than many small restaurants need'],
          ],
        },
        {
          type: 'p',
          text: 'Most small and mid-size restaurants, cafés and dhabas end up in the middle two rows. The free option looks cheapest until the first price change; the POS option is worth it mainly when you also need inventory and multi-outlet reports.',
        },
      ],
    },
    {
      id: 'menusqr-prices',
      heading: 'MenusQR prices',
      blocks: [
        {
          type: 'table',
          caption: 'MenusQR plans, per restaurant, in Indian rupees',
          head: ['Plan', 'Monthly', 'Yearly', 'Includes'],
          rows: [
            ['Basic', '₹559', '₹1,999', 'Digital menu, QR code, menu set up for you from your existing menu, one edit'],
            ['Intermediate', '₹959', '₹3,199', 'Everything in Basic, plus unlimited edits you make yourself, premium designs and menu analytics'],
            ['Premium', '₹1,119', '₹6,799', 'Everything in Intermediate, plus table ordering, kitchen screen and cashier billing'],
          ],
        },
        {
          type: 'p',
          text: 'There is no charge per order and no commission on your sales. Guests pay you directly, by whatever method you already accept.',
        },
      ],
      links: [{ to: '/plans', label: 'Full plan comparison and checkout' }],
    },
    {
      id: 'monthly-vs-yearly',
      heading: 'Monthly or yearly: the maths',
      blocks: [
        {
          type: 'p',
          text: 'Paying monthly keeps the first payment small. Paying for the year costs far less in total. Here is the difference over twelve months:',
        },
        {
          type: 'table',
          caption: 'Twelve monthly payments compared with one yearly payment',
          head: ['Plan', '12 × monthly', 'Yearly', 'You save', 'Yearly works out to'],
          rows: [
            ['Basic', '₹6,708', '₹1,999', '₹4,709', 'About ₹167 a month'],
            ['Intermediate', '₹11,508', '₹3,199', '₹8,309', 'About ₹267 a month'],
            ['Premium', '₹13,428', '₹6,799', '₹6,629', 'About ₹567 a month'],
          ],
        },
        {
          type: 'p',
          text: 'A sensible approach for a restaurant trying QR menus for the first time is to start monthly, make sure guests and staff take to it, and switch to yearly once you are sure.',
        },
      ],
    },
    {
      id: 'printing',
      heading: 'Printing the QR codes',
      blocks: [
        {
          type: 'p',
          text: 'The software is only part of the cost. Each table needs a printed code. Your options, from cheapest to most durable:',
        },
        {
          type: 'list',
          items: [
            { lead: 'Paper stickers.', text: 'Cheapest. Wear out with daily wiping, so expect to replace them.' },
            { lead: 'Laminated tent cards.', text: 'Stand on the table, survive a damp cloth, and are cheap to replace.' },
            { lead: 'Acrylic stands.', text: 'Cost the most per table and last the longest. They look the most finished.' },
          ],
        },
        {
          type: 'p',
          text: 'Prices vary a lot by city and quantity, so ask a local printer for a quote on all three. Because a MenusQR code never changes when the menu does, this is a one-time cost, repeated only when a stand breaks or you add tables.',
        },
      ],
      links: [{ to: '/qr-menu-for-restaurants', label: 'Where and how to place the codes' }],
    },
    {
      id: 'hidden-costs',
      heading: 'Costs that are easy to miss',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'Setup charges.', text: 'Some providers charge separately to enter your menu. Ask whether the first menu is included.' },
            { lead: 'Per-edit charges.', text: 'Some plans include a fixed number of changes. If you change prices often, check this first.' },
            { lead: 'Per-order commission.', text: 'Common with ordering platforms. On a busy restaurant this can grow larger than any subscription.' },
            { lead: 'Hardware.', text: 'Table ordering needs a screen in the kitchen and at the counter. An existing phone, tablet or computer usually works.' },
            { lead: 'Your time.', text: 'Somebody has to keep the menu right. A dashboard you can use from your phone takes less of it.' },
            { lead: 'Renewal price.', text: 'Check what the plan costs in the second year, not only the first.' },
          ],
        },
      ],
    },
    {
      id: 'is-it-worth-it',
      heading: 'Is it worth it? A simple way to decide',
      blocks: [
        {
          type: 'p',
          text: 'Add up what you spent on menu cards in the last year: design, printing, lamination and the reprints after price changes. Compare it with the yearly price of the plan you would choose plus one-time printing of QR codes. For many restaurants that change prices even once or twice a year, a single avoided reprint covers the Basic plan.',
        },
        {
          type: 'p',
          text: 'The rest of the value is harder to put in rupees: dishes marked sold out before guests order them, photos that help guests choose, and, with table ordering, fewer orders lost between the table and the kitchen. Count those as a bonus rather than the reason.',
        },
      ],
    },
    {
      id: 'choosing',
      heading: 'Which plan to choose',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'Basic', text: 'if your menu rarely changes and you want it set up for you.' },
            { lead: 'Intermediate', text: 'if you change prices or dishes often and want to do it yourself, or want a premium design.' },
            { lead: 'Premium', text: 'if your floor is busy and you want guests to order from the table, with a kitchen screen and one running bill per table.' },
          ],
        },
        {
          type: 'p',
          text: 'Not sure? Call or WhatsApp us on +91 87965 30323 and tell us how you run your restaurant. We will tell you which plan fits, including when the answer is the cheapest one.',
        },
      ],
      links: [{ to: '/contact', label: 'Contact us' }],
    },
  ],
  faqs: [
    {
      question: 'What is the cheapest QR menu plan on MenusQR?',
      answer: 'Basic, at ₹559 a month or ₹1,999 a year. It includes the digital menu, the QR code, menu setup from your existing menu and one edit.',
    },
    {
      question: 'Is there a commission on orders?',
      answer: 'No. MenusQR charges only the plan price. Guests pay the restaurant directly.',
    },
    {
      question: 'Is the price per restaurant or per table?',
      answer: 'Per restaurant. The number of tables does not change the plan price; only printing more codes costs more.',
    },
    {
      question: 'Do I have to buy special hardware?',
      answer: 'No for the menu. For table ordering you need a screen in the kitchen and at the counter, which can be any phone, tablet or computer with a browser.',
    },
  ],
  related: [
    { to: '/plans', label: 'Plans and pricing' },
    { to: '/qr-menu-for-restaurants', label: 'How to set up a QR menu' },
    { to: '/digital-qr-menu', label: 'What a digital QR menu is' },
    { to: '/guides', label: 'Guides for restaurant owners' },
  ],
  cta: {
    heading: 'Pick a plan',
    text: 'Basic from ₹559 a month or ₹1,999 a year. No commission, no per-order fee.',
    to: '/plans',
    label: 'View plans',
  },
};
