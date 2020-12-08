numberOfCards = 8;
selectedCard = 1;
showCard(selectedCard);

function hideAllCards() {
    for (i = 0; i < numberOfCards; i++) {
        document.getElementById("card_" + (i + 1).toString()).classList.add("hidden");
    }
}

function showCard(card_number) {
    hideAllCards();
    selectedCard = card_number;
    document.getElementById("card_" + (selectedCard).toString()).classList.remove("hidden");
}

