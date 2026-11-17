/**
 * The single server-side source of truth for plan prices and the monthly order limit.
 * Prices NEVER come from the frontend: checkout, renewals, upgrades and the admin
 * "offline plan" screen all read this table.
 *
 * To change a price, edit it here (and the display copy listed in the PR notes).
 */
export const PLANS = {
  basic: {
    price: 1999, monthlyPrice: 199, yearlyPrice: 1999, label: 'Basic',
    features: ['1 QR Code', 'Unlimited menu views', 'Up to 50 items, 20 edits included', 'Basic templates', 'Email support'],
  },
  intermediate: {
    price: 3199, monthlyPrice: 299, yearlyPrice: 3199, label: 'Intermediate',
    features: ['1 QR Code', 'Unlimited menu views', 'Up to 150 items, 100 edits included', 'All templates', 'Priority support', 'Analytics dashboard'],
  },
  premium: {
    price: 6799, monthlyPrice: 899, yearlyPrice: 6799, label: 'Premium',
    features: ['1 QR Code', 'Unlimited menu views', 'Unlimited items & edits, 150 monthly orders included', 'All templates', '24/7 support', 'Analytics dashboard', 'Table ordering', 'Live orders panel', 'Reception workflow'],
  },
};

/**
 * Online (customer) orders a restaurant can receive per calendar month (IST).
 * Beyond `includedPerMonth`, the restaurant buys extra packs: `packPrice` rupees per `packSize` orders.
 * Packs are valid for the calendar month they are bought in.
 */
export const ORDER_LIMIT = {
  includedPerMonth: 150,
  packSize: 50,
  packPrice: 99,
  maxPacksPerPurchase: 20,
};
