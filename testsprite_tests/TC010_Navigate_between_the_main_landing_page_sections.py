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

        # Click 'How It Works' nav button
        elem = page.get_by_role("button", name="How It Works")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()

        # Verify the How It Works section scrolled into view
        section = page.locator("#how-it-works")
        await section.wait_for(state="attached", timeout=5000)

        # Click 'Playground' nav button
        elem = page.get_by_role("button", name="Playground")
        await elem.first.wait_for(state="visible", timeout=10000)
        await elem.first.click()

        # Verify Playground loaded
        upload = page.locator("input[type='file']")
        await upload.wait_for(state="attached", timeout=10000)
        assert await upload.count() > 0, "Playground view not displayed after clicking Playground nav"

        # Click 'Configuration' nav button
        elem = page.get_by_role("button", name="Configuration")
        await elem.first.wait_for(state="visible", timeout=10000)
        await elem.first.click()

        # Verify Configuration view displayed
        save_btn = page.get_by_role("button", name="Save Configuration")
        await save_btn.wait_for(state="visible", timeout=10000)
        assert await save_btn.is_visible(), "Configuration view not displayed after clicking Configuration nav"

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    