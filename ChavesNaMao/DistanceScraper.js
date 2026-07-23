// Exports the distance scraper
export async function DistanceScraper(browser, address, city) {

    // Lauches maps
    const mapsPage = await browser.newPage();
    await mapsPage.goto('https://www.google.com/maps/dir///@-58.8040002,-12.3285873,3z/data=!4m2!4m1!3e2?entry=ttu&g_ep=EgoyMDI2MDcxOS4wIKXMDSoASAFQAw%3D%3D');

    // Try catch to avoid erros
    try {
        
        // Fills in the search inputs in google maps
        await mapsPage.waitForSelector('input[aria-label*="ponto de partida"]', { timeout: 10000 });
        const startInput = await mapsPage.$('input[aria-label*="ponto de partida"]');
        const destinationInput = await mapsPage.$('input[aria-label*="destino"]');
        await startInput.type(address);
        await destinationInput.type(`Centro, ${city}`);

        // Presses the search button
        await mapsPage.waitForSelector('button[aria-label="Pesquisar"]');
        await mapsPage.$eval('button[aria-label="Pesquisar"]', (button) => button.click());

        // TryChatch in the case the info that we want does not appear (maps might not find it)
        try {

            // Searches the information that we want (the first distance from poit a to the center of the city by foot);
            await mapsPage.waitForSelector('.MespJc', { timeout: 5000 });
            const rawDistance = await mapsPage.evaluate(() => {
                // Searches the big div first (MespJc), and then it searches by the class info unic to that text (fontBodyMedium);
                return ((document.querySelector('.MespJc')).querySelector('[class*="fontBodyMedium"]').innerText.trim());
            });

            // Processes the distance
            let processedDistance = rawDistance.replace(/[^\d,. ]/g, '').trim();
            processedDistance = processedDistance.replace(',', '.');
            processedDistance = parseFloat(processedDistance);

            // Closes the page
            await mapsPage.close();

            // Garants that the distance is in km
            if (rawDistance.includes('km')) {
                return processedDistance;
            }
            else{
                return processedDistance/1000;
            }
        } catch (error) {

            // If distance not found, logs it and returns null. Also closes the page :)
            console.log('Distance not found');
            await mapsPage.close();
            return null
        }

    } catch (error) {

        // If it falils up there (where the input fields are being processed) it gives catastrophic error, logs it, returns null, closes the page
        console.log('Catastrophic error');
        console.log(error);
        await mapsPage.close();
        return null
    }
}