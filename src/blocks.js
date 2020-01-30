import React, { useState } from "react";
import { css, cx } from "emotion";
import { useSlate } from "slate-react";
import { Editor, Transforms, Element } from "slate";
import { useSelected, useFocused } from "slate-react";

import { languages, enumPrismLangToLanguage } from "./utils/code";
import { palette, icons, levels } from "./utils/note";
import {
  H1,
  H2,
  H3,
  H4,
  CODE_BLOCK,
  CODE_LINE,
  NUMBERED_LIST,
  BULLETED_LIST,
  PARAGRAPH,
  LIST_ITEM,
  BLOCK_QUOTE,
  NOTE,
  LINK,
  IMAGE,
  HR
} from "./constants";
import { wrapCodeBlock, handleActiveCodeBlock } from "./plugins/codeBlock";
import { wrapBlockquote, handleActiveBlockquote } from "./plugins/blockquote";
import { wrapNote, handleActiveNote } from "./plugins/note";

const bulletedListStyleType = ["disc", "circle", "square"];
const numberedListStyleType = ["decimal", "lower-alpha", "lower-roman"];

const LIST_TYPES = [NUMBERED_LIST, BULLETED_LIST];

const BLOCK_TYPES = [
  H1,
  H2,
  H3,
  H4,
  CODE_BLOCK,
  NUMBERED_LIST,
  BULLETED_LIST,
  PARAGRAPH,
  LIST_ITEM,
  BLOCK_QUOTE,
  NOTE,
  LINK,
  IMAGE,
  HR
];

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
        match: n => Element.matches(n, { type: CODE_BLOCK })
      }
    );
  }

  const selectValue =
    enumPrismLangToLanguage[enumPrismLangToLanguage[lang.toLocaleLowerCase()]];

  return (
    <div {...props.attributes}>
      <select contentEditable={false} value={selectValue} onChange={handleChange}>
        {languages.map(language => (
          <option key={language} value={enumPrismLangToLanguage[language]}>
            {language}
          </option>
        ))}
      </select>
      <div>{props.children}</div>
    </div>
  );
};

const HrElement = ({ attributes, children }) => {
  const selected = useSelected();
  const focused = useFocused();

  return (
    <div
      {...attributes}
      className={css`
        border-bottom: 2px solid #ddd;
        box-shadow: ${selected && focused ? "0 0 0 3px #B4D5FF" : "none"};
      `}>
      {children}
    </div>
  );
};

const ImageElement = props => {
  const { attributes, children, element } = props;
  const selected = useSelected();
  const focused = useFocused();

  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img
          src={element.url}
          alt={element.url}
          className={css`
            display: block;
            margin-left: auto;
            margin-right: auto;
            max-width: 100%;
            max-height: 20em;
            box-shadow: ${selected && focused ? "0 0 0 3px #B4D5FF" : "none"};
          `}
        />
      </div>
      {children}
    </div>
  );
};

const NoteElement = props => {
  const { attributes, children, element } = props;
  const { level: defaultLevel = "default" } = element;

  const realLevel = levels.includes(defaultLevel) ? defaultLevel : "default";

  const [level, setLevel] = useState(realLevel);
  const editor = useSlate();

  function handleChange(event) {
    setLevel(event.target.value);

    Transforms.setNodes(
      editor,
      { level: event.target.value },
      {
        match: n => n.type === NOTE
      }
    );
  }

  const baseStyle = css`
    margin-top: 20px;
    padding: 15px;
    padding-left: 45px;
    position: relative;
    border: 1px solid #eee;
    border-left-width: 5px;
    border-radius: 0px;
    &::before {
      font-family: "FontAwesome";
      font-size: larger;
      left: 15px;
      position: absolute;
      top: 13px;
    }
  `;
  const noteStyle = css`
    border-left-color: ${palette[level].border};
    background-color: ${palette[level].background};
  `;
  const iconStyle =
    level === "default"
      ? ""
      : css`
    &::before {
      content: "${icons[level].content}";
      color: ${icons[level].color};
    }
  `;

  return (
    <div {...attributes} className={cx(baseStyle, noteStyle, iconStyle)}>
      <select contentEditable={false} value={level} onChange={handleChange}>
        {levels.map(level => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
      <div>{children}</div>
    </div>
  );
};

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });

  return !!match;
};

export const detectBlockFormat = (editor, formats = BLOCK_TYPES) => {
  for (const format of formats) {
    if (isBlockActive(editor, format)) {
      return format;
    }
  }
  return null;
};

export const toggleBlock = (editor, format, props, type) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true
  });

  switch (format) {
    case CODE_BLOCK: {
      if (isActive) {
        handleActiveCodeBlock(editor, type);
      } else {
        wrapCodeBlock(editor, props);
      }

      break;
    }

    case BLOCK_QUOTE: {
      if (isActive) {
        handleActiveBlockquote(editor, type);
      } else {
        wrapBlockquote(editor);
      }

      break;
    }

    case NOTE: {
      if (isActive) {
        handleActiveNote(editor, type);
      } else {
        wrapNote(editor, props);
      }

      break;
    }

    default: {
      Transforms.setNodes(editor, {
        type: isActive ? PARAGRAPH : isList ? LIST_ITEM : format
      });
    }
  }

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export default props => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case BLOCK_QUOTE:
      return (
        <blockquote {...attributes}>
          <div>{children}</div>
        </blockquote>
      );
    case BULLETED_LIST:
      return (
        <ul
          {...attributes}
          className={css`
            padding-left: ${(element.level || 0) * 2 + 2}em;
            list-style-type: ${bulletedListStyleType[element.level % 3]};
          `}>
          {children}
        </ul>
      );
    case NUMBERED_LIST:
      return (
        <ol
          {...attributes}
          className={css`
            padding-left: ${(element.level || 0) * 2 + 2}em;
            list-style-type: ${numberedListStyleType[element.level % 3]};
          `}>
          {children}
        </ol>
      );
    case H1:
      return <h1 {...attributes}>{children}</h1>;
    case H2:
      return <h2 {...attributes}>{children}</h2>;
    case H3:
      return <h3 {...attributes}>{children}</h3>;
    case H4:
      return <h4 {...attributes}>{children}</h4>;
    case LIST_ITEM:
      return <li {...attributes}>{children}</li>;
    case CODE_BLOCK:
      return <CodeBlockElement {...props} />;
    case CODE_LINE:
      return <pre {...attributes}>{children}</pre>;
    case NOTE:
      return <NoteElement {...props} />;
    case IMAGE:
      return <ImageElement {...props} />;
    case HR:
      return <HrElement {...props} />;
    case LINK:
      return (
        <a {...attributes} href={element.url}>
          {children}
        </a>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};
