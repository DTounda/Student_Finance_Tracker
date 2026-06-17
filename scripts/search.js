function compileRegex(input) {
    try {
        if (input === "") {
            return null;
        }
        return new RegExp(input, "i");
    } catch {
        return null;
    }
}

function highlight(text, regex) {
    if (regex === null) {
        return text;
    }
    return text.replace(regex, function (match) {
        return "<mark>" + match + "</mark>";
    });
}