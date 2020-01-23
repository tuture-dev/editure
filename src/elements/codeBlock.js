import React, { useState, useEffect, useCallback } from "react";
import { useSlate } from "slate-react";
import { Transforms, Editor, Element } from "slate";

const CodeBlockElement = props => {
  const { element } = props;
  const { lang: defaultLang = "" } = element;

  const [lang, setLang] = useState(defaultLang || "");
  const editor = useSlate();

  function handleChange(event) {
    setLang(event.target.value);

    Transforms.setNodes(
      editor,
      { lang: event.target.value },
      {
        match: n => Element.matches(n, { type: "code-block" })
      }
    );
  }

  return (
    <div {...props.attributes}>
      <select value={lang} onChange={handleChange}>
        <option value="markup">HTML</option>
        <option value="css">CSS</option>
        <option value="javascript">JavaScript</option>
      </select>
      <pre>
        <code lang={`language-${lang}`}>{props.children}</code>
      </pre>
    </div>
  );
};

export default CodeBlockElement;
