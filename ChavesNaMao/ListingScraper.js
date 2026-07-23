// Imports
import { Target } from "puppeteer";
import { DistanceScraper } from "./DistanceScraper.js";

// Exports the listing scraper
export async function ListingScraper(browser, link){

    // Lauches the listing page
    const listingPage = await browser.newPage();
    await listingPage.goto(link);

    // Initiates the description and listing obj variables
    let description;
    const listingObj = {
        advertiser: null,
        phoneNumber: null,
        totalPrice: null,
        usableArea: null,
        totalArea: null,
        bedrooms: null,
        bathrooms: null,
        parkingSpaces: null,
        suites: null,
        balcony: false,
        gourmetBalcony: false,
        barbecue: false,
        pool: false,
        elevator: false,
        hasCondominium: false,
        corner: false,
        city: null,
        neighborhood: null,
        street: null,
        distance: null
    }

    // Phone commands block
    try {

        // Awaits for the phone button, then cliks it
        await listingPage.waitForSelector('#openTel', { timeout: 5000 });
        await listingPage.$eval('#openTel', (button) => button.click());

        // This trycatch is for the case that the forms does not appear and goes direcly to the contact pop up
        try {

            // Awaits for the phones name input to appear, just in case :)
            await listingPage.waitForSelector('#phones-name-input', { timeout: 1000 });
            
            // Sets the variables for the input. Theoretically you can use a single variable and then go putting the inputs
            // But it gets confusing realy fast and, I think it`s just better to do it in blocks
            const nameInput = await listingPage.$('#phones-name-input');
            const emailInput = await listingPage.$('#phones-email-input');
            const phoneInput = await listingPage.$('#phones-phone-input');
            // See this $? It`s similar to the $eval, the diferance is that the $ canot execute a callback and it will return
            // a ElementHandler. In resume, it shoud be used to execute "fisical" actions, like typing and clicking. It`s 
            // specialy useful for inputs!
            
            // Types the infos in the form
            await nameInput.type('Antedigimon');
            await emailInput.type('antedigimon.official@gmail.com');
            await phoneInput.type('11969699669');
            // The method type also has the option to add delay to the typing acion, example type("string", { delay: 30 })
            // This delay will make the typing action slower the more delay. Puting none will make super fast =D 

            // Clicks the submit button
            await listingPage.$eval('#submit-phones-form', (submitInput) => submitInput.click());
            // "BUT ITS A INPUT ELEMENT, WHY NO DO THE CLICK SIMILARLY TO THE WAY YOU DID BEFOUR???"
            // I tried, but it did not work properly. For some reson the site hides the input by putting a label "colision" box
            // o top of the submit input. This couses puppeteer to no be abble to "see" the submit button.
            // And, for this reason I used the $eval. This way, I`m executing the click to submit action direcly trough the DOM

        } catch (error) {
            
            // If needed, put something in here
        }

    // I thouth in putting the not found phone number in here, but I will do that on the block of info filling
    } catch (error) {

        // If needed, put something in here
    }

    // Info filling block

    // Once again doing a moutanin of trycatches, but now is 23:06, my brain is melting, and this is the second time
    // I`m coding all of this. Why the second you ask? Because the first the first verssion was so bad not even I could make
    // Head or tales of it! (btw I think this is awful code arquitecture, but i`m tired man :,( )

    // Advertiser
    try {
        // "el" is for element btw :)
        listingObj.advertiser = await listingPage.$eval('a[class*="publisherTitle"] h2 b', (el) => el.innerText.trim());
        // Setting up the advertiser`s name so then, when making the xsls planilha, it will be easyer
        listingObj.advertiser = { v: listingObj.advertiser, l: { Target: link } };
    } catch (error) {
        
        console.log("advertiser`s name not found");
        listingObj.advertiser = "Not found";
    }
    // Total Price
    try {

        listingObj.totalPrice = await listingPage.$eval('span[class^="style_clamp"]', (el) => Number((el.innerText.trim()).replace(/\D/g, '')));
    } catch (error) {
        
        console.log("Total price not found");
        listingObj.totalPrice = "Not found";
    }
    // Has Condominium
    try {

        listingObj.hasCondominium = await listingPage.$eval('span[class*="style_realtyType"]', (el) => ['Condomínio', 'Apartamento'].some(item => el.innerText.includes(item)));
        // Sorry for the giant comand, but I`m to eppy do think something more elegant right now
    } catch (error) {
        
        console.log("Condominium not found");
        listingObj.hasCondominium = "Not found";
    }
    // Description
    try {

        // There is no description on the listenig obj, but its important for certain furture searches
        description = await listingPage.$eval('p[aria-label="descrição"]', (el) => el.innerText.trim());
    } catch (error) {
        
        console.log("Description not found");
        description = "Not found";
    }
    // PhoneNumber
    try {

        // Finilly the payback fot doing all the celphone comands
        listingObj.phoneNumber = await listingPage.$eval('a[href*="api.whatsapp.com"] b', (el) => el.innerText.trim());
    } catch (error) {

        // If he does not find the whatsapp number, he will get the telephone number
        try {
            
            listingObj.phoneNumber = await listingPage.$eval('a[href^="tel:"] b', (el) => el.innerText.trim());
        } catch (error) {
            
            // And if it does not find eaven that, another not found :)
            console.log("phone not found");
            listingObj.phoneNumber = "Not found";
        }
    }
    // Total Area
    try {

        listingObj.totalArea = await listingPage.$eval('p[aria-label="area-total"] b', (el) => Number((el.innerText.trim()).replace(/\D/g, '')));
    } catch (error) {
        
        // In here, just a null will do
        listingObj.totalArea = null;
    }
    // Usable Area
    try {

        listingObj.usableArea = await listingPage.$eval('p[aria-label="area-util"] b', (el) => Number((el.innerText.trim()).replace(/\D/g, '')));
    } catch (error) {
        
        listingObj.usableArea = null;
    }
    // Bedrooms
    try {

        listingObj.bedrooms = await listingPage.$eval('p[aria-label="Quartos"] b', (el) => Number((el.innerText.trim()).replace(/\D/g, '')));
    } catch (error) {
        
        // In here, there is no need to console log the error, if badroom found, than none exist :)
        listingObj.bedrooms = 0;
    }
    // Bathrooms
    try {

        listingObj.bathrooms = await listingPage.$eval('p[aria-label="Banheiros"] b', (el) => Number((el.innerText.trim()).replace(/\D/g, '')));
    } catch (error) {
        
        listingObj.bathrooms = 0;
    }
    // Parking Spaces
    try {

        listingObj.parkingSpaces = await listingPage.$eval('p[aria-label="Garagens"] b', (el) => Number((el.innerText.trim()).replace(/\D/g, '')));
    } catch (error) {
        
        listingObj.parkingSpaces = 0;
    }
    // Suits
    try {

        listingObj.suites = await listingPage.$eval('p[aria-label="Suites"] b', (el) => Number((el.innerText.trim()).replace(/\D/g, '')));
    } catch (error) {
        
        listingObj.suites = 0;
    }
    // Balcony, Gourmet, Barbecue, Pool, Corner, Elevator
    try {

        // Decided to put all three in one single trycatch. That`s because, defdrentlly from the others, this three 
        // are all on the same places, so there is no worth in doing them in separeted try catches.
        // That being said, bare with me cause this is going to be a tricky one. 
        const optionalItems = await listingPage.$$eval('div[class*="optionalItemsContainer"] ul li', (el) => el.map((item) => item.innerText.trim()));
        // This ginomous thing is a $$eval. In short, $eval that returns a array of elements. Then, 9 times out of
        // 10 a map method will be used to execute a callback on each of the element of the array

        // Balcony
        if (optionalItems.some((item) => item.includes('aranda')) || optionalItems.some((item) => item.includes('acada'))) {

            // First, the some method will execute a callback on each of the element of the array until it recives a true || false
            // Second, this if is to see if there are the "varanda" || "sacada" in the optional items area. if not in the optional
            // items area, it will searh in the description. (finally, the set up is paying back uhhul :) )
            // Third, why no initial letters? To avoid falling in to capital letters
            listingObj.balcony = true
        } else if (/varanda/i.test(description) || /sacada/i.test(description)) {
            
            listingObj.balcony = true
        }

        // Gourmet Balcony
        if (optionalItems.some((item) => item.includes('aranda gourmet')) || optionalItems.some((item) => item.includes('acada gourmet'))) {

            listingObj.balcony = true
        } else if (/varanda gourmet/i.test(description) || /sacada gourmet/i.test(description)) {
            
            listingObj.balcony = true
        }

        // Barbecue
        listingObj.barbecue = optionalItems.some((item) => item.includes('hurras')) == true ? true : /churras/i.test(description);
        // These other ones can be done with ternary ? to make it more stilish and elegant ;}

        // Pool
        listingObj.pool = optionalItems.some((item) => item.includes('iscina')) == true ? true : /piscina/i.test(description);

        // Corner
        listingObj.corner = optionalItems.some((item) => item.includes('squina')) == true ? true : /esquina/i.test(description);

        // Elevator
        listingObj.elevator = optionalItems.some((item) => item.includes('levador')) == true ? true : /elevador/i.test(description);
    } catch (error) {
        
        // In case the optionalItems gives error, this catch will only execute the description checs

        // Balcony
        if (/varanda/i.test(description) || /sacada/i.test(description)) {
            
            listingObj.balcony = true
        }

        // Gourmet Balcony
        if (/varanda gourmet/i.test(description) || /sacada gourmet/i.test(description)) {
            
            listingObj.balcony = true
        }

        // Barbecue
        listingObj.barbecue = /churras/i.test(description);

        // Pool
        listingObj.pool = /piscina/i.test(description);

        // Corner
        listingObj.corner = /esquina/i.test(description);

        // Elevator
        listingObj.elevator = /elevador/i.test(description);
    }
    // Address
    try {
        
        // Just like the previos one, this one isn`t realy worth to make a saparete one for each, so here we go!
        let address = await listingPage.$eval('h2[class*="text-title-lg"]', (el) => el.innerText.trim());
        // Setting the full address from the listening

        // Seting the coma separator for the first time (so we can saparate city from the rest)
        let comaSeparator = address.lastIndexOf(','); // Do I need to explain this one >:I. Yeah, I guess not
        listingObj.city = address.slice(comaSeparator + 1).trim();
        const rest = address.slice(0, comaSeparator).trim();

        // Seting the coma separator for the second time (so we can get the neighborhood)
        comaSeparator = rest.lastIndexOf(',');
        listingObj.neighborhood = rest.slice(comaSeparator + 1).trim();

        // Now the street is just what there is left from the original
        listingObj.street = rest.slice(0, comaSeparator).trim();

        // This next part is to correct the address in case we get a "address indisponible"
        if (address.includes('Endereço Indisponível')) {

            // Prety much just replacing the "address indisponible" with null spaces
            listingObj.city = (listingObj.city).replace('Endereço Indisponível', '').trim();
            listingObj.neighborhood = (listingObj.neighborhood).replace('Endereço Indisponível', '').trim();
            listingObj.street = null;
            // I did not make the address variable to const because we need to change it here in the case described above
            // "Why" do you ask? DISTANCE TIME!!!
            address = address.replace('Endereço Indisponível', '').trim();
        }

        // Finally, for the last part, distance
        listingObj.distance = await DistanceScraper(browser, address, listingObj.city);
    } catch (error) {
        
        // And, last catch
        console.log("Address not found");
        listingObj.city = "Not found";
        listingObj.neighborhood = "Not found";
        listingObj.street = "Not found";
        listingObj.distance = "Not found";
    }

    // Closes the page and returns the object
    await listingPage.close();
    //console.log(listingObj);
    return listingObj;
}