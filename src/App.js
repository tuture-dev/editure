import React, { useEffect, useMemo, useState, useCallback } from "react";

// Import the Slate editor factory.
import { createEditor } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import isHotkey from "is-hotkey";
import { withHistory } from "slate-history";

import CustomEditor, { withLinks } from "./helpers";
import { DefaultElement, CodeBlockElement, LinkElement } from "./elements";
import {
  DefaultMark,
  CodeMark,
  BoldMark,
  ItalicMark,
  UnderlineMark,
  StrikethroughMark
} from "./marks";

const defaultValue = [
  {
    children: [
      {
        text: "A line of text in a paragraph."
      }
    ]
  }
];

const App = () => {
  const editor = useMemo(
    () => withLinks(withHistory(withReact(createEditor()))),
    []
  );
  const [value, setValue] = useState(defaultValue);

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case "codeBlock":
        return <CodeBlockElement {...props} />;

      case "link":
        return <LinkElement {...props} />;

      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback(props => {
    switch (props.leaf.type) {
      case "code":
        return <CodeMark {...props} />;

      case "bold":
        return <BoldMark {...props} />;

      case "italic":
        return <ItalicMark {...props} />;

      case "underline":
        return <UnderlineMark {...props} />;

      case "strikethrough":
        return <StrikethroughMark {...props} />;

      default:
        return <DefaultMark {...props} />;
    }
  }, []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={value => {
        setValue(value);
      }}
    >
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={event => {
          if (isHotkey("alt+mod+c", event)) {
            event.preventDefault();

            CustomEditor.toggleCodeBlockElement(editor);
          }

          if (isHotkey("mod+k", event)) {
            event.preventDefault();

            if (CustomEditor.isLinkActive(editor)) {
              CustomEditor.unwrapLink(editor);
            } else {
              const url = window.prompt("输入链接");

              if (!url) {
                return;
              }

              CustomEditor.wrapLink(editor, url);
            }
          }

          if (isHotkey("mod+b", event)) {
            event.preventDefault();

            CustomEditor.toggleBoldMark(editor);
          }

          if (isHotkey("ctrl+`", event)) {
            event.preventDefault();

            CustomEditor.toggleCodeMark(editor);
          }

          if (isHotkey("mod+i", event)) {
            event.preventDefault();

            CustomEditor.toggleItalicMark(editor);
          }

          if (isHotkey("mod+u", event)) {
            event.preventDefault();

            CustomEditor.toggleUnderlineMark(editor);
          }

          if (isHotkey("shift+alt+`", event)) {
            event.preventDefault();

            CustomEditor.toggleStrikethroughMark(editor);
          }
        }}
      />
    </Slate>
  );
};

export default App;
