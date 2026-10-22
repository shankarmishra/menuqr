const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runRegressionAudit() {
  const outDir = path.join(__dirname, '../qa-screenshots/mannat');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  console.log('Testing http://localhost:5173/menu/shankar-dhaba...');

  // 1. Mobile Viewport (iPhone 14/15/16: 393 x 852)
  const mobilePage = await browser.newPage({ viewport: { width: 393, height: 852 } });
  await mobilePage.goto('http://localhost:5173/menu/shankar-dhaba', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1500);

  // A. Top Masthead & Tandoori Chapter
  await mobilePage.screenshot({ path: path.join(outDir, 'phase7_01_mobile_masthead_tandoori.png') });
  console.log('Saved: phase7_01_mobile_masthead_tandoori.png');

  // B. Scroll to Momos Chapter
  const momoHeader = await mobilePage.$('img[alt="MTJ Momo Junction"]');
  if (momoHeader) {
    await momoHeader.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({ path: path.join(outDir, 'phase7_02_mobile_momo_junction.png') });
    console.log('Saved: phase7_02_mobile_momo_junction.png');
  }

  // C. Scroll to Pizzas & Burgers Chapter
  const pizzaHeader = await mobilePage.$('img[alt="Stone Baked Pizzas, Burgers & Pastas"]');
  if (pizzaHeader) {
    await pizzaHeader.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({ path: path.join(outDir, 'phase7_03_mobile_pizzas_burgers.png') });
    console.log('Saved: phase7_03_mobile_pizzas_burgers.png');
  }

  // D. Scroll to Desserts and Footer (confirming Page 17 is EXCLUDED)
  const dessertHeader = await mobilePage.$('img[alt="MTJ Desserts & Sweet Indulgence"]');
  if (dessertHeader) {
    await dessertHeader.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({ path: path.join(outDir, 'phase7_04_mobile_desserts_footer.png') });
    console.log('Saved: phase7_04_mobile_desserts_footer.png');
  }

  // E. Interactive Cart Test: Add Malai Chaap Half Portion and Momo Veg
  const halfBtn = await mobilePage.$('button:has-text("HALF: ₹149")');
  if (halfBtn) {
    await halfBtn.click();
    console.log('Clicked HALF: ₹149 on Malai Chaap');
    await mobilePage.waitForTimeout(500);
  }

  const momoVegBtn = await mobilePage.$('button:has-text("₹149 +")');
  if (momoVegBtn) {
    await momoVegBtn.click();
    console.log('Clicked Momo Veg ₹149 +');
    await mobilePage.waitForTimeout(500);
  }

  await mobilePage.screenshot({ path: path.join(outDir, 'phase7_05_mobile_cart_interaction.png') });
  console.log('Saved: phase7_05_mobile_cart_interaction.png');

  await mobilePage.close();

  // 2. Desktop Viewport (1280 x 800)
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await desktopPage.goto('http://localhost:5173/menu/shankar-dhaba', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1500);

  await desktopPage.screenshot({ path: path.join(outDir, 'phase7_06_desktop_hero_overview.png') });
  console.log('Saved: phase7_06_desktop_hero_overview.png');

  // Desktop Momo View
  const desktopMomo = await desktopPage.$('img[alt="MTJ Momo Junction"]');
  if (desktopMomo) {
    await desktopMomo.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(800);
    await desktopPage.screenshot({ path: path.join(outDir, 'phase7_07_desktop_momo_matrix.png') });
    console.log('Saved: phase7_07_desktop_momo_matrix.png');
  }

  await desktopPage.close();
  await browser.close();

  console.log('Phase 7 Visual & Interactive Regression Audit completed successfully!');
}

runRegressionAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
