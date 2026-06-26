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

    window.location.href = "/homepage";
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

function setupMoodPicker() {
    const buttons = document.querySelectorAll(".mood-btn");
    const resultText = document.getElementById("moodResultText");
    const moodCards = document.querySelectorAll("#moodResults .feed-card");

    if (!buttons.length || !moodCards.length) {
        return;
    }

    function showMood(mood, label) {
        let visibleCount = 0;

        moodCards.forEach(function (card) {
            const moods = (card.dataset.moods || "").split(" ");
            const shouldShow = moods.includes(mood);

            card.style.display = shouldShow ? "" : "none";
            if (shouldShow) {
                visibleCount += 1;
            }
        });

        if (resultText) {
            resultText.innerText = visibleCount
                ? label + " - " + visibleCount + " matching titles"
                : "No titles found for " + label;
        }
    }

    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            buttons.forEach(function (item) {
                item.classList.remove("active");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");
            showMood(button.dataset.mood, button.innerText.trim());
        });
    });

    const firstButton = buttons[0];
    showMood(firstButton.dataset.mood, firstButton.innerText.trim());
}

setupSearch();
setupMoodPicker();
