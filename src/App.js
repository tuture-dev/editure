import React, { useEffect, useMemo, useState, useCallback } from "react";

// Import the Slate editor factory.
import {
  createEditor,
  Transforms,
  Editor,
  Text,
  Node,
  Element,
  Range
} from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import isHotkey from "is-hotkey";

const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === "bold",
      universal: true
    });

    return !!match;
  },

  isCodeMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === "code",
      universal: true
    });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === "codeBlock"
    });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);

    Transforms.setNodes(
      editor,
      { type: isActive ? null : "bold" },
      { match: n => Text.isText(n), split: true }
    );
  },

  toggleCodeMark(editor) {
    const isActive = CustomEditor.isCodeMarkActive(editor);

    Transforms.setNodes(
      editor,
      { type: isActive ? null : "code" },
      { match: n => Text.isText(n), split: true }
    );
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);

    Transforms.setNodes(
      editor,
      {
        type: isActive ? null : "codeBlock"
      },
      {
        match: n => Editor.isBlock(editor, n)
      }
    );
  }
};

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
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState(defaultValue);

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case "codeBlock":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback(props => {
    switch (props.leaf.type) {
      case "bold":
        return <BoldMark {...props} />;

      case "code":
        return <CodeMark {...props} />;

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

            CustomEditor.toggleCodeBlock(editor);
          }

          if (isHotkey("mod+b", event)) {
            event.preventDefault();

            CustomEditor.toggleBoldMark(editor);
          }

          if (isHotkey("ctrl+`", event)) {
            event.preventDefault();

            CustomEditor.toggleCodeMark(editor);
          }
        }}
      />
    </Slate>
  );
};

const CodeElement = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const DefaultElement = props => {
  return <p {...props.attributes}>{props.children}</p>;
};

const CodeMark = props => {
  return <code {...props.attributes}>{props.children}</code>;
};

const BoldMark = props => {
  return (
    <span {...props.attributes} style={{ fontWeight: "bold" }}>
      {props.children}
    </span>
  );
};

const ItalicMark = props => {
  return <i {...props.attributes}>{props.children}</i>;
};

const DefaultMark = props => {
  return <span {...props.attributes}>{props.children}</span>;
};

export default App;
