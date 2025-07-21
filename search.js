const data = [
    { title: "Ankara", imageUrl: "images/ankara/ankara1.jpg", link: "ankara.html" },
    { title: "Agbada", imageUrl: "images/agbada/agbada1.jpg", link: "agbada.html" },
    { title: "Corporate", imageUrl: "images/corporate/corporate1.jpg", link: "corporate.html" },
    { title: "Joggers", imageUrl: "images/joggers/joggers1.jpg", link: "joggers.html" },
    { title: "Tracksuit", imageUrl: "images/tracksuit/tracksuit1.jpg", link: "tracksuit.html" },
    { title: "Senator", imageUrl: "images/senator/senator1.jpg", link: "senator.html" },
    { title: "School Sportswear", imageUrl: "images/school-sports/sports1.jpg", link: "school-sports.html" }
];

const searchInput = document.getElementById("search-input");
const suggestionsContainer = document.getElementById("suggestions-container");
const searchBox = document.getElementById("search-box");
const toggleSearchBtn = document.getElementById("toggle-search");

let searchVisible = false;

// Toggle search bar visibility
toggleSearchBtn.addEventListener("click", () => {
    searchVisible = !searchVisible;
    searchBox.style.display = searchVisible ? "block" : "none";
    if (searchVisible) searchInput.focus();
});

// Listen for input changes
searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.trim().toLowerCase();
    suggestionsContainer.innerHTML = "";

    if (searchTerm === "") {
        suggestionsContainer.style.display = "none";
        return;
    }

    const searchResults = data.filter(item => item.title.toLowerCase().includes(searchTerm));

    if (searchResults.length > 0) {
        searchResults.forEach(result => {
            const suggestionElement = document.createElement("div");
            suggestionElement.classList.add("suggestion-item");

            const titleLink = document.createElement("a");
            titleLink.href = result.link;
            titleLink.innerHTML = highlightMatch(result.title, searchTerm);

            if (result.imageUrl) {
                const imgElement = document.createElement("img");
                imgElement.src = result.imageUrl;
                suggestionElement.appendChild(imgElement);
            }

            suggestionElement.appendChild(titleLink);
            suggestionsContainer.appendChild(suggestionElement);

            // Clicking a suggestion will navigate to the respective page
            suggestionElement.addEventListener("click", () => {
                window.location.href = result.link; // Redirect to the page
            });
        });
        suggestionsContainer.style.display = "block";
    } else {
        suggestionsContainer.innerHTML = "<p style='padding: 8px;'>No results found.</p>";
        suggestionsContainer.style.display = "block";
    }
});

// Function to highlight matching text
function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<span class='highlight'>$1</span>");
}

// Hide suggestions when clicking outside
document.addEventListener("click", (e) => {
    if (!searchBox.contains(e.target)) {
        suggestionsContainer.style.display = "none";
    }
});
