const puppeteer = require('puppeteer');

/**
 * Check for console errors in the deployed application
 * This script visits the website and reports any console errors
 */
async function checkForConsoleErrors() {
  console.log('Starting console error check...');
  
  // Launch a headless browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Collect console logs
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    // Log all messages for debugging
    console.log(`[${type}] ${text}`);
    
    // Only collect errors (ignoring common false positives)
    if (type === 'error' && 
        !text.includes('favicon.ico') && // Ignore favicon errors
        !text.includes('net::ERR_ABORTED') && // Ignore aborted requests
        !text.includes('Failed to load resource: the server responded with a status of 403')) { // Ignore 403s on static resources
      consoleMessages.push({
        type,
        text,
        location: msg.location()
      });
    }
  });
  
  try {
    // Visit the page
    console.log('Visiting application URL...');
    await page.goto('https://r8carkxrn0.execute-api.eu-north-1.amazonaws.com/prod/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Add a small delay to catch any delayed errors
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Interact with the page (optional)
    console.log('Simulating user interaction...');
    // For example, click a button if needed
    // await page.click('#some-button');
    
    // Wait again for any errors that might result from interaction
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Print results
    if (consoleMessages.length > 0) {
      console.log('✘ Found console errors:');
      consoleMessages.forEach(msg => {
        console.log(`- ${msg.text} (${msg.location?.url || 'unknown location'})`);
      });
      await browser.close();
      process.exit(1); // Exit with error code
    } else {
      console.log('✓ No console errors detected');
    }
  } catch (error) {
    console.error('Error during testing:', error);
    await browser.close();
    process.exit(1);
  }
  
  await browser.close();
  console.log('Console error check completed');
}

// Run the test
checkForConsoleErrors().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 