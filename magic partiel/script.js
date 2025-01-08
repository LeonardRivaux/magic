function parseMana(str) {
    return str.split(/\s*({\w*})\s*/g).filter(Boolean);
}

async function getSymbols() {
    const url = "https://api.scryfall.com/symbology";
    const symbols = {};

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        const data = await response.json();
        data.data.forEach(symbol => {
            symbols[symbol.symbol] = symbol.svg_uri;
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des symboles :", error);
    }

    return symbols;
}



async function afficherCartes() {
    const urlBase = "https://api.scryfall.com/cards/search";
    const params = "?q=e:ltr+lang:fr&format=json&order=set&unique=prints";
    let url = urlBase + params;
    let hasMore = true;
    let symbols = await getSymbols(); // Récupère le dictionnaire des symboles
    const gridContainer = document.getElementById("grid-container");
    const template = document.getElementById("card-template");

    try {
        while (hasMore) {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }
            const data = await response.json();

            // Parcourir les cartes
            data.data.forEach(card => {
                const clone = template.content.cloneNode(true); // Clone du template
                const cardImg = clone.querySelector(".card-img");
                const cardTitle = clone.querySelector("p");
                const manaCostContainer = document.createElement("div");

                // Remplir les données
                cardImg.src = card.image_uris.normal;
                cardImg.alt = card.printed_name;
                cardTitle.textContent = card.printed_name;

                // Ajouter les coûts de mana
                const manaCostSymbols = parseMana(card.mana_cost);
                manaCostSymbols.forEach(symbol => {
                    const img = document.createElement("img");
                    img.src = symbols[symbol];
                    img.alt = symbol;
                    img.style.width = "20px";
                    img.style.height = "20px";
                    manaCostContainer.appendChild(img);
                });

                // Ajouter le conteneur des coûts sous le titre
                cardTitle.appendChild(manaCostContainer);

                // Ajouter la carte au conteneur de la grille
                gridContainer.appendChild(clone);
            });

            hasMore = data.has_more;
            url = data.next_page; // Prochaine page
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des cartes :", error);
    }
}

// Fonction parseMana (exemple)
function parseMana(manaCost) {
    const regex = /{.*?}/g;
    return manaCost.match(regex) || [];
}

// Appelle la fonction au chargement de la page
window.addEventListener("DOMContentLoaded", afficherCartes);

