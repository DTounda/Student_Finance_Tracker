const form = document.querySelector("form");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;

    const descpSpan = document.getElementById("description-error");

    if (!descriptionValidation(description)) {
        descpSpan.textContent = "The description can not start or end with a space.";
    } else if (containDuplicateWords(description)) {
        descpSpan.textContent = "The description has a repeated word.";
    } else {
        descpSpan.textContent = "";
    }

    showError("category-error", categoryCheck(category), "The category can only take letters, spaces and hyphens.");
    showError("amount-error", amountCheck(amount), "The amount can just be a valid number e.g 25.50.");
    showError("date-error", validateDate(date), "Please enter a valide date in the format YYYY-MM-DD.");

});

function showError(spanID, isValid, message) {
    const span = document.getElementById(spanID);
    if (isValid) {
        span.textContent = "";
    }
    else {
        span.textContent = message;
    }
}