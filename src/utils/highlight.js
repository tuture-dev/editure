import Prism from "prismjs";

function createDecoration({ path, textStart, textEnd, start, end, className }) {
  if (start >= textEnd || end <= textStart) {
    return null;
  }

  start = Math.max(start, textStart);
  end = Math.min(end, textEnd);

  start -= textStart;
  end -= textStart;

  return {
    anchor: { path, offset: start },
    focus: { path, offset: end },
    className,
    prismToken: true
  };
}

export default ([node, path]) => {
  const decorations = [];
  const grammarName = node.lang;
  const grammar = Prism.languages[grammarName];

  if (!grammar) {
    return [];
  }

  const texts = node.children.map(item => {
    if (item.children) {
      return item.children[0].text;
    }

    return item.text;
  });
  const blockText = texts.join("\n");
  const tokens = Prism.tokenize(blockText, grammar);

  let textStart = 0;
  let textEnd = 0;

  texts.forEach(text => {
    textEnd = textStart + text.length;

    let offset = 0;

    function processToken(token, accu) {
      accu = accu || "";

      if (typeof token === "string") {
        if (accu) {
          const decoration = createDecoration({
            path,
            textStart,
            textEnd,
            start: offset,
            end: offset + token.length,
            className: `prism-token token ${accu}`
          });

          if (decoration) {
            decorations.push(decoration);
          }
        }

        offset += token.length;
      } else {
        accu = `${accu} ${token.type} ${token.alias || ""}`;

        if (typeof token.content === "string") {
          const decoration = createDecoration({
            path,
            textStart,
            textEnd,
            start: offset,
            end: offset + token.content.length,
            className: `prism-token token ${accu}`
          });

          if (decoration) {
            decorations.push(decoration);
          }

          offset += token.content.length;
        } else {
          for (let i = 0; i < token.content.length; i += 1) {
            processToken(token.content[i], accu);
          }
        }
      }
    }

    tokens.forEach(processToken);
    textStart = textEnd + 1;
  });

  return decorations;
};
