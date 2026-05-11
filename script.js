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
