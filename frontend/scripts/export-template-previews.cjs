const { chromium } = require('@playwright/test');
const { mkdirSync, statSync } = require('node:fs');
const path = require('node:path');

const outputDirectory = path.resolve(__dirname, '../public/marketing/templates');
const pageUrl = process.env.PREVIEW_EXPORT_URL || 'http://localhost:5173/';

async function exportPreviews() {
  mkdirSync(outputDirectory, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
    });
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; } header { display: none !important; }' });

    const cards = page.locator('#templates [data-template-id]');
    await cards.first().waitFor({ state: 'attached' });
    const count = await cards.count();
    if (count !== 21) throw new Error(`Expected 21 templates, found ${count}.`);

    for (let index = 0; index < count; index += 1) {
      const card = cards.nth(index);
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1200);
      await card.evaluate((element) => {
        const previewFrame = element.firstElementChild;
        if (previewFrame?.children[2]) previewFrame.children[2].style.display = 'none';
        if (previewFrame?.children[3]) previewFrame.children[3].style.display = 'none';
      });
      const templateId = await card.getAttribute('data-template-id');
      const preview = card.locator('.hide-scrollbar');
      await preview.locator('img').evaluateAll((images) =>
        Promise.all(images.map((image) => image.decode().catch(() => undefined)))
      );

      const outputPath = path.join(outputDirectory, `${templateId}.webp`);
      await preview.screenshot({ path: outputPath, type: 'webp', quality: 92, animations: 'disabled' });
      if (statSync(outputPath).size === 0) throw new Error(`Empty preview generated for ${templateId}.`);
      console.log(`Exported ${templateId}.webp`);
    }

    console.log(`Exported ${count} template previews to ${outputDirectory}`);
  } finally {
    await browser.close();
  }
}

exportPreviews().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
