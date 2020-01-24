import React, { useState, useEffect, useCallback } from "react";
import { useSlate } from "slate-react";
import { Transforms, Editor, Element } from "slate";

const languages = [
  "Plain Text",
  "Bash",
  "Basic",
  "C",
  "C++",
  "C#",
  "CSS",
  "Dart",
  "Diff",
  "Dockerfile",
  "Erlang",
  "Git",
  "Go",
  "GraphQL",
  "Groovy",
  "HTML",
  "HTTP",
  "Java",
  "JavaScript",
  "JSON",
  "JSX",
  "KaTeX",
  "Kotlin",
  "Less",
  "Makefile",
  "Markdown",
  "MATLAB",
  "Nginx",
  "Objective-C",
  "Pascal",
  "Perl",
  "PHP",
  "PowerShell",
  "Protobuf",
  "Python",
  "R",
  "Ruby",
  "Rust",
  "Scala",
  "Shell",
  "SQL",
  "PL/SQL",
  "Swift",
  "TypeScript",
  "VB.net",
  "Velocity",
  "XML",
  "YAML",
  "sTeX",
  "LaTeX",
  "SystemVerilog",
  "Tcl",
  "Verilog",
  "Vue",
  "Lua"
];

const mapOptionToValue = optionLang => {
  let optionValue = optionLang
    .toLocaleLowerCase()
    .replace(/(\-)|(\/)|(\.)/g, "");

  return optionValue;
};

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

  return (
    <div {...props.attributes}>
      <select contentEditable={false} value={lang} onChange={handleChange}>
        {languages.map(lang => (
          <option value={mapOptionToValue(lang)}>{lang}</option>
        ))}
      </select>
      <pre>
        <code lang={`language-${lang}`}>{props.children}</code>
      </pre>
    </div>
  );
};

export default CodeBlockElement;
