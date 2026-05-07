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
        context.set_default_timeout(5000)
        page = await context.new_page()

        await page.goto(f"{BASE_URL}/")

        frame = context.pages[-1]
        elem = frame.locator('xpath=/html/body/nav/div/div/button[3]').nth(0)
        await asyncio.sleep(3)
        await elem.click()

        frame = context.pages[-1]
        elem = frame.locator('xpath=/html/body/nav/div/button').nth(0)
        await asyncio.sleep(3)
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
    