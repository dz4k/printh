
const defaultStyles = {
    EM: 'font-style: italic',
    STRONG: 'font-weight: bolder',
    CODE: 'font-family: monospace; color: green',
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
    const msg = String.raw(parts, interp.map(escape))
    const $msg = parseHTML(msg)

    const spans = elementToSpans($msg)
    const args = spansToConsoleArgs(spans)
    return args
}

/**
 * 
 * @param {Node} $node 
 */
function elementToSpans($node, baseStyles = 'visibility:visible') {
    const rv = []
    const styleStack = [baseStyles];

    walker($node)
    return rv

    function walker($node) {
        if ($node.nodeType === Node.TEXT_NODE) {
            rv.push({
                text: $node.textContent,
                style: styleStack.join(';')
            })
        }

        if ($node instanceof HTMLElement) {
            let styles = '';
            if ($node.tagName in defaultStyles) {
                styles += defaultStyles[$node.tagName]
            }
            if ($node.hasAttribute('style')) {
                styles += $node.getAttribute('style')
            }
            styleStack.push(styles)
        }
        for (const $child of $node.childNodes) walker($child)
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
    return string
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
