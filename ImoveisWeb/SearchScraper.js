// Imports
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { ListingScraper } from "./ListingScraper.js";
import { SheetGenerator } from "../Utils/SheetMaker.js";

// Testes
const testUrl = "https://www.imovelweb.com.br/apartamentos-venda-serra-negra-sp-30-90-m2.html?utm_source=google&utm_medium=cpc&utm_campaign=Search_BrandTerms&utm_content=Brand_Term&utm_term=imovelweb&iv_=__iv_p_1_a_14183648872_g_131270747251_w_kwd-17894427_h_1031531_ii__d_c_v__n_g_c_537751034622_k_imovelweb_m_b_l__t__e__r__vi__&gad_source=1";

// configs
const BROWSERCONFIGS = {

    headless: false,
    args: ['--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36']
}
// On configs, this args is to set the user agent, basicly it`s a fictional person for using the browser. This way, many sites
// colaborate more with the scraper
const SCRAPERCONFIGS = {

    scrollTimeout: 15
}
// Stealth
puppeteer.use(StealthPlugin());

// Start the scraper // Btw, is this first script a scraper or a crawler I wander ?|
export default async function SearchScraper(url) {

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
        while (contents.size < Number((h1Content.slice(0, 3)).replace(/\D/g, "").trim()) && contents.size < 100) {

            // Use the evaluate method. In videos, they often say to use $$eval and $eval, which are two shortcuts for simple elements.
            // Basically, they do what you would do with evaluate. The difference is that with evaluate you can do more complex things,
            // while with the evals you can only retrieve simple things.

            // Now, explaining what eval does, as if you were opening the inspector and using it to navigate the site.
            // This gives you a lot more control :>
            await searchPage.$eval('.postingsList-module__card-container', (result) => {console.log(result); result.click()});
            const links = await searchPage.evaluate(() => {
                // Get the real estate listings cards of the site
                const cards = Array.from(document.querySelectorAll('.postingsList-module__card-container'));
                // Return the links of the real estate listings and ads they to links
                return Array.from(cards).map(card => (card.querySelector('div[class*="postingCardLayout-module__posting-card-layout"]')).getAttribute('data-to-posting'));
            });

            // Add to the set the curent links that the scraper can see
            links.forEach(link => {
                // This is to avoid overloading the set with more links then nescessary
                if(contents.size < Number((h1Content.slice(0, 3)).replace(/\D/g, "").trim()) && contents.size < 100){
                    contents.add(link);
                }
            });
            // ^ We wold not actualy need all of this, just a simple stuff would sufice. But to lazy to change now :| 

            // Tries to click the next page button
            try {
                await searchPage.$eval('.paging-module__page-arrow', (button) => button.click());
            } catch (error) {
                console.log("butao de + nao encontrado");
            }
        }
        console.log(contents.size);

        // Using for here because it will respect the order of the logic. the foreach does not
        // respect the order of the logic, istead, it will do all at once.

        // Array of objects
        const listeningArr = [];

        // Runs the MiddleWatersSacraper and adds the result (the objct of the listening)
        // to the array of objects
        for(const link of contents){
            listeningArr.push(await ListingScraper(browser, `https://www.imovelweb.com.br${link}`));
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

//console.log((await SearchScraper(testUrl)));