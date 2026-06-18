const form = document.querySelector("form");
const submitBtn = document.querySelector(".submit-btn");

function updateSubmitLabel() {
    submitBtn.textContent = editingId === null ? "Add expense" : "Save";
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const amount = document.getElementById("amount").value;
    const date = document.getElementById("date").value;

    let isValid = true;

    const descpSpan = document.getElementById("description-error");
    if (!descriptionValidation(description)) {
        descpSpan.textContent = "The description can not start or end with a space.";
        isValid = false;
    } else if (containDuplicateWords(description)) {
        descpSpan.textContent = "The description has a repeated word.";
        isValid = false;
    } else {
        descpSpan.textContent = "";
    }

    if (!categoryCheck(category)) { isValid = false; }
    if (!amountCheck(amount)) { isValid = false; }
    if (!validateDate(date)) { isValid = false; }

    showError("category-error", categoryCheck(category), "The category can only take letters, spaces and hyphens.");
    showError("amount-error", amountCheck(amount), "The amount can just be a valid number e.g 25.50.");
    showError("date-error", validateDate(date), "Please enter a valide date in the format YYYY-MM-DD.");

    if (isValid) {
        if (editingId === null) {
            const newRecord = {
                id: "rec_" + Date.now(),
                description: description,
                amount: parseFloat(amount),
                category: category,
                date: date,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            records.push(newRecord);
        } else {
            const record = records.find(function (r) {
                return r.id === editingId;
            });
            record.description = description;
            record.amount = parseFloat(amount);
            record.category = category;
            record.date = date;
            record.updatedAt = new Date().toISOString();
            editingId = null;
        }
       renderRecords(records);
       renderStats();
       renderCap();
       saveRecords();
       form.reset();
       updateSubmitLabel();
    }
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