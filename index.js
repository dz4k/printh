
const
    bold = 'font-weight:bolder',
    ital = 'font-style:italic',
    struck = 'text-decoration:line-through',
    mono = 'font-family:monospace'

const defaultStylesheet = {
    EM:     ital,
    I:      ital,
    CITE:   ital,
    DFN:    ital,
    STRONG: bold,
    B:      bold,
    CODE:   mono + ';color:#080;background:#efefef;outline:1px solid #aaa',
    SAMP:   mono + ';background:black;color:white',
    KBD:    'border:1px solid black;background:#ddd;color:#000;' + 
            'border-radius:2px;font-size:.9em;padding:0 2px;' +
            'box-shadow:0 -2px 0 0 #aaa inset;',
    MARK:   'background:yellow;color:black',
    INS:    'text-decoration:underline',
    DEL:    struck,
    U:      'text-decoration:underline',
    S:      struck,
    HR:     'display:block;border-bottom:1px solid currentcolor',
    SUB:    'font-size:0.85em;vertical-align:sub;',
    SUP:    'font-size:0.85em;vertical-align:super;',
}

/**
 * Usage:
 * <pre><code>
 * console.log(...printh`'Hello, <em>${name}!</em>`))
 * </code></pre>
 * 
 * @param {string[]} parts HTML parts. Will <strong>not</strong> be escaped.
 * @param {string[]} interp Interpolated expression values. Will be escaped.
 */
export default function printh(parts, ...interp) {
    let stylesheet = defaultStylesheet
    if (parts[0] === '%s') {
        stylesheet = interp[0]
        interp[0] = ''
    }

    const msg = String.raw(parts, interp.map(escape)).substring(parts[0] === '%s' ? 2 : 0)
    const $msg = parseHTML(msg)

    const spans = elementToSpans($msg, stylesheet)
    const args = spansToConsoleArgs(spans)
    return args
}

/**
 * 
 * @param {Node} $node 
 */
function elementToSpans($node, stylesheet) {
    const rv = []
    const styleStack = '*' in stylesheet ? [stylesheet['*']] : [];

    walker($node)
    return rv

    function walker($node) {
        if ($node.nodeType === Node.TEXT_NODE) {
            rv.push({
                text: $node.textContent,
                style: styleStack.join(';')
            })
        }

        let styles = '';
        if ($node instanceof HTMLElement) {
            if ($node.tagName in stylesheet) {
                styles += stylesheet[$node.tagName]
            }
            if ($node.hasAttribute('style')) {
                styles += $node.getAttribute('style')
            }
        }
        styleStack.push(styles)
        for (const $child of $node.childNodes) walker($child)
        styleStack.pop()
    }
}

function spansToConsoleArgs(spans) {
    const msg = [], styles = [];

    for (const span of spans) {
        msg.push('%c' + span.text)
        styles.push(span.style)
    }

    return [msg.join(''), ...styles]
}

function escape(string) {
    return string.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\\x22/g, "&quot;")
        .replace(/\\x27/g, "&#039;")
}

/**
 * 
 * @param {string} html 
 * @returns {DocumentFragment}
 */
function parseHTML(html) {
    const tmpl = document.createElement('template')
    tmpl.innerHTML = html
    return tmpl.content.cloneNode(true)
}
