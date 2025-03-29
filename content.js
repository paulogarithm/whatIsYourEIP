function onNamesFetched(value, callback) {
    if (value == "")
        return

    chrome.storage.local.get(["projectData"], (result) => {
        console.log(result.projectData.results);
        const names = result.projectData.results
            .flatMap(eip => eip.members)
            .filter(member => 
                `${member.firstname} ${member.lastname}`.toLowerCase().includes(value.toLowerCase())
            )
            .map(member => {
                const city = (member.firstname.toLowerCase() == "esteban") && (member.lastname.toLowerCase() == "marques") ?
                    "SodomyLand" :
                    member.city?.name || "Unknown";
                return `${member.firstname} ${member.lastname} (${city})`;
            });

        console.table(names);
        callback(names)
    });
}

function getEIPProjectIDFromName(fullNameAndCity, callback) {
    const fullNameAndCitySmall = fullNameAndCity.toLowerCase();

    chrome.storage.local.get(["projectData"], (result) => {
        if (!result.projectData || !result.projectData.results) {
            callback(null);
            return;
        }

        const project = result.projectData.results.find(eip =>
            eip.members.some(member =>
                fullNameAndCitySmall.startsWith(`${member.firstname} ${member.lastname}`.toLowerCase())
            )
        );
        callback(project ? project.id : null);
    });
}

function onLoad() {
    const targetDiv = document.querySelector(".nk-block-between.flex-column.flex-md-row");
    if (!targetDiv)
        return;

    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.display = "inline-block";

    const userInput = document.createElement("input");
    userInput.placeholder = "Student Name";
    userInput.type = "text";
    userInput.classList.add("form-control", "border-transparent", "form-focus-none");
    userInput.style.width = '100%'; //'25%';

    const listContainer = document.createElement("div");
    listContainer.style.marginTop = "10px";
    listContainer.style.position = 'absolute';
    listContainer.style.zIndex = "10";

    const list = document.createElement("ul");
    list.classList.add("list-group");

    container.appendChild(userInput);
    container.appendChild(listContainer);

    function onInput(names) {
        list.innerHTML = "";

        names.forEach(item => {
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item");
            listItem.textContent = item;
            listItem.addEventListener("click", () => {
                getEIPProjectIDFromName(item, (id) => {
                    const url = new URL(window.location.href);
                    url.pathname += "/" + id;
                    window.location.href = (url.origin + url.pathname);
                })
            })
            list.appendChild(listItem);
            listItem.style.cursor = "pointer";
        });

        listContainer.innerHTML = "";
        listContainer.appendChild(list);
    }

    userInput.addEventListener("input", () => {
        if (userInput.value == "") {
            list.innerHTML = "";
            listContainer.innerHTML = "";
        }
        onNamesFetched(userInput.value, onInput);
    });

    const secondElement = targetDiv.children[1];
    if (secondElement) {
        targetDiv.insertBefore(container, secondElement);
    } else {
        targetDiv.appendChild(container);
    }
}
setTimeout(onLoad, 100);

document.addEventListener("DOMContentLoaded", onLoad);