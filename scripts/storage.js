const KEY_STORAGE = "finance:records";

function saveRecords() {
    localStorage.setItem(KEY_STORAGE, JSON.stringify(records));
}

function loadRecords() {
    const stored = localStorage.getItem(KEY_STORAGE);
    if (stored === null) {
        return;
    }
    try {
        const data = JSON.parse(stored);
        if (validateRecords(data)) {
            records = data;
        }
        
    } catch {
        
    }
}
loadRecords();
loadCap();
loadCurrency();

function exportRecords() {
    const json = JSON.stringify(records, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "records.json";
    link.click();

    URL.revokeObjectURL(url);
}

const exportBtn = document.getElementById("export-btn");
exportBtn.addEventListener("click", exportRecords);

function saveCap() {
    localStorage.setItem("finance:cap", document.getElementById("cap").value);
}

function loadCap() {
    const storedCap = localStorage.getItem("finance:cap");
    if (storedCap !== null) {
        document.getElementById("cap").value = storedCap;
    }
}

function validateRecords(data) {
    if (!Array.isArray(data)) {
        return false;
    }
    for (const record of data) {
        if (record === null || typeof record !== "object") { return false; }
        if (typeof record.id !== "string") { return false; }
        if (typeof record.description !== "string") { return false; }
        if (typeof record.amount !== "number") { return false; }
        if (typeof record.category !== "string") { return false; }
        if (typeof record.date !== "string") { return false; }
    }
    return true;
}

function importRecords(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = function () {
        const message = document.getElementById("import-message");
        try {
            const data = JSON.parse(reader.result);
            if (!validateRecords(data)) {
                message.textContent = "Import failed: the file structure is not valid.";
                return;
            }
            records = data;
            saveRecords();
            renderRecords(records);
            renderStats();
            renderCap();
            message.textContent = "Import successful: " + records.length + " records loaded.";
        } catch {
            message.textContent = "Import failed: the file is not valid JSON.";
        }
        event.target.value = "";
    };
    reader.readAsText(file);
}

const importInput = document.getElementById("import-file");
importInput.addEventListener("change", importRecords);

function saveCurrency() {
    localStorage.setItem("finance:currency", document.getElementById("currency").value);
    localStorage.setItem("finance:rate-usd", document.getElementById("rate-usd").value);
    localStorage.setItem("finance:rate-xaf", document.getElementById("rate-xaf").value);
}

function loadCurrency() {
    const currency = localStorage.getItem("finance:currency");
    const rateUsd = localStorage.getItem("finance:rate-usd");
    const rateXaf = localStorage.getItem("finance:rate-xaf");
    if (currency !== null) { document.getElementById("currency").value = currency; }
    if (rateUsd !== null) { document.getElementById("rate-usd").value = rateUsd; }
    if (rateXaf !== null) { document.getElementById("rate-xaf").value = rateXaf; }
}