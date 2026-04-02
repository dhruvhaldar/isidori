import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Check Linear Systems page
        await page.goto('http://localhost:3000/linear')
        await page.wait_for_load_state('networkidle')
        await page.click('button:has-text("Check DDP Solvability")')
        await page.wait_for_selector('text=Solvable', timeout=5000)
        await page.screenshot(path='linear_ddp.png')

        # Check Simulation page
        await page.goto('http://localhost:3000/simulate')
        await page.wait_for_load_state('networkidle')
        await page.click('button:has-text("Simulate Response")')
        await page.wait_for_selector('text=DDP Solved & Applied', timeout=10000)
        await page.screenshot(path='simulate_ddp.png')

        await browser.close()

asyncio.run(main())