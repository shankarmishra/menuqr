import type { LongFormPage } from '../types.ts';

export const foodPhotosForMenu: LongFormPage = {
  path: '/guides/food-photos-for-menu',
  label: 'Menu photos with a phone',
  title: 'How to Take Food Photos for Your Menu with a Phone',
  description:
    'Take menu photos that sell with the phone you already have: light, angles, plates, backgrounds, a simple daily routine and the mistakes that make food look bad.',
  h1: 'How to Take Food Photos for Your Menu with a Phone',
  intro:
    'You do not need a photographer or a professional camera to have good menu photos. A recent phone, daylight and a little care get you most of the way. This guide is written for a restaurant owner or manager who will take the photos themselves, between lunch and dinner service.',
  updated: '2026-11-15',
  sections: [
    {
      id: 'light',
      heading: 'Light is most of the photo',
      blocks: [
        {
          type: 'p',
          text: 'The single biggest difference between a good and a bad food photo is light. Restaurant lighting is usually warm, dim or coming from above, which makes gravies look brown and flat. Daylight from a window makes the same dish look fresh.',
        },
        {
          type: 'list',
          items: [
            { lead: 'Shoot next to a window.', text: 'Put the plate on a table close to a large window, with the light coming from the side or from slightly behind the dish.' },
            { lead: 'Avoid direct sun.', text: 'Hard sunlight makes harsh shadows and shiny spots. A window without direct sun, or a thin white curtain, gives softer light.' },
            { lead: 'Switch off the room lights.', text: 'Mixing yellow bulbs with daylight gives the food strange colours.' },
            { lead: 'Do not use the flash.', text: 'It flattens the food and creates glare on gravy and glass.' },
            { lead: 'Fill in dark shadows.', text: 'Hold a white sheet of paper or a white plate on the side away from the window to bounce some light back.' },
          ],
        },
        {
          type: 'p',
          text: 'The best time is usually between lunch and dinner service, when the restaurant is quiet and the daylight is steady.',
        },
      ],
    },
    {
      id: 'angles',
      heading: 'Choose the angle for the dish',
      blocks: [
        {
          type: 'table',
          caption: 'Which camera angle suits which kind of dish',
          head: ['Angle', 'Works for', 'Why'],
          rows: [
            ['From directly above', 'Thalis, pizzas, biryani in a handi, platters', 'Shows everything on the plate and the pattern of the dish'],
            ['At about 45 degrees', 'Curries in a bowl, plated mains, desserts', 'The angle a guest sees when the dish is in front of them'],
            ['From the side, at table level', 'Burgers, layered desserts, drinks in tall glasses', 'Shows height and layers'],
          ],
        },
        {
          type: 'p',
          text: 'Pick one angle for each kind of dish and keep it. A menu where all the curries are shot the same way looks planned.',
        },
      ],
    },
    {
      id: 'plate',
      heading: 'Plating for the camera',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'Wipe the rim.', text: 'Drips and fingerprints on the edge of the plate show clearly in a photo.' },
            { lead: 'Serve a slightly smaller portion.', text: 'An overfilled bowl looks messy. Leave a little of the plate showing.' },
            { lead: 'Add a fresh garnish just before the photo.', text: 'Coriander, a swirl of cream or a lemon wedge added at the last moment looks alive.' },
            { lead: 'Shoot fast.', text: 'Gravies form a skin, rice dries and ice melts within minutes. Have the phone ready before the dish arrives.' },
            { lead: 'Use your real plates.', text: 'Guests should recognise the dish when it reaches the table. Do not shoot on plates you do not serve on.' },
          ],
        },
      ],
    },
    {
      id: 'background',
      heading: 'Backgrounds and props',
      blocks: [
        {
          type: 'p',
          text: 'Keep the background simple: a plain wooden table, a clean cloth or a neutral surface. Remove salt shakers, menus, phones and anything with a brand on it. One small prop, such as a spoon or a small bowl of chutney, is enough. The dish should be the brightest and sharpest thing in the frame.',
        },
        {
          type: 'p',
          text: 'Use the same background for all photos in a category. Switching between a marble slab, a red cloth and a steel tray makes the menu look like it came from three restaurants.',
        },
      ],
    },
    {
      id: 'phone-settings',
      heading: 'Phone settings and habits',
      blocks: [
        {
          type: 'steps',
          items: [
            { lead: 'Clean the lens.', text: 'A smudged lens is the most common reason for a hazy photo. Wipe it with a soft cloth first.' },
            { lead: 'Use the main camera, not the zoom.', text: 'Move closer with your feet. Digital zoom loses detail.' },
            { lead: 'Tap on the food to focus.', text: 'Then slide the brightness down slightly if the plate looks washed out.' },
            { lead: 'Hold steady.', text: 'Rest your elbows on the table or a chair back.' },
            { lead: 'Take several shots.', text: 'Pick the best one later on a larger screen.' },
            { lead: 'Skip heavy filters.', text: 'Food should look like the food. Small changes to brightness and straightening are enough.' },
          ],
        },
      ],
    },
    {
      id: 'crop-upload',
      heading: 'Cropping and uploading',
      blocks: [
        {
          type: 'p',
          text: 'Crop so the dish fills most of the frame, with a little space around it. Most menu designs show photos as squares or slightly wide rectangles, so keep the dish in the centre where any crop will keep it. Straighten the photo so table edges are level.',
        },
        {
          type: 'p',
          text: 'You do not need to shrink photos yourself before adding them to MenusQR. Normal photos from a phone camera can be uploaded, and they are resized for fast loading on guests’ phones.',
        },
      ],
    },
    {
      id: 'drinks-desserts',
      heading: 'Drinks, desserts and dark gravies',
      blocks: [
        {
          type: 'p',
          text: 'Some dishes are harder than others. Drinks in glass reflect the window, so turn the glass until the reflection moves off the front, and wipe away condensation drips. Cold desserts melt fast, so set up and focus on an empty plate before the dessert arrives. Dark gravies such as dal makhani or a black pepper chicken lose detail; a swirl of cream, a sprinkle of fresh coriander or a lighter bowl gives the camera something to focus on.',
        },
        {
          type: 'p',
          text: 'Fried items look best in the first minute, before steam softens them. Biryani looks better with a few grains lifted to show the layers and the colour inside.',
        },
      ],
    },
    {
      id: 'routine',
      heading: 'A simple photo routine',
      blocks: [
        {
          type: 'p',
          text: 'Do not try to photograph the whole menu in one afternoon. Pick five dishes a day, starting with best sellers and specials. Set up one spot near the window that you use every time, with the same table and background. In two weeks the important dishes are done and the photos match. Add a photo for every new dish on the day it joins the menu.',
        },
      ],
    },
    {
      id: 'mistakes',
      heading: 'Photos that hurt sales',
      blocks: [
        {
          type: 'list',
          items: [
            { text: 'Dark photos taken under restaurant lights at night.' },
            { text: 'Photos of a dish that looks different from what is served.' },
            { text: 'Stock photos downloaded from the internet. Guests notice, and some images are not free to use.' },
            { text: 'Half-eaten plates, crowded tables and visible hands.' },
            { text: 'A different style for every photo.' },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: 'Do I need a professional photographer for menu photos?',
      answer: 'No. A recent phone, daylight from a window and a clean, simple background give good results for most menus.',
    },
    {
      question: 'What is the best time to take food photos in a restaurant?',
      answer: 'In the afternoon between lunch and dinner service, when there is steady daylight and the kitchen has time to plate carefully.',
    },
    {
      question: 'Can I use food photos from the internet on my menu?',
      answer: 'It is better not to. They will not match what you serve, and many images are protected by copyright.',
    },
  ],
  related: [
    { to: '/guides/restaurant-menu-design-tips', label: 'Menu design tips' },
    { to: '/templates', label: 'Menu designs with photos' },
    { to: '/guides', label: 'All guides' },
  ],
  cta: {
    heading: 'Put your photos on a menu guests can open',
    text: 'Add a photo to any dish from your phone. Plans start at ₹559 a month or ₹1,999 a year.',
    to: '/plans',
    label: 'See plans',
  },
};
