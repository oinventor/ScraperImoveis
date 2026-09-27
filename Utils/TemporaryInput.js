// This script is just a temporary way to allow inputs from someone. A front will be done :} (one thay).

// Imports
import readline from "node:readline";
import SearchScraperC from "../ChavesNaMao/SearchScraper.js";
import SearchScraperI from "../ImoveisWeb/SearchScraper.js";

// Code

// Interface creation (to allow the inputs)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Opens a question
rl.question('Cole aqui o link de pesquisa (chaves na mao ou imoveisweb): ', async (link) => {

    // Start the scraper passing the link
    link.includes('chavesnamao') ? await SearchScraperC(link) : await SearchScraperI(link);

    // Close the question
    await rl.close();
});