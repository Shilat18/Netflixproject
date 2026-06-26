function validateForm() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    if (!email.includes("@")) {
        message.innerText = "Invalid email";
        return;
    }

    if (password.length < 8) {
        message.innerText = "Password is too short";
        return;
    }

    window.location.href = "homepage.html";
}

function setupSearch() {
    const input = document.getElementById("searchInput");

    if (!input) {
        return;
    }

    input.addEventListener("input", function (event) {
        const value = event.target.value.toLowerCase();
        const cards = document.querySelectorAll(".feed-card");

        cards.forEach(function (card) {
            const title = card.dataset.title || "";
            card.style.display = title.includes(value) ? "" : "none";
        });
    });
}

function sortAZ() {
    document.querySelectorAll(".movie-row").forEach(function (row) {
        const cards = Array.from(row.children);

        cards
            .sort(function (a, b) {
                const titleA = (a.querySelector(".feed-card") || a).dataset.title || "";
                const titleB = (b.querySelector(".feed-card") || b).dataset.title || "";
                return titleA.localeCompare(titleB);
            })
            .forEach(function (card) {
                row.appendChild(card);
            });
    });
}

setupSearch();
