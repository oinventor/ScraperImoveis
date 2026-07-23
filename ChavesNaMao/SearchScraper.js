// Imports
import puppeteer from "puppeteer";
import { ListingScraper } from "./ListingScraper.js";
import { SheetGenerator } from "./SheetMaker.js";

// Testes
const testUrl = "https://www.chavesnamao.com.br/casas-a-venda/sp-varzea-paulista/?filtro=tim:[25],amax:50";

// configs
const BROWSERCONFIGS = {

    headless: false,
}
const SCRAPERCONFIGS = {

    scrollTimeout: 15
}

// Start the scraper
async function SearchScraper(url) {

    // Try catch for erros    
    try {

        // Browser launch
        const browser = await puppeteer.launch(BROWSERCONFIGS);

        // Main Page launch
        const searchPage = await browser.newPage();

        // Go to the url
        await searchPage.goto(url);

        // Wait some seconds for the page to load properly
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Log the title (for debuging reasons)
        console.log(await searchPage.title()); 

        // Get the first h1 with $eval
        const h1Content = await searchPage.$eval('h1', (result) => result.textContent);
        
        // Log the h1 for debuging reasons
        console.log(h1Content);

        // About the Set data structure. This structure is usefull when you need to have a conglomerate of data that
        // is 100% not going to be repeted inside the structure. The set is REALY heavy on memory, but is relatively fest.
        // Use it ONLY when working with amounts of data that will not blow up the machine.

       // Initiate the contents Set
        const contents = new Set();

        // While for guaranteeing that we are getting all the contents
        while (contents.size < Number(h1Content.slice(0, 2))) {

            // Use the evaluate method. In videos, they often say to use $$eval and $eval, which are two shortcuts for simple elements.
            // Basically, they do what you would do with evaluate. The difference is that with evaluate you can do more complex things,
            // while with the evals you can only retrieve simple things.

            // Now, explaining what eval does, as if you were opening the inspector and using it to navigate the site.
            // This gives you a lot more control :>
            const links = await searchPage.evaluate(() => {
                // Get the real estate listings cards of the site
                const cards = Array.from(document.querySelectorAll('div[id^="rc-"]'));
                // Return the links of the real estate listings and ads they to links
                return Array.from(cards).map(card => (card.querySelector('a.link_rawLink__Tabnf')).getAttribute('href'));
            });

            // Add to the set the curent links that the scraper can see
            links.forEach(link => {
                // This is to avoid overloading the set with more links then nescessary
                if(contents.size < Number(h1Content.slice(0, 2))){
                    contents.add(link);
                }
            });

            // Using the evaluate method here to scroll to the end of the visible page
            await searchPage.evaluate(() => window.scrollBy(0, window.innerHeight));

            // Awaits new promise with timeout of x seconds
            await new Promise((resolve) => setTimeout(resolve, SCRAPERCONFIGS.scrollTimeout));
        }


        // Using for here because it will respect the order of the logic. the foreach does not
        // respect the order of the logic, istead, it will do all at once.

        // Array of objects
        const listeningArr = [];

        // Runs the MiddleWatersSacraper and adds the result (the objct of the listening)
        // to the array of objects
        for(const link of contents){
            listeningArr.push(await ListingScraper(browser, `https://www.chavesnamao.com.br${link}`));
        }

        // Close browser
        await browser.close();

        // Declaring the promise here to have sure that it will return something
        return new Promise((resolve) => resolve(SheetGenerator(listeningArr)));

    } catch (error) {

        // Log the error
        console.log(error)
    }
}

console.log((await SearchScraper(testUrl)));