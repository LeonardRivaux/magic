function parseMana(str) {
    return str.split(/\s*({\w*})\s*/g).filter(Boolean);
}