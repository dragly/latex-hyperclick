'use babel'

import path from 'path'

module.exports = {
    getProvider() {
        var inputRegExp = /\\(?:input|include|includeonly|subfile){(.*)}/
        return {
            providerName: "latex-hyperclick",
            wordRegExp: inputRegExp,
            getSuggestionForWord(textEditor: TextEditor, text: string, range: Range): HyperclickSuggestion {
                if(range.start === range.end) {
                    return undefined
                }

                if(!textEditor.getGrammar().scopeName.startsWith("text.tex.latex")) {
                    return undefined
                }

                var basedir = path.dirname(textEditor.getPath())
                var filenames = text.match(inputRegExp)[1].split(',').map(
                  filename => path.resolve(basedir, !path.extname(filename) ? filename + '.tex' : filename))

                return {
                    range: range,
                    callback: filenames.length === 1 ? () => atom.workspace.open(filenames[0]) :
                      filenames.map(filename => ({ title: filename, callback: () => atom.workspace.open(filename)}))
                };
            },
        }
    }
}
