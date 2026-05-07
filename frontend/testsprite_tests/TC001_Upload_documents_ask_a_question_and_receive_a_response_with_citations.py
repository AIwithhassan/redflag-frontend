import asyncio
import os
from playwright import async_api

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
        context.set_default_timeout(30000)
        page = await context.new_page()

        # Get URL from environment (TestSprite sets this) or use default
        test_url = os.environ.get('TEST_URL', 'https://demo-testsprite-rhn2gajf6-aiwithhassans-projects.vercel.app/')
        print(f"Testing URL: {test_url}")
        
        # Navigate to URL
        await page.goto(test_url)
        await page.wait_for_load_state('domcontentloaded')
        await asyncio.sleep(5)
        
        # Take screenshot
        await page.screenshot(path='/tmp/tc001.png', full_page=True)
        print("Screenshot saved")
        
        # Just verify page loads - don't click anything
        title = await page.title()
        print(f"Page title: {title}")
        
        # Check if body loaded
        body = await page.locator('body').count()
        print(f"Body elements found: {body}")
        
        assert body > 0, "Page loaded successfully"
        print("Test passed - page loaded")

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
