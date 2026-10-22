const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function capturePhase8Baseline() {
  const outDir = path.join(__dirname, '../qa-screenshots/mannat');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const url = 'http://localhost:5173/menu/shankar-dhaba';
  console.log(`[Phase 8 Capture] Launching Chromium to capture: ${url}`);

  // =========================================================================
  // 1. DESKTOP VIEWPORT (1280 x 900)
  // =========================================================================
  console.log('\n--- Capturing Desktop Viewport (1280x900) ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2, // High DPI capture for crisp comparison
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(2000);

  // Full-page Desktop Screenshot
  const desktopFullPagePath = path.join(outDir, 'phase8_baseline_desktop.png');
  await desktopPage.screenshot({ path: desktopFullPagePath, fullPage: true });
  console.log(`✓ Saved Desktop Full-Page: ${desktopFullPagePath}`);

  // Desktop Sections for Pages 4, 5, 6
  const tandooriSectionDesktop = await desktopPage.$('#chapter-tandoori-snacks');
  if (tandooriSectionDesktop) {
    const p4Desktop = path.join(outDir, 'section_desktop_page04_tandoori.png');
    await tandooriSectionDesktop.screenshot({ path: p4Desktop });
    console.log(`✓ Saved Desktop Page 4 Section (Tandoori Snacks): ${p4Desktop}`);
  }

  const kebabsSectionDesktop = await desktopPage.$('#chapter-kebabs-platters');
  if (kebabsSectionDesktop) {
    const p5Desktop = path.join(outDir, 'section_desktop_page05_kebabs.png');
    await kebabsSectionDesktop.screenshot({ path: p5Desktop });
    console.log(`✓ Saved Desktop Page 5 Section (Kebabs & Platters): ${p5Desktop}`);
  }

  const crunchSectionDesktop = await desktopPage.$('#chapter-crunch-soups');
  if (crunchSectionDesktop) {
    const p6Desktop = path.join(outDir, 'section_desktop_page06_crunch.png');
    await crunchSectionDesktop.screenshot({ path: p6Desktop });
    console.log(`✓ Saved Desktop Page 6 Section (Crunch & Soups): ${p6Desktop}`);
  }

  await desktopContext.close();

  // =========================================================================
  // 2. MOBILE VIEWPORT (390 x 844)
  // =========================================================================
  console.log('\n--- Capturing Mobile Viewport (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(2000);

  // Full-page Mobile Screenshot
  const mobileFullPagePath = path.join(outDir, 'phase8_baseline_mobile.png');
  await mobilePage.screenshot({ path: mobileFullPagePath, fullPage: true });
  console.log(`✓ Saved Mobile Full-Page: ${mobileFullPagePath}`);

  // Mobile Sections for Pages 4, 5, 6
  const tandooriSectionMobile = await mobilePage.$('#chapter-tandoori-snacks');
  if (tandooriSectionMobile) {
    const p4Mobile = path.join(outDir, 'section_page04_tandoori.png');
    await tandooriSectionMobile.screenshot({ path: p4Mobile });
    console.log(`✓ Saved Mobile Page 4 Section (Tandoori Snacks): ${p4Mobile}`);
  }

  const kebabsSectionMobile = await mobilePage.$('#chapter-kebabs-platters');
  if (kebabsSectionMobile) {
    const p5Mobile = path.join(outDir, 'section_page05_kebabs.png');
    await kebabsSectionMobile.screenshot({ path: p5Mobile });
    console.log(`✓ Saved Mobile Page 5 Section (Kebabs & Platters): ${p5Mobile}`);
  }

  const crunchSectionMobile = await mobilePage.$('#chapter-crunch-soups');
  if (crunchSectionMobile) {
    const p6Mobile = path.join(outDir, 'section_page06_crunch.png');
    await crunchSectionMobile.screenshot({ path: p6Mobile });
    console.log(`✓ Saved Mobile Page 6 Section (Crunch & Soups): ${p6Mobile}`);
  }

  // =========================================================================
  // 3. INTERACTIVE CUSTOMER ORDERING TEST
  // =========================================================================
  console.log('\n--- Testing Interactive Customer Ordering ---');
  // Clear any existing localStorage cart
  await mobilePage.evaluate(() => localStorage.clear());
  await mobilePage.reload({ waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  // A. Click Half Portion on Malai Chaap
  const halfBtn = await mobilePage.$('.heritage-portion-btn-half');
  if (halfBtn) {
    await halfBtn.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(400);
    const halfText = await halfBtn.innerText();
    await halfBtn.click();
    console.log(`✓ Clicked Half portion button: "${halfText.trim().replace(/\s+/g, ' ')}"`);
    await mobilePage.waitForTimeout(500);
  }

  // B. Click Full Portion
  const fullBtn = await mobilePage.$('.heritage-portion-btn-full');
  if (fullBtn) {
    const fullText = await fullBtn.innerText();
    await fullBtn.click();
    console.log(`✓ Clicked Full portion button: "${fullText.trim().replace(/\s+/g, ' ')}"`);
    await mobilePage.waitForTimeout(500);
  }

  // C. Scroll to Momo Junction and test 3-tier matrix buttons
  const momoSection = await mobilePage.$('#chapter-momo-junction');
  if (momoSection) {
    await momoSection.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(600);

    const vegMomoBtn = await momoSection.$('.heritage-matrix-btn-veg');
    if (vegMomoBtn) {
      await vegMomoBtn.click();
      console.log('✓ Clicked Veg Momo matrix button');
      await mobilePage.waitForTimeout(400);
    }

    const panMomoBtn = await momoSection.$('.heritage-matrix-btn-paneer');
    if (panMomoBtn) {
      await panMomoBtn.click();
      console.log('✓ Clicked Paneer Momo matrix button');
      await mobilePage.waitForTimeout(400);
    }

    const chzMomoBtn = await momoSection.$('.heritage-matrix-btn-cheese');
    if (chzMomoBtn) {
      await chzMomoBtn.click();
      console.log('✓ Clicked Corn N Cheese Momo matrix button');
      await mobilePage.waitForTimeout(400);
    }

    const momoMatrixScreenshot = path.join(outDir, 'phase8_momo_matrix_selected.png');
    await mobilePage.screenshot({ path: momoMatrixScreenshot });
    console.log(`✓ Saved Momo Matrix Interaction Screenshot: ${momoMatrixScreenshot}`);
  }

  // D. Verify floating cart bar and open Cart Drawer / Modal
  const floatingBar = await mobilePage.$('.menu-floating-cart-bar');
  if (floatingBar) {
    console.log('✓ Floating cart bar is visible on screen');
    const viewCartBtn = await mobilePage.$('.cart-bar-action');
    if (viewCartBtn) {
      await viewCartBtn.click();
      console.log('✓ Clicked "View Cart" button to open Cart Drawer');
      await mobilePage.waitForTimeout(800);

      const cartModal = await mobilePage.$('.menu-cart-modal');
      if (cartModal) {
        console.log('✓ Cart Drawer / Modal opened successfully!');
        const cartDrawerScreenshot = path.join(outDir, 'phase8_cart_drawer_opened.png');
        await mobilePage.screenshot({ path: cartDrawerScreenshot });
        console.log(`✓ Saved Cart Drawer Screenshot: ${cartDrawerScreenshot}`);
      } else {
        console.warn('⚠️ .menu-cart-modal element not found after click');
      }
    }
  } else {
    console.warn('⚠️ Floating cart bar not detected');
  }

  await mobileContext.close();
  await browser.close();
  console.log('\n[Phase 8 Capture] All baseline and interactive captures completed successfully!');
}

capturePhase8Baseline().catch((err) => {
  console.error('[Phase 8 Capture] Error:', err);
  process.exit(1);
});
