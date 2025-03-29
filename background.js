// time before i can refetch
const timeBeforeDebounce = 5 * 60 * 1000; // 5 minutes
const urlToGetEIPs = 'https://eip.epitech.eu/api/projects?scholar_year=2024&user_projects=false&starred_projects=false&offset=0'

// some usefull variables
var bearer = undefined;
var debounce = false;

// when a request is made
async function onRequest(details) {
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        // checking for dum stuff (debounce + if no tabs)
        if (debounce)
            return;
        if (!tabs.length)
            return;

        // checking if its the right url youre in + right url youre requesting
        const activeTab = tabs[0];
        if (!activeTab.url.includes("https://eip.epitech.eu/projects"))
            return;
        if (!/\/api\/projects(?!\/\d+($|\?))/i.test(details.url))
            return;
        if (!details.requestHeaders)
            return;

        // get the bearer
        details.requestHeaders.forEach((header) => {
            if (bearer)
                return;
            if (header.name.toLowerCase() === "authorization")
                bearer = header.value;
        });
        if (!bearer)
            return;

        try {
            // fetching the stuff (and set the debounce)
            console.log("im fetching...");
            debounce = true;
            const response = await fetch(
                urlToGetEIPs,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': bearer,
                    }
                }
            );
            
            // if status is an error i just reset debounce, else, i reset after timeBeforeDebounce
            const status = response.status;
            const firstLetterStatus = status.toString()[0];
            if (firstLetterStatus != '2' && firstLetterStatus != '3') {
                debounce = false;
                return;
            }
            setTimeout(() => { debounce = false; }, timeBeforeDebounce);
            
            // getting the data and put it in the local storage as project
            const data = await response.json();
            console.log(data);
            chrome.storage.local.set({ 'projectData': data });

        } catch (error) {
            debounce = false;
            console.warn("womp womp cant fetch data:", error);
        }
    });
}

// used because i wanna catch your bearer to make request (dont worry i dont do anything strange)
chrome.webRequest.onBeforeSendHeaders.addListener(onRequest, { urls: ["<all_urls>"] }, ["requestHeaders"]);

// silly little hello
chrome.runtime.onInstalled.addListener(async () => {
    console.log("hello its paul");
});