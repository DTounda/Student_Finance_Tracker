function amountCheck(value) {
    const pattern = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
    return pattern.test(value)
}

function descriptionValidation(value) {
    const pattern = /^\S(?:.*\S)?$/;
    return pattern.test(value);
}

function categoryCheck(value) {
    const pattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
    return pattern.test(value)
}

function validateDate(value) {
    const pattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    return pattern.test(value)
}

function containDuplicateWords(value) {
    const pattern = /\b(\w+)\s+\1\b/;
    return pattern.test(value)
}
