/* SHOW / HIDE PASSWORD */
function togglePassword() {
    const input = document.getElementById("password");
    input.type = input.type === "password" ? "text" : "password";
}

const errorMessage = document.getElementById("error_text");

/* LOGIN */
document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    errorMessage.style.display = "none";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if(!username || !password) {
        errorMessage.style.display = "block";
        errorMessage.innerHTML = "Vui lòng nhập đầy đủ thông tin";
        return;
    }
});