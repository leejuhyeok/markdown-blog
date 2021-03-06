var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob;
window.saveAs = window.saveAs || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs;

// Because highlight.js is a bit awkward at times
var languageOverrides = {
    js: 'javascript',
    html: 'xml'
};

var livestyles;

emojify.setConfig({
    img_dir: 'emoji'
});


var md = markdownit({
    html: true,
    highlight: function (code, lang) {
        if (languageOverrides[lang]) lang = languageOverrides[lang];
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, code).value;
            } catch (e) {

            }
        }
        return '';
    }
})
    .use(markdownitFootnote);

var hashto;

function update(e) {
    setOutput(e.getValue());

    //If a title is added to the document it will be the new document.title, otherwise use default
    var headerElements = document.querySelectorAll('h1');
    if (headerElements.length > 0 && headerElements[0].textContent.length > 0) {
        title = headerElements[0].textContent;
    } else {
        title = 'Markdown Editor'
    }

    //To avoid to much title changing we check if is not the same as before
    oldTitle = document.title;
    if (oldTitle != title) {
        oldTitle = title;
        document.title = title;
    }
    clearTimeout(hashto);
    hashto = setTimeout(updateHash, 1000);
}

function setOutput(val) {
    val = val.replace(/<equation>((.*?\n)*?.*?)<\/equation>/ig, function (a, b) {
        return '<img src="http://latex.codecogs.com/png.latex?' + encodeURIComponent(b) + '" />';
    });

    var out = document.getElementById('out');
    var old = out.cloneNode(true);
    out.innerHTML = md.render(val);
    emojify.run(out);

    var allold = old.getElementsByTagName("*");
    if (allold === undefined) return;

    var allnew = out.getElementsByTagName("*");
    if (allnew === undefined) return;

    for (var i = 0, max = Math.min(allold.length, allnew.length); i < max; i++) {
        if (!allold[i].isEqualNode(allnew[i])) {
            out.scrollTop = allnew[i].offsetTop;
            return;
        }
    }
}

CodeMirrorSpellChecker({
    codeMirrorInstance: CodeMirror,
});

var editor = CodeMirror.fromTextArea(document.getElementById('code'), {
    backdrop: "gfm",
    lineNumbers: false,
    matchBrackets: true,
    lineWrapping: true,
    theme: 'base16-light',
    extraKeys: {
        "Enter": "newlineAndIndentContinueMarkdownList"
    }
});
function resize(obj){
    editor.style.height = "1px";
    editor.style.height = (12+editor.scrollHeight)+"px";
}
editor.on('change', update);

function selectionChanger(selection, operator, endoperator) {
    if (selection == "") {
        return operator;
    }
    if (!endoperator) {
        endoperator = operator
    }
    var isApplied = selection.slice(0, 2) === operator && seisAppliedection.slice(-2) === endoperator;
    var finaltext = isApplied ? selection.slice(2, -2) : operator + selection + endoperator;
    return finaltext;
}

editor.addKeyMap({
    // bold
    'Ctrl-B': function (cm) {
        cm.replaceSelection(selectionChanger(cm.getSelection(), '**'));
    },
    // italic
    'Ctrl-I': function (cm) {
        cm.replaceSelection(selectionChanger(cm.getSelection(), '_'));
    },
    // code
    'Ctrl-K': function (cm) {
        cm.replaceSelection(selectionChanger(cm.getSelection(), '`'));
    },
    // keyboard shortcut
    'Ctrl-L': function (cm) {
        cm.replaceSelection(selectionChanger(cm.getSelection(), '<kbd>', '</kbd>'));
    }
});

// document.addEventListener('drop', function (e) {
//     e.preventDefault();
//     e.stopPropagation();
//
//     var reader = new FileReader();
//     reader.onload = function (e) {
//         editor.setValue(e.target.result);
//     };
//
//     reader.readAsText(e.dataTransfer.files[0]);
// }, false);

//Print the document named as the document title encoded to avoid strange chars and spaces
// function saveAsMarkdown() {
//     save(editor.getValue(), document.title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '') + ".md");
// }
//
// //Print the document named as the document title encoded to avoid strange chars and spaces
// function saveAsHtml() {
//     save(document.getElementById('out').innerHTML, document.title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/\s]/gi, '') + ".html");
// }

// document.getElementById('saveas-markdown').addEventListener('click', function() {
//     saveAsMarkdown();
//     hideMenu();
// });
//
// document.getElementById('saveas-html').addEventListener('click', function() {
//     saveAsHtml();
//     hideMenu();
// });


// function save(code, name) {
//     var blob = new Blob([code], {
//         type: 'text/plain'
//     });
//     url = URL.createObjectURL(blob);
//     var link = document.createElement("a");
//     link.setAttribute("href", url);
//     link.setAttribute("download", name);
//     var event = document.createEvent('MouseEvents');
//     event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
//     link.dispatchEvent(event);
//
// }


function clearEditor() {
    editor.setValue("");
}

function toggleNightMode(button) {
    button.classList.toggle('selected');
    document.getElementById('toplevel').classList.toggle('nightmode');
}

function toggleReadMode(button) {
    button.classList.toggle('selected');
    document.getElementById('out').classList.toggle('focused');
    document.getElementById('in').classList.toggle('hidden');
}

function toggleSpellCheck(button) {
    button.classList.toggle('selected');
    document.body.classList.toggle('no-spellcheck');
}

function updateHash() {
    window.location.hash = btoa( // base64 so url-safe
        RawDeflate.deflate( // gzip
            unescape(encodeURIComponent( // convert to utf8
                editor.getValue()
            ))
        )
    );
}

function processQueryParams() {
    var params = window.location.search.split('?')[1];
    if (window.location.hash) {
        document.getElementById('readbutton').click(); // Show reading view
    }
    if (params) {
        var obj = {};
        params.split('&').forEach(function (elem) {
            obj[elem.split('=')[0]] = elem.split('=')[1];
        });
        if (obj.reading === 'false') {
            document.getElementById('readbutton').click(); // Hide reading view
        }
        if (obj.dark === 'true') {
            document.getElementById('nightbutton').click(); // Show night view
        }
    }
}
function readMode() {
    $('#in').toggle('slow');
    $('#out').toggleClass("active");
}

function start() {
    update(editor);
    editor.focus();
}

// window.addEventListener("beforeunload", function (e) {
//     var confirmationMessage = 'It looks like you have been editing something. '
//         + 'If you leave before saving, your changes will be lost.';
//     (e || window.event).returnValue = confirmationMessage; //Gecko + IE
//     return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
// });

