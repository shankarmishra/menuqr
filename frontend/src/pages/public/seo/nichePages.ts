// Business-type landing pages. Each entry has its own copy (not a find-and-replace of one
// template) and only describes features that exist in the product.

export interface NicheFaq {
  question: string;
  answer: string;
}

export interface NichePage {
  slug: string;
  /** Short label used in navigation and breadcrumbs. */
  label: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** "Why a printed menu hurts this kind of business" paragraph. */
  problem: string;
  benefits: { heading: string; body: string }[];
  steps: string[];
  faqs: NicheFaq[];
}

export const NICHE_PAGES: NichePage[] = [
  {
    slug: 'qr-menu-for-cafes',
    label: 'Cafés',
    title: 'QR Menu for Cafés | Digital Café Menu | MenusQR',
    description:
      'A digital QR menu for cafés: show breakfast, coffee and dessert sections at the right hours, mark items sold out in one tap and keep one permanent table QR.',
    h1: 'A QR Menu Made for Cafés',
    intro:
      'Cafés change their menu more often than almost any other food business: the bake of the day, seasonal drinks, a sold-out cold brew by 4 pm. MenusQR keeps your menu live on one permanent QR code so the stand on the table is always right.',
    problem:
      'A laminated café menu is wrong by lunchtime the moment one item runs out or a new special starts. Staff end up saying "sorry, that is finished" to guests who already decided, and every price change means another print run.',
    benefits: [
      {
        heading: 'Show sections at the right hours',
        body: 'Set a serving window on a category, for example Breakfast from 7 AM to 11 AM. Outside that window guests still see the dishes but cannot order them, so nobody asks for pancakes at 6 PM.',
      },
      {
        heading: 'Mark an item sold out for today',
        body: 'When the last croissant goes, mark it sold out from your phone. It shows "Sold out today" and comes back automatically the next morning.',
      },
      {
        heading: 'Diet and allergen tags guests actually look for',
        body: 'Tag items as Veg, Jain, eggless or spicy, and list allergens such as nuts or dairy, so guests with restrictions can decide without asking.',
      },
      {
        heading: 'Half and full sizes, add-ons and variants',
        body: 'Price a regular and large coffee, or a half and full dessert portion, on the same dish with clear separate prices.',
      },
    ],
    steps: [
      'Add your drinks, bakes and snacks with photos and prices.',
      'Set serving windows for breakfast, all-day and evening sections.',
      'Print the table QR sheet once and place it on every table or at the counter.',
    ],
    faqs: [
      {
        question: 'Can I show a breakfast menu only in the morning?',
        answer:
          'Yes. Give a category a serving window such as 7 AM to 11 AM (India time) and choose the days it applies. Outside the window guests see the dishes but cannot order them.',
      },
      {
        question: 'How do I mark an item sold out during the day?',
        answer:
          'Open your menu in the dashboard and use Mark sold out on the item. It shows as "Sold out today" to guests and resets by itself the next day.',
      },
      {
        question: 'Do café guests need to install an app?',
        answer:
          'No. Guests scan the QR code with their phone camera and the menu opens in the browser.',
      },
      {
        question: 'Will changing a price change the QR code?',
        answer:
          'No. The QR code stays the same. Only the menu behind it changes, so you never reprint table stands for a price update.',
      },
    ],
  },
  {
    slug: 'qr-menu-for-dhabas',
    label: 'Dhabas',
    title: 'QR Menu for Dhabas | Digital Dhaba Menu | MenusQR',
    description:
      'Give your dhaba a digital QR menu with Half and Full prices, Veg and Non-Veg marking, spice levels and instant price updates, with no app for guests to install.',
    h1: 'A QR Menu That Fits a Dhaba',
    intro:
      'Dhaba menus are long, prices move with the market, and almost every dish comes in Half and Full. MenusQR is built for that: a clean mobile menu with both prices shown, Veg and Non-Veg clearly marked, and edits that go live the second you save them.',
    problem:
      'A printed dhaba menu with 80 dishes is hard to read, expensive to reprint when the price of paneer or chicken changes, and a bottleneck when guests queue to ask what is available.',
    benefits: [
      {
        heading: 'Half and Full prices on the same dish',
        body: 'Show both portion prices side by side, with an optional note such as 6 pcs or 10 pcs, so guests see exactly what they pay for.',
      },
      {
        heading: 'Veg, Non-Veg and spice at a glance',
        body: 'Every dish carries a Veg or Non-Veg marker, and you can add spice levels and Jain or eggless tags for guests who ask.',
      },
      {
        heading: 'Change prices when ingredients change',
        body: 'Update a price from your phone and the live menu changes straight away. No reprint and no new QR stands.',
      },
      {
        heading: 'One QR per table, or one on the counter',
        body: 'Print a sheet of table QR codes with table numbers. Guests scan the one at their table.',
      },
    ],
    steps: [
      'Add your dishes by category, or import them from a spreadsheet.',
      'Set Half and Full prices and tag Veg and Non-Veg.',
      'Print the table QR sheet and put a QR on every table.',
    ],
    faqs: [
      {
        question: 'Can a dish have Half and Full prices?',
        answer:
          'Yes. A dish can carry separate Half and Full prices, and you can add a note about the portion, such as the number of pieces.',
      },
      {
        question: 'Can I upload my whole menu from Excel?',
        answer:
          'Yes. The menu importer reads a spreadsheet with dish names, categories and prices, so you do not have to type every dish.',
      },
      {
        question: 'Will it work on slow mobile data?',
        answer:
          'The menu is a light mobile web page with no app to download, which keeps it quick on ordinary 4G connections.',
      },
      {
        question: 'Do guests have to sign up?',
        answer:
          'No. Guests just scan and read the menu.',
      },
    ],
  },
  {
    slug: 'qr-menu-for-bars-and-pubs',
    label: 'Bars & Pubs',
    title: 'QR Menu for Bars & Pubs | Digital Drinks Menu | MenusQR',
    description:
      'A digital QR menu for bars and pubs: schedule happy hour sections, mark drinks sold out in one tap and update prices without reprinting.',
    h1: 'A Digital QR Menu for Bars and Pubs',
    intro:
      'Happy hour starts at five, a bottle runs out at ten, and the drinks list changes with every stock delivery. A QR menu lets your bar keep the list accurate without handing guests a sticky, out-of-date card.',
    problem:
      'Printed drinks menus go out of date quickly. Staff cross out sold-out bottles by hand, happy hour prices live on a separate board, and busy tables wait for someone to explain the options.',
    benefits: [
      {
        heading: 'Schedule happy hour automatically',
        body: 'Give a Happy hour category a serving window, for example 5 PM to 8 PM on weekdays. Guests see it in the list and can order from it only while it is on.',
      },
      {
        heading: 'Pull a sold-out bottle in one tap',
        body: 'Mark an item sold out for today and it is flagged to guests straight away, then returns tomorrow without you doing anything.',
      },
      {
        heading: 'Rich presentation for cocktails and food',
        body: 'Add photos, descriptions and allergen notes. Choose from the menu templates to match your bar rather than a generic list.',
      },
      {
        heading: 'Order from the table (Premium)',
        body: 'On the Premium plan guests can send an order from their table and it appears on your reception order screen.',
      },
    ],
    steps: [
      'Add your drinks and food menus with prices.',
      'Create a Happy hour category with its own serving window.',
      'Place QR stands on tables and at the bar.',
    ],
    faqs: [
      {
        question: 'Can happy hour pricing show only at certain times?',
        answer:
          'Yes. Put the happy hour dishes in their own category with a serving window and days. Outside the window guests can see them but cannot order them.',
      },
      {
        question: 'Is online ordering available for bars?',
        answer:
          'Table ordering is part of the Premium plan. Other plans show the menu only.',
      },
      {
        question: 'Can I show different menus for lunch and night?',
        answer:
          'Yes. Use categories with different serving windows, such as Lunch from 12 PM and Late night after 10 PM. Windows that run past midnight are supported.',
      },
      {
        question: 'Does it show alcohol-related age warnings?',
        answer:
          'You can add any note you need to an item or category description, for example a legal drinking age line, and it appears on the guest menu.',
      },
    ],
  },
  {
    slug: 'qr-menu-for-hotels',
    label: 'Hotels',
    title: 'QR Menu for Hotels | Digital Hotel Restaurant Menu | MenusQR',
    description:
      'A digital QR menu for hotel restaurants and banquets: separate meal sections by time, share the menu on WhatsApp and update items without reprinting.',
    h1: 'A QR Menu for Hotel Restaurants',
    intro:
      'Hotels serve breakfast, lunch, dinner and sometimes a late-night menu from the same restaurant, and guests often ask for the menu before they arrive. A single QR code and a shareable link cover the dining room, the lobby and the guest room card.',
    problem:
      'Hotel menus are thick, formal and expensive to reprint. A seasonal change or a buffet price update means redesigning and reprinting folders across the property.',
    benefits: [
      {
        heading: 'Different menus through the day',
        body: 'Breakfast, lunch, dinner and late night each get their own category with a serving window, so guests see what is being served now.',
      },
      {
        heading: 'Share one link anywhere',
        body: 'Copy the menu link or share it on WhatsApp for room cards, booking confirmations and enquiries.',
      },
      {
        heading: 'A look that suits the property',
        body: 'Choose from the menu templates for a design that matches your restaurant, with photos and clear descriptions.',
      },
      {
        heading: 'Dietary information for guests',
        body: 'Mark Veg, Jain and eggless dishes and add allergen notes so guests with restrictions can choose confidently.',
      },
    ],
    steps: [
      'Add each meal section and its items.',
      'Set serving windows for breakfast, lunch and dinner.',
      'Print QR cards for tables, rooms and the front desk.',
    ],
    faqs: [
      {
        question: 'Can one restaurant show breakfast, lunch and dinner separately?',
        answer:
          'Yes. Each category can have its own serving window and days, including windows that end after midnight.',
      },
      {
        question: 'Can guests open the menu before they arrive?',
        answer:
          'Yes. The menu has a public link you can share on WhatsApp or add to a confirmation message.',
      },
      {
        question: 'Can I use it for several restaurants in one hotel?',
        answer:
          'Each restaurant is set up as its own account with its own menu and QR code. Contact us if you need help planning more than one.',
      },
      {
        question: 'Do we have to print new QR stands when the menu changes?',
        answer:
          'No. The QR code never changes, only the menu behind it.',
      },
    ],
  },
  {
    slug: 'qr-menu-for-bakeries',
    label: 'Bakeries & Sweet Shops',
    title: 'QR Menu for Bakeries & Sweet Shops | MenusQR',
    description:
      'A digital QR menu for bakeries and sweet shops: show prices per piece or per kg, mark items sold out for the day and keep festival specials current.',
    h1: 'A QR Menu for Bakeries and Sweet Shops',
    intro:
      'Counter displays sell out through the day and festival menus change every few weeks. A QR code at the counter and on the door lets customers see what is available and what it costs without waiting to catch your attention.',
    problem:
      'Handwritten price boards and printed rate cards go stale fast around festivals, and customers often ask the same price questions again and again during a rush.',
    benefits: [
      {
        heading: 'Festival and seasonal specials',
        body: 'Add a Diwali or Eid box category when the season starts and delete it when it ends, without touching the rest of the menu.',
      },
      {
        heading: 'Sold out for today in one tap',
        body: 'When the last batch of a bake goes, mark it sold out. It returns the next day on its own.',
      },
      {
        heading: 'Clear portions and prices',
        body: 'Show sizes and prices side by side, for example by weight or box size, with photos so items are easy to pick.',
      },
      {
        heading: 'Put it on the door and the counter',
        body: 'Print the QR code for the shop front so people can browse before they walk in.',
      },
    ],
    steps: [
      'Add your products with photos, sizes and prices.',
      'Create a seasonal category for the current festival.',
      'Print a QR code for the counter and the shop front.',
    ],
    faqs: [
      {
        question: 'Can I show prices for different sizes or weights?',
        answer:
          'Yes. An item can have size or portion variants, each with its own price.',
      },
      {
        question: 'Can I hide a festival menu after the season?',
        answer:
          'Yes. Delete the category from your dashboard and it disappears from the live menu immediately.',
      },
      {
        question: 'Is online ordering included?',
        answer:
          'Table ordering is part of the Premium plan. Without it the QR menu is a live price and product list.',
      },
      {
        question: 'Do customers need an app?',
        answer:
          'No. The menu opens in the phone browser after scanning the QR code.',
      },
    ],
  },
  {
    slug: 'qr-menu-for-food-trucks',
    label: 'Food Trucks & Stalls',
    title: 'QR Menu for Food Trucks & Street Food Stalls | MenusQR',
    description:
      'A QR menu for food trucks and street food stalls: one sticker, a short mobile menu, instant price changes and no printing costs.',
    h1: 'A QR Menu for Food Trucks and Stalls',
    intro:
      'A small stall has little space and changes its menu with the day\'s stock. One QR sticker on the counter or the side of the truck gives every customer a clear, current menu on their own phone.',
    problem:
      'Printed menu boards take space, fade in the sun and cannot be changed when you run out of an item or move to a new location with a different line-up.',
    benefits: [
      {
        heading: 'One sticker, always current',
        body: 'Stick the QR code on the counter or the side of the truck. When your line-up changes, edit it on your phone and the menu updates for the next scan.',
      },
      {
        heading: 'Short, quick-loading menu',
        body: 'The guest menu is a lightweight mobile page that opens in the browser with no app to install.',
      },
      {
        heading: 'Sold out in one tap',
        body: 'Mark an item sold out when the batch ends so customers do not queue for something you no longer have.',
      },
      {
        heading: 'Share it on social media',
        body: 'Copy your menu link and post it on WhatsApp or Instagram so regulars know what is on today.',
      },
    ],
    steps: [
      'Add your items and prices from your phone.',
      'Download the QR code and print it as a sticker.',
      'Edit the menu whenever the day\'s line-up changes.',
    ],
    faqs: [
      {
        question: 'Can I run it entirely from my phone?',
        answer:
          'Yes. The owner dashboard works in a mobile browser, so you can add items, change prices and mark items sold out from your phone.',
      },
      {
        question: 'Do I need to reprint the sticker when prices change?',
        answer:
          'No. The QR code is permanent, only the menu behind it changes.',
      },
      {
        question: 'Can I share the menu without the QR code?',
        answer:
          'Yes. Every menu has a public link you can send on WhatsApp or post on social media.',
      },
      {
        question: 'How much does it cost?',
        answer:
          'Plans start at ₹1,999 per year. See the plans page for what each plan includes.',
      },
    ],
  },
];

export const nichePath = (slug: string) => `/${slug}`;
