// Renders HTML (the same template used by the admin panel's client-side
// "Download PDF" button, see app/utils/intakeFormPdfTemplate.ts) to a PDF
// buffer server-side, so it can be attached directly to the Telegram
// notification. Vercel's serverless functions don't ship a real Chromium
// binary, so production uses @sparticuz/chromium (a binary sized to fit
// the function bundle) + puppeteer-core; local dev uses full `puppeteer`
// (bundles its own Chromium) since @sparticuz/chromium's binary is
// Linux-only and won't launch on macOS/Windows dev machines.
export async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  const isServerless = !!process.env.VERCEL;

  const browser = isServerless
    ? await (async () => {
        const chromium = (await import("@sparticuz/chromium")).default;
        const puppeteer = await import("puppeteer-core");
        return puppeteer.launch({
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true,
        });
      })()
    : await (async () => {
        const puppeteer = await import("puppeteer");
        return puppeteer.launch({ headless: true });
      })();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
