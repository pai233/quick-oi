const LANG_C_CPP = 1
/**
 * @param {any} code
 */
function deleteCpp(code) {
    code = code.replace(/\u002f\u002f[\d\w\s\S].*/g,"").trim()
    code = code.replace(/\u002f\*[\w\s\d].*[\s\w\d]\*\u002f/g,"").trim()
    code = code.replace(/\u002f\*[\s\S\w\d]*\*\u002f/g,"").trim()
    console.log(code)
    return code
}
/**
 * @param {any} code
 * @param {any} _LANGUAGE
 */
function deleteAnnotation(code,_LANGUAGE) {
    let codeReturned = "";
    switch (_LANGUAGE) {
        case LANG_C_CPP:
            codeReturned = deleteCpp(code)
            break;
    
        default:
            codeReturned = code
            break;
    }
    return codeReturned;
}
module.exports = {
    deleteAnnotation,
    LANG_C_CPP
}