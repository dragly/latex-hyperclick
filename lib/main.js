'use babel'

import path from 'path'
var inputRegExp = /\\(?:input|include|includeonly|subfile){(.*)}/
var refRegExp = /\\[fF]?[rR]ef{(.*)}/
const providerName = "latex-hyperclick"

function isValid(textEditor, text, range) {
    return range.start !== range.end && textEditor.getGrammar().scopeName.startsWith("text.tex.latex")
}

module.exports = {
    getProvider() {
        return [{
            providerName: providerName,
            wordRegExp: inputRegExp,
            getSuggestionForWord(textEditor: TextEditor, text: string, range: Range): HyperclickSuggestion {
                if(isValid(textEditor, text, range)) {
                    var basedir = path.dirname(textEditor.getPath())
                    var filenames = text.match(inputRegExp)[1].split(',').map(
                        filename => path.resolve(basedir, !path.extname(filename) ? filename + '.tex' : filename))

                    return {
                        range: range,
                        callback: filenames.length === 1 ? () => atom.workspace.open(filenames[0]) :
                          filenames.map(filename => ({ title: filename, callback: () => atom.workspace.open(filename)}))
                    }
                }
            },
        }, {
            providerName: providerName,
            wordRegExp: refRegExp,
            getSuggestionForWord(textEditor: TextEditor, text: string, range: Range): HyperclickSuggestion {
                if(isValid(textEditor, text, range)) {
                    var label = text.match(refRegExp)[1]
                    var callback
                    textEditor.scan(new RegExp(`\\\\label{${label}}`), ({stop, range}) => {
                        callback = () => textEditor.setCursorScreenPosition(range.start)
                        stop()
                    })
                    if (callback) return { range: range, callback: callback }
                }
            }
        }]
    }
}
