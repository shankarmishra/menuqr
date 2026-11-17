import type { LongFormPage } from '../types.ts';

export const restaurantMenuDesignTips: LongFormPage = {
  path: '/guides/restaurant-menu-design-tips',
  label: 'Menu design tips',
  title: 'Restaurant Menu Design: 12 Tips That Help Guests Order',
  description:
    'Twelve practical menu design tips for Indian restaurants: category order, dish names, descriptions, prices, photos, veg marks and menus read on a phone.',
  h1: 'Restaurant Menu Design: 12 Tips That Help Guests Order',
  intro:
    'A menu is the one thing every guest reads. A good one helps them decide quickly, find what they like and try something new. A poor one makes them scan, give up and order the same dal makhani as always. These twelve tips apply to printed and digital menus alike, with notes on what changes when the menu is read on a phone.',
  updated: '2026-11-15',
  sections: [
    {
      id: 'structure',
      heading: 'Structure: how the menu is organised',
      blocks: [
        {
          type: 'steps',
          items: [
            { lead: 'Put the sections people order first at the top.', text: 'Starters, then mains, then breads and rice, then desserts and drinks is the familiar order in most Indian restaurants. Do not make guests scroll past twenty mocktails to find the food.' },
            { lead: 'Keep categories short.', text: 'Six to twelve dishes per category is comfortable to read. A Veg Main Course with thirty items is better split into Paneer, Vegetables and Dal.' },
            { lead: 'Name categories plainly.', text: '"Tandoor" or "Chinese" tells the guest more than a clever name. Guests should know what is inside without opening it.' },
            { lead: 'Place your best dishes first in each category.', text: 'Many guests choose from the first few items they read. Put the dishes you are proud of, or that earn you the most, where the eye lands.' },
          ],
        },
      ],
    },
    {
      id: 'words',
      heading: 'Words: names and descriptions',
      blocks: [
        {
          type: 'steps',
          items: [
            { lead: 'Use names guests recognise.', text: 'A house name is fine, but add what it is: "Chef’s Special Handi (chicken in a tomato and cashew gravy)".' },
            { lead: 'Describe only what needs describing.', text: 'Nobody needs to be told what butter naan is. Describe house specials, regional dishes and anything with an unusual ingredient.' },
            { lead: 'Keep descriptions to one line.', text: 'Main ingredient, cooking method, and how spicy it is. Leave out "delicious" and "mouth-watering"; every dish on every menu claims those.' },
            { lead: 'Write in the language your guests read.', text: 'Many restaurants add the Hindi or regional name next to the English one. It helps guests who think of the dish by that name.' },
          ],
        },
      ],
    },
    {
      id: 'prices-marks',
      heading: 'Prices, marks and tags',
      blocks: [
        {
          type: 'steps',
          items: [
            { lead: 'Show prices clearly and consistently.', text: 'Same format everywhere, aligned in one place. If taxes are extra, say so once, near the top, in plain words.' },
            { lead: 'Mark every dish veg or non-veg.', text: 'The green and red marks are the first thing many Indian guests look for. A dish with no mark creates a question for the waiter.' },
            { lead: 'Show portions side by side.', text: 'Half and full, or regular and large, next to each other with separate prices, so the guest compares at a glance.' },
            { lead: 'Tag diets and allergens.', text: 'Jain, eggless, contains nuts, contains dairy. Guests with restrictions will trust you more, and ask fewer questions.' },
          ],
        },
        {
          type: 'p',
          text: 'Labelling rules for food businesses in India are set by FSSAI and can apply differently depending on the size of your business. Check the current FSSAI rules for your licence type before you print, especially if you run several outlets.',
        },
      ],
    },
    {
      id: 'photos',
      heading: 'Photos: fewer, better',
      blocks: [
        {
          type: 'p',
          text: 'A good photo sells a dish. A dark, blurred or crowded photo puts guests off, and it reflects on every other dish too. Start with photos of your best sellers and your house specials, not the whole menu. Ten strong photos do more than sixty weak ones.',
        },
        {
          type: 'p',
          text: 'Keep the style consistent: the same light, the same kind of plate or background, the same angle for similar dishes. Consistency makes a menu look planned rather than collected.',
        },
      ],
      links: [{ to: '/guides/food-photos-for-menu', label: 'How to take menu photos with a phone' }],
    },
    {
      id: 'phone-menus',
      heading: 'When the menu is read on a phone',
      blocks: [
        {
          type: 'p',
          text: 'A phone shows four or five dishes at a time. That changes a few things compared with a large printed card:',
        },
        {
          type: 'list',
          items: [
            { lead: 'Category jumps matter.', text: 'Guests should be able to jump straight to Breads without scrolling through the whole menu. A digital menu should show the categories as tabs or a list at the top.' },
            { lead: 'Long descriptions cost more.', text: 'Every extra line pushes the next dish off the screen. Be even shorter than on paper.' },
            { lead: 'Text has to be readable without zooming.', text: 'This is why a PDF of the printed card works badly. The menu has to be laid out for the screen.' },
            { lead: 'Sold out should show.', text: 'On a phone the menu can show what has run out today, which a printed card never can.' },
          ],
        },
      ],
      links: [{ to: '/templates', label: 'See menu designs built for phones' }],
    },
    {
      id: 'combos',
      heading: 'Combos, thalis and specials',
      blocks: [
        {
          type: 'p',
          text: 'Combos and thalis make the decision easy for a guest who does not want to build a meal from five sections. Put them in their own category near the top, list exactly what comes in each, and show the price of the combo clearly. If a combo saves the guest money compared with ordering the items separately, saying so in one line is fair and useful.',
        },
        {
          type: 'p',
          text: 'Specials work best when they are actually special: a dish for the season, the festival or the week. Give them their own short section and take them off when they end. A "special" that has been on the menu for two years is just a dish.',
        },
      ],
    },
    {
      id: 'review',
      heading: 'Review the menu every few months',
      blocks: [
        {
          type: 'p',
          text: 'Once a quarter, sit down with your sales for the last three months. Dishes that rarely sell and are hard to make are candidates to remove; a shorter menu is easier to cook well and easier to read. Dishes that sell well but sit low in their category deserve a better place. Prices that have not moved while ingredient costs have are worth a second look.',
        },
        {
          type: 'p',
          text: 'With a printed menu, every change means a reprint, so many restaurants avoid changes they know they should make. A digital menu removes that cost: you can try a new order of dishes for a month and move it back if it does not help.',
        },
      ],
    },
    {
      id: 'checklist',
      heading: 'A quick checklist before you publish',
      blocks: [
        {
          type: 'list',
          items: [
            { text: 'Every price checked against today’s price list.' },
            { text: 'Every dish marked veg or non-veg.' },
            { text: 'Spelling checked by someone who did not write it.' },
            { text: 'Taxes and service charge stated once, clearly.' },
            { text: 'Your best dishes near the top of their categories.' },
            { text: 'Photos only where they are good.' },
            { text: 'Read once on a phone, from start to end, as a guest would.' },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: 'How many items should a restaurant menu have?',
      answer: 'There is no fixed number, but six to twelve dishes per category keeps each section easy to read. A shorter menu is also easier for the kitchen to cook consistently.',
    },
    {
      question: 'Should every dish have a photo?',
      answer: 'No. Photograph your best sellers and specials first. A poor photo does more harm than no photo.',
    },
    {
      question: 'Should I write dish names in Hindi as well?',
      answer: 'If many of your guests know dishes by their Hindi or regional names, adding them next to the English name helps them find what they want.',
    },
  ],
  related: [
    { to: '/guides/food-photos-for-menu', label: 'Menu photos with a phone' },
    { to: '/templates', label: 'Menu designs' },
    { to: '/guides', label: 'All guides' },
  ],
  cta: {
    heading: 'Try a new menu without reprinting',
    text: 'Change the order of dishes, prices and photos whenever you want, behind the same QR code.',
    to: '/plans',
    label: 'See plans',
  },
};
