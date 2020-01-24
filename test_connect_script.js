const chromeLauncher = require('chrome-launcher');
const puppeteer = require('puppeteer-extra');
const axios = require('axios');
const pluginStealth = require("puppeteer-extra-plugin-stealth");

puppeteer.use(pluginStealth());
(async () => {
    // Array that will hold our browser instances.
    const INSTANCES = [];
    // Change this number to how many browsers you want open.
    const MAX_BROWSER_INSTANCES = 2;
    // Initializing each Chrome instance manually
    for(let i = 0; i <= MAX_BROWSER_INSTANCES; i++) {
      const chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless']
      });
      const response = await axios.get(`http://localhost:${chrome.port}/json/version`);
      const { webSocketDebuggerUrl } = response.data;
    
      // Connecting the instance using `browserWSEndpoint`
      const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });
      const page = await browser.newPage();

      // This task object will contain our browser, page, and websocket url.
      const task_object = {
        page, browser, webSocketDebuggerUrl, chrome,
        actions: ['']
      }

      // Push the object to our array for future reference.
      INSTANCES.push(task_object);
    }

    console.log("Finished launching our chrome instances.");

    // This for loop is key: We don't await each task. Instead it'll start execution without waiting for the last loop to finish.
    for(let i = 0; i <= INSTANCES.length -1; i++) {
      run_task(i)
    }

    // This for-loop executes actions against each instance.
    async function run_task(i) {
      // Page/Browser Refs
      const page_ref = INSTANCES[i].page;
      const browser_ref = INSTANCES[i].browser;
      const chrome_ref = INSTANCES[i].chrome;
      // Should try/catch these
      await page_ref.goto('https://bot.sannysoft.com/');
      await page_ref.screenshot({ path: 'browser_' + i + '.png', fullPage: true });
      await browser_ref.close();
      await chrome_ref.kill();      
    }

    
    
})();