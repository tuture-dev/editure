import React, { useState, useEffect, useCallback } from "react";
import { useSlate } from "slate-react";
import { Transforms, Editor } from "slate";

const CodeBlockElement = props => {
  const [lang, setLang] = useState("");
  const editor = useSlate();

  function handleChange(event) {
    setLang(event.target.value);

    Transforms.setNodes(
      editor,
      {
        type: "code-block",
        lang: event.target.value
      },
      {
        match: n => Editor.isBlock(editor, n)
      }
    );
  }

  return (
    <div {...props.attributes}>
      <select value={lang} onChange={handleChange}>
        <option value="markup">HTML</option>
        <option value="css">CSS</option>
        <option value="js">JavaScript</option>
      </select>
      <pre>
        <code className={`language-${lang}`}>{props.children}</code>
      </pre>
    </div>
  );
};

export default CodeBlockElement;
