'use babel'

import path from 'path'
var fileRegExp = /(?:\\(?:input|include|includeonly|subfile){(.*)}|^%\s*!T[eE]X\s+root\s*=\s*(.*)$)/
// Refence support for ref, fancyref, cleverref, hyperref, varioref
var refRegExp = /\\(?:eqref|[fF]ref|pageref|[cvrR]ef|[aA]utoref\*?){(.*)}/
const providerName = "latex-hyperclick"

function isValid(textEditor, text, range) {
    return range.start !== range.end && textEditor.getGrammar().scopeName.startsWith("text.tex.latex")
}

module.exports = {
    getProvider() {
        return [{
            providerName: providerName,
            wordRegExp: fileRegExp,
            getSuggestionForWord(textEditor: TextEditor, text: string, range: Range): HyperclickSuggestion {
                if(isValid(textEditor, text, range)) {
                    var basedir = path.dirname(textEditor.getPath())
                    const match = text.match(fileRegExp)
                    const file = match[1] || match[2]
                    var filenames = file.split(',').map(
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
                    textEditor.scan(new RegExp(`\\\\label(?:cref)?{${label}}`), ({stop, range}) => {
                        callback = () => textEditor.setCursorScreenPosition(range.start)
                        stop()
                    })
                    if (callback) return { range: range, callback: callback }
                }
            }
        }]
    }
}
