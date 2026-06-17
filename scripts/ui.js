function renderRecords(content, regex = null) {
    const tbody = document.getElementById("records-body");
    tbody.innerHTML = "";

    for (const record of content) {
        const row = document.createElement("tr");
        row.innerHTML =
            "<td>" + highlight(record.description, regex) + "</td>" +
            "<td>" + record.amount + "</td>" +
            "<td>" + record.category + "</td>" +
            "<td>" + record.date + "</td>" + 
            "<td><button class='edit-btn' data-id='" + record.id + "'>Edit</button>" +
            "<td><button class='delete-btn' data-id='" + record.id + "'>Delete</button></td>";
        tbody.appendChild(row);
    }
}

renderRecords(records);

let ascendingAmount = true;

const amountSortBtn = document.getElementById("amount-sort");
amountSortBtn.addEventListener("click", function () {
    records.sort(function (value1, value2) {
        if (ascendingAmount) {
            return value1.amount - value2.amount;
        } else {
            return value2.amount - value1.amount;
        }
    });
    ascendingAmount = !ascendingAmount;
    renderRecords(records);
});

let ascendingDescription = true;
const descriptionSortBtn = document.getElementById("description-sort");
descriptionSortBtn.addEventListener("click", function () {
    records.sort(function (value1, value2) {
       if (ascendingDescription) {
        return value1.description.localeCompare(value2.description);
       }
       else {
        return value2.description.localeCompare(value1.description);
       }
    });
    ascendingDescription = !ascendingDescription;
    renderRecords(records);
});

let ascendingDate = true;
const dateSortBtn = document.getElementById("date-sort");
dateSortBtn.addEventListener("click", function () {
    records.sort(function (value1, value2) {
        if (ascendingDate) {
        return value1.date.localeCompare(value2.date);
       }
       else {
        return value2.date.localeCompare(value1.date);
       }
    });
    ascendingDate = !ascendingDate;
    renderRecords(records);
});

const searchInput = document.getElementById("search");
searchInput.addEventListener("input", function () {
    const pattern = searchInput.value;
    const regex = compileRegex(pattern);

    if (regex === null) {
        renderRecords(records);
        return;
    }

    const matches = records.filter(function (record) {
        return regex.test(record.description);
    });
    renderRecords(matches, regex);
});

const recordsBody = document.getElementById("records-body");
recordsBody.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-btn")) {
        const id = event.target.dataset.id;
        const confirmed = confirm("Delete this record?");
        if (confirmed) {
            records = records.filter(function (record) {
                return record.id !== id;
            });
            renderRecords(records);
        }
    } else if (event.target.classList.contains("edit-btn")) {
        const id = event.target.dataset.id;
        const record = records.find(function (r) {
            return r.id === id;
        });
        document.getElementById("description").value = record.description;
        document.getElementById("amount").value = record.amount;
        document.getElementById("category").value = record.category;
        document.getElementById("date").value = record.date;
        editingId = id;
    }
});