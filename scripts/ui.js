function renderRecords(content, regex = null) {
    const tbody = document.getElementById("records-body");
    tbody.innerHTML = "";

    if (content.length === 0) {
        const row = document.createElement("tr");
        const message = records.length === 0
            ? "No records yet. Add your first expense to get started."
            : "No records match your search.";
        row.innerHTML = "<td colspan='5' class='empty-state'>" + message + "</td>";
        tbody.appendChild(row);
        return;
    }

    for (const record of content) {
        const row = document.createElement("tr");
        row.innerHTML =
            "<td data-label='Description'>" + highlight(record.description, regex) + "</td>" +
            "<td data-label='Amount (RWF)'>" + record.amount + "</td>" +
            "<td data-label='Category'>" + record.category + "</td>" +
            "<td data-label='Date'>" + record.date + "</td>" +
            "<td data-label='Actions'><button class='edit-btn' data-id='" + record.id + "'>Edit</button>" +
            "<button class='delete-btn' data-id='" + record.id + "'>Delete</button></td>";
        tbody.appendChild(row);
    }
}

renderRecords(records);

const sortSelect = document.getElementById("sort-select");
sortSelect.addEventListener("change", function () {
    const choice = sortSelect.value;
    records.sort(function (a, b) {
        if (choice === "amount") {
            return a.amount - b.amount;
        }
        if (choice === "description") {
            return a.description.localeCompare(b.description);
        }
        if (choice === "date") {
            return a.date.localeCompare(b.date);
        }
        return 0;
    });
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
            renderStats();
            renderCap();
            saveRecords();
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
        updateSubmitLabel();
        showSection("add");
    }
});

function renderStats() {
    document.getElementById("count-stats").textContent = records.length;

    let sum = 0;
    for (const record of records) {
        sum = sum + record.amount;
    }
    document.getElementById("sum-stats").textContent = convertAmount(sum);

    const counts = {};
    for (const record of records) {
        if (counts[record.category]) {
            counts[record.category] = counts[record.category] + 1;
        } else {
            counts[record.category] = 1;
        }
    }

    let topCategory = "";
    let topCount = 0;
    for (const category in counts) {
        if (counts[category] > topCount) {
            topCount = counts[category];
            topCategory = category;
        }
    }

    document.getElementById("top-stats").textContent = topCategory;

    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    let weekCount = 0;
    for (const record of records) {
        const recordDate = new Date(record.date);
        if (recordDate >= weekAgo && recordDate <= today) {
            weekCount = weekCount + 1;
        }
    }
    document.getElementById("stat-week").textContent = weekCount + " records";
    renderChart();
}

renderStats();

function renderCap() {
    const capInput = document.getElementById("cap");
    const cap = parseFloat(capInput.value);
    const capMessage = document.getElementById("cap-message");

    let sum = 0;
    for (const record of records) {
        sum = sum + record.amount;
    }

    if (sum > cap) {
        capMessage.setAttribute("aria-live", "assertive");
        capMessage.textContent = "You have exceeded your cap by " + (sum - cap).toFixed(2);
    } else {
        capMessage.setAttribute("aria-live", "polite");
        capMessage.textContent = "You have " + (cap - sum).toFixed(2) + " remaining";
    }
}

renderCap();

const capInput = document.getElementById("cap");
capInput.addEventListener("input", function () {
    renderCap();
    saveCap();
});

function convertAmount(amountInBase) {
    const currency = document.getElementById("currency").value;
    if (currency === "USD") {
        const rate = parseFloat(document.getElementById("rate-usd").value);
        return (amountInBase / rate).toFixed(2) + " USD";
    } else if (currency === "XAF") {
        const rate = parseFloat(document.getElementById("rate-xaf").value);
        return (amountInBase / rate).toFixed(2) + " XAF";
    } else {
        return amountInBase.toFixed(2) + " RWF";
    }
}

function refreshCurrencyView() {
    renderStats();
    saveCurrency();
}

document.getElementById("currency").addEventListener("change", refreshCurrencyView);
document.getElementById("rate-usd").addEventListener("input", refreshCurrencyView);
document.getElementById("rate-xaf").addEventListener("input", refreshCurrencyView);


function renderChart() {
    const svg = document.getElementById("category-chart");
    const legend = document.getElementById("chart-legend");
    svg.innerHTML = "";
    legend.innerHTML = "";

    const totals = {};
    for (const record of records) {
        if (totals[record.category]) {
            totals[record.category] = totals[record.category] + record.amount;
        } else {
            totals[record.category] = record.amount;
        }
    }

    const colors = ["#8a5a44", "#a9745a", "#6b8e6b", "#c89b7b", "#5e3b29", "#9caf88", "#b5651d", "#7d5a50"];

    let grandTotal = 0;
    for (const category in totals) {
        grandTotal = grandTotal + totals[category];
    }
    if (grandTotal === 0) {
        return;
    }

    let startAngle = 0;
    let colorIndex = 0;
    for (const category in totals) {
        const slice = totals[category] / grandTotal;
        const endAngle = startAngle + slice * 2 * Math.PI;

        const x1 = 100 + 90 * Math.sin(startAngle);
        const y1 = 100 - 90 * Math.cos(startAngle);
        const x2 = 100 + 90 * Math.sin(endAngle);
        const y2 = 100 - 90 * Math.cos(endAngle);
        const largeArc = slice > 0.5 ? 1 : 0;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const color = colors[colorIndex % colors.length];
        path.setAttribute("d", "M100,100 L" + x1 + "," + y1 + " A90,90 0 " + largeArc + ",1 " + x2 + "," + y2 + " Z");
        path.setAttribute("fill", color);
        svg.appendChild(path);

        const li = document.createElement("li");
        li.innerHTML = "<span class='legend-dot' style='background:" + color + "'></span>" +
            category + " (" + (slice * 100).toFixed(0) + "%)";
        legend.appendChild(li);

        startAngle = endAngle;
        colorIndex = colorIndex + 1;
    }
}