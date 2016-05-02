'use babel'

module.exports = {
    getProvider() {
        var inputRegExp = /\\input{(.*)}/
        return {
            providerName: "latex-hyperclick",
            wordRegExp: inputRegExp,
            getSuggestionForWord(textEditor: TextEditor, text: string, range: Range): HyperclickSuggestion {
                if(range.start === range.end) {
                    return undefined
                }
                
                if(textEditor.getGrammar().scopeName !== "text.tex.latex") {
                    return undefined
                }
                
                return {
                    range,
                    callback() {
                        var basedir = path.dirname(textEditor.getPath())
                        var filename = text.replace(inputRegExp, '$1.tex')
                        atom.workspace.open(path.resolve(basedir, filename))
                    },
                };
            },
        }
    }
}
