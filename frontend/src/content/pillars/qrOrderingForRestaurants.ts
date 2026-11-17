import type { LongFormPage } from '../types.ts';

export const qrOrderingForRestaurants: LongFormPage = {
  path: '/qr-ordering-for-restaurants',
  label: 'QR Ordering',
  title: 'QR Ordering for Restaurants: Table to Kitchen | MenusQR',
  description:
    'How QR table ordering works in a restaurant: the guest orders from the phone, the kitchen sees it on a screen and the cashier keeps one running bill per table.',
  h1: 'QR Ordering for Restaurants: From the Table to the Kitchen to the Bill',
  intro:
    'QR ordering lets a guest send the order from their own phone after scanning the code on the table. The order reaches the kitchen screen with the table number on it, and the cashier sees one running bill for that table. This page walks through the whole chain, what it changes for staff and when it is not a good fit.',
  updated: '2026-11-14',
  sections: [
    {
      id: 'what-it-is',
      heading: 'What QR ordering is, and what it is not',
      blocks: [
        {
          type: 'p',
          text: 'A QR menu shows the menu. QR ordering adds a cart and a "Place order" button to it. The guest chooses dishes, sets the quantity, picks half or full, adds a note such as "less spicy" and sends the order. Nobody installs an app and nobody creates an account.',
        },
        {
          type: 'p',
          text: 'It is not a delivery marketplace. Your guests are your own, there is no commission on each order and the menu carries your name, not another company’s. It is also not a full accounting or inventory system. It covers the path an order travels inside the restaurant: table, kitchen, cashier.',
        },
      ],
      links: [{ to: '/digital-qr-menu', label: 'New to QR menus? Start with what a digital QR menu is' }],
    },
    {
      id: 'guest-side',
      heading: 'What the guest does',
      blocks: [
        {
          type: 'steps',
          items: [
            { lead: 'Scans the code on the table.', text: 'The code already knows which table it belongs to, so the guest is never asked for a table number.' },
            { lead: 'Adds dishes to the cart.', text: 'Portions, add-ons and quantity are chosen on the dish. Items marked sold out, or outside their serving hours, cannot be added.' },
            { lead: 'Adds a note if needed.', text: 'For example "no onion" or "serve starters first".' },
            { lead: 'Places the order.', text: 'The order goes to the restaurant at once.' },
            { lead: 'Follows the status.', text: 'The phone shows whether the order has been accepted, is being prepared or is ready.' },
            { lead: 'Orders again later.', text: 'A second round, a dessert or one more roti goes onto the same table’s bill.' },
          ],
        },
        {
          type: 'p',
          text: 'The bill is settled the way it is today, at the table or the counter. The guest can open the bill on the phone to see what has been ordered so far.',
        },
      ],
    },
    {
      id: 'kitchen-side',
      heading: 'What the kitchen sees',
      blocks: [
        {
          type: 'p',
          text: 'Each new order appears on the orders screen with a sound, so it is noticed even in a loud kitchen. The ticket shows the table, the dishes with portions and add-ons, the quantity and the guest’s note in their own words.',
        },
        {
          type: 'p',
          text: 'Staff accept the order, mark it as preparing and then as ready. Each tap updates the guest’s phone and the cashier’s screen, so nobody walks to the kitchen to ask "table five ka kya hua?". Finished tickets are moved out of the way automatically so the screen shows only what still needs cooking.',
        },
        {
          type: 'p',
          text: 'A kitchen order ticket (KOT) can be printed for stations that prefer paper. A tablet or an old laptop on the pass is enough for the screen; no special hardware is required.',
        },
      ],
    },
    {
      id: 'cashier-side',
      heading: 'What the cashier sees',
      blocks: [
        {
          type: 'p',
          text: 'The cashier screen shows the floor as a grid of tables. A table with an open bill is highlighted. Opening it shows every round ordered from that table added into one running bill, so the second round of drinks is never forgotten.',
        },
        {
          type: 'list',
          items: [
            { lead: 'Add items by hand.', text: 'For a guest who ordered through the waiter, the cashier adds the dish to the same bill.' },
            { lead: 'Print the bill.', text: 'A receipt in the familiar thermal style, with your restaurant name, items, taxes and total, prints from the browser.' },
            { lead: 'Record the payment.', text: 'Mark the bill as paid by cash, UPI or card. The table is then free for the next guests.' },
            { lead: 'Open a bill by hand.', text: 'For a guest who did not scan, the cashier opens a new bill for the table from the counter.' },
          ],
        },
        {
          type: 'p',
          text: 'MenusQR does not collect money from your guests. Payments go to you directly, by whatever method you already accept.',
        },
      ],
    },
    {
      id: 'order-types',
      heading: 'Dine-in, takeaway and delivery',
      blocks: [
        {
          type: 'p',
          text: 'The same menu handles three kinds of order. Dine-in orders come from a table code. Takeaway orders are placed for pickup. Delivery orders ask for an address and phone number, and you decide from the dashboard whether delivery is switched on at all, so a restaurant with no delivery staff never receives a delivery order. Each order is clearly labelled with its type on the kitchen and cashier screens.',
        },
        {
          type: 'p',
          text: 'This matters most on a busy evening, when a packed parcel must not go to table four and a table’s starter must not be packed in a box. Because the type is chosen by how the order was placed, not written by hand, the kitchen does not have to guess.',
        },
      ],
    },
    {
      id: 'what-changes',
      heading: 'What changes on the floor',
      blocks: [
        {
          type: 'table',
          caption: 'An order taken by a waiter compared with an order placed by QR',
          head: ['Step', 'Waiter takes the order', 'Guest orders by QR'],
          rows: [
            ['Guest is ready to order', 'Waits for a waiter to be free', 'Orders at once'],
            ['Order reaches the kitchen', 'Written slip carried by hand', 'Appears on the screen with a sound'],
            ['Special request', 'Depends on handwriting and memory', 'Typed by the guest, shown on the ticket'],
            ['Second round', 'Guest calls the waiter again', 'Guest adds it from the phone'],
            ['Bill', 'Added up from slips', 'Already totalled for the table'],
          ],
        },
        {
          type: 'p',
          text: 'Waiters do not disappear. Their time moves from writing orders to serving food, recommending dishes and looking after tables. In a rush hour this is the difference between a guest waiting to order and a guest waiting to eat.',
        },
        {
          type: 'p',
          text: 'We do not promise a percentage rise in bill size or table turnover. Those depend on your food, your prices and your room. What the system removes is the delay before an order is taken and the mistakes between the table and the kitchen.',
        },
      ],
    },
    {
      id: 'safeguards',
      heading: 'Keeping wrong and fake orders out',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'A code for each table.', text: 'Every table’s QR carries its own hidden code. An order cannot be sent to a table by typing a table number into a link.' },
            { lead: 'You accept before the kitchen cooks.', text: 'New orders wait for staff to accept them. An order that looks wrong can be rejected.' },
            { lead: 'Sold-out and serving hours are enforced.', text: 'A guest cannot order a dish that is finished or a breakfast item at night.' },
            { lead: 'Limits on repeated requests.', text: 'The system slows down a phone that sends orders too quickly.' },
          ],
        },
      ],
    },
    {
      id: 'requirements',
      heading: 'What you need',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'The Premium plan.', text: 'Ordering, the kitchen screen and cashier billing are included at ₹1,119 a month or ₹6,799 a year.' },
            { lead: 'One QR code per table.', text: 'Created and printed from your dashboard.' },
            { lead: 'A screen in the kitchen and one at the counter.', text: 'Any phone, tablet or computer with a browser.' },
            { lead: 'A steady internet connection in the restaurant.', text: 'Orders travel over the internet. If your connection drops often, fix that first.' },
            { lead: 'A printer, if you want paper.', text: 'Bills and kitchen tickets print through the browser’s print window to the printer you already use.' },
          ],
        },
      ],
      links: [{ to: '/plans', label: 'Compare Premium with the other plans' }],
    },
    {
      id: 'not-a-fit',
      heading: 'When QR ordering is not a good fit',
      blocks: [
        {
          type: 'list',
          items: [
            { lead: 'Fine dining built around the waiter.', text: 'If the conversation at the table is part of what guests pay for, use a view-only QR menu or none.' },
            { lead: 'Unreliable internet.', text: 'An order that does not arrive is worse than a slow waiter.' },
            { lead: 'A kitchen with nobody watching a screen.', text: 'Someone has to accept orders. In a very small kitchen, print tickets or keep the screen where the cook can see it.' },
            { lead: 'Guests who mostly do not use smartphones.', text: 'Keep waiters taking orders and add them to the bill from the cashier screen.' },
          ],
        },
        {
          type: 'p',
          text: 'Many restaurants run both ways at once: guests who like the phone use it, the rest order from the waiter, and every order ends up on the same bill.',
        },
      ],
    },
    {
      id: 'getting-started',
      heading: 'Starting without disrupting service',
      blocks: [
        {
          type: 'steps',
          items: [
            { lead: 'Get the menu right first.', text: 'Ordering multiplies whatever is in the menu, including wrong prices.' },
            { lead: 'Train on a quiet afternoon.', text: 'Place test orders from two tables and let kitchen and cashier staff accept, prepare and bill them.' },
            { lead: 'Begin with a few tables.', text: 'Switch on ordering for one section for the first days.' },
            { lead: 'Watch one rush hour.', text: 'Stand near the kitchen screen during the first busy service and note what confuses people.' },
            { lead: 'Then open it to the whole floor.', text: 'Keep waiters offering to take the order for anyone who prefers it.' },
          ],
        },
      ],
      links: [{ to: '/qr-menu-for-restaurants', label: 'Setting up the QR menu itself' }],
    },
  ],
  faqs: [
    {
      question: 'Which MenusQR plan includes table ordering?',
      answer: 'The Premium plan, at ₹1,119 a month or ₹6,799 a year. It includes guest ordering, the kitchen screen and cashier billing.',
    },
    {
      question: 'Do guests have to pay online?',
      answer: 'No. Guests pay you directly at the table or counter, by cash, UPI or card. The cashier records how the bill was paid.',
    },
    {
      question: 'How does the kitchen know which table ordered?',
      answer: 'Every table has its own QR code with a hidden table code. The order arrives already marked with that table.',
    },
    {
      question: 'Can a guest order more after the first order?',
      answer: 'Yes. Each new round from the same table is added to that table’s running bill.',
    },
    {
      question: 'Can waiters still take orders?',
      answer: 'Yes. The cashier can add dishes to a table’s bill by hand, so phone orders and waiter orders sit on one bill.',
    },
    {
      question: 'Do I need a special printer or tablet?',
      answer: 'No. The kitchen and cashier screens run in a browser on any phone, tablet or computer. Printing uses the browser’s print window and your existing printer.',
    },
    {
      question: 'Do you charge a commission on orders?',
      answer: 'No. You pay the plan price only. There is no charge per order.',
    },
  ],
  related: [
    { to: '/digital-qr-menu', label: 'What a digital QR menu is' },
    { to: '/qr-menu-for-restaurants', label: 'QR menu setup and cost' },
    { to: '/plans', label: 'Plans and pricing' },
    { to: '/contact', label: 'Ask us a question' },
  ],
  cta: {
    heading: 'Switch on ordering from the table',
    text: 'Premium includes ordering, the kitchen screen and cashier billing at ₹1,119 a month or ₹6,799 a year.',
    to: '/plans',
    label: 'See the Premium plan',
  },
};
