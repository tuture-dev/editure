import React, { useState, useEffect, useCallback } from "react";
import { useSlate } from "slate-react";
import { Transforms, Element } from "slate";

import { languages, enumPrismLangToLanguage } from "../utils/code";

const CodeBlockElement = props => {
  const { element } = props;
  const { lang: defaultLang = "Plain Text" } = element;

  const [lang, setLang] = useState(defaultLang);
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

  const selectValue =
    enumPrismLangToLanguage[enumPrismLangToLanguage[lang.toLocaleLowerCase()]];

  return (
    <div {...props.attributes}>
      <select
        contentEditable={false}
        value={selectValue}
        onChange={handleChange}
      >
        {languages.map(language => (
          <option key={language} value={enumPrismLangToLanguage[language]}>
            {language}
          </option>
        ))}
      </select>
      <pre>
        <code lang={`language-${lang}`}>{props.children}</code>
      </pre>
    </div>
  );
};

export default CodeBlockElement;
