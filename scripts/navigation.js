function showSection(id) {
    const sections = document.querySelectorAll("main section");
    for (const section of sections) {
        section.hidden = true;
    }
    const target = document.getElementById(id);
    if (target) {
        target.hidden = false;
    }
}

const navLinks = document.querySelectorAll("nav a");
for (const link of navLinks) {
    link.addEventListener("click", function (event) {
        event.preventDefault();
        const id = link.getAttribute("href").replace("#", "");

        if (id === "add") {
            form.reset();
            editingId = null;
            updateSubmitLabel();
        }

        showSection(id);
    });
}

showSection("dashboard");