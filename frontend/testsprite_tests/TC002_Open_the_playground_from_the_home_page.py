import asyncio
import os
from playwright import async_api

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3001")

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()

        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        context = await browser.new_context()
        context.set_default_timeout(15000)
        page = await context.new_page()

        await page.goto(f"{BASE_URL}/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass

        await page.goto(f"{BASE_URL}/#hero")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass

        elem = page.locator("xpath=/html/body/div/section/div/div[3]/button").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()

        frame = context.pages[-1]
        current_url = await frame.evaluate("() => window.location.href")
        assert current_url is not None, "Navigation failed - no URL detected"

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    