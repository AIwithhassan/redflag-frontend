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

        # Click the 'Try the Playground' button in the Hero section
        elem = page.get_by_role("button", name="Try the Playground")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.click()

        # Verify the Playground view is now visible by checking for the file upload input
        upload = page.locator("input[type='file']")
        await upload.wait_for(state="attached", timeout=10000)
        assert await upload.count() > 0, "Playground file upload input not found after navigation"

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())


