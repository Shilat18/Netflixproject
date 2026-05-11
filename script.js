
function validateForm(){
    let email = document.getElementById("email").value;
     let password = document.getElementById("password").value;
    let message = document.getElementById("message");

    // בדיקת אימייל
    if (!email.includes("@")) {
        message.innerText = "Invalid email";
        return;
    }

    // בדיקת סיסמה
    if (password.length < 8) {
        message.innerText = "Password is too short";
        return;
    }

    // מעבר לעמוד הפיד
    window.location.href = "homepage.html";
}
//קטלוג
const catalog= [
    {id: 1 , title:"Stranger things", type:"series",img:"images/strangerP.jpg", likes:0 , liked: false},
    {id: 2, title:"Ginny and Georgia", type:"series",img:"images/ginny-georgia.jpg", likes:0 , liked: false},
    {id: 3 , title:"Bridgerton", type:"series",img:"images/bridgertonP.jpg", likes:0 , liked: false},
    {id: 4 , title:"Wednesdy" , type:"series" ,img:"images/wednesdayP.jpg", likes: 0, liked: false},
    { id: 5 , title:"The Kissing Booth" , type:"movie",img:"images/kissing.jpg" ,likes:0, liked: false},
    {id: 6, title:"Emily in Paris", type:"series" ,img:"images/emilyinparis.jpg", likes:0, liked:false}
];
let items = [...catalog];
//פיד
function renderFeed(list = items) {
    const container = document.getElementById("feedContainer");

    if (!container) return;

    container.innerHTML = "";

    list.forEach(item => {
        container.innerHTML += `
            <div class="post">
             <img src="${item.img}" class="card-img" />
                <h3>${item.title}</h3>
                <p>${item.type}</p>

                <button onclick="likeItem(${item.id})"
                    id="btn-${item.id}"
                    class="likeBtn">
                    ❤️ ${item.likes}
                </button>
            </div>
        `;
    });
}


// פונקציית לייק
function likeItem(id) {

    items.forEach(item => {

        if (item.id === id) {

            item.liked = !item.liked;

            if (item.liked) {
                item.likes++;
            }
            else {
                item.likes--;
            }
        }
    });

    renderFeed();
}

function setupSearch() {
    const input = document.getElementById("searchInput");

    if (!input) return;

    input.addEventListener("input", function (e) {
        const value = e.target.value.toLowerCase();

        const filtered = items.filter(item =>
            item.title.toLowerCase().includes(value)
        );

        renderFeed(filtered);
    });
}

function sortAZ() {
    const sorted = [...items].sort((a, b) =>
        a.title.localeCompare(b.title)
    );

    renderFeed(sorted);
}


// הפעלת הפיד
renderFeed();
setupSearch();
renderFeed();



