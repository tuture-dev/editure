import React, { useMemo, useState, useCallback } from "react";

// Import the Slate editor factory.
import { createEditor } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { css } from "emotion";

import customPlugins from "./plugins";
import Leaf from "./marks";
import Element, { isBlockActive } from "./blocks";
import createHotKeysHandler from "./hotkeys";
import { Toolbar } from "./components";
import highlight from "./utils/highlight";

import "./App.css";
import "material-icons/iconfont/material-icons.css";

const defaultValue = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }]
  }
];

const plugins = [withReact, withHistory, ...customPlugins];

const App = () => {
  const editor = useMemo(
    () => plugins.reduce((editor, plugin) => plugin(editor), createEditor()),
    []
  );
  const [value, setValue] = useState(defaultValue);

  const renderElement = useCallback(Element, []);
  const renderLeaf = useCallback(Leaf, []);
  const decorate = useCallback(args => highlight(args), [editor]);

  const hotKeyHandler = createHotKeysHandler(editor);

  console.log("editor", editor);

  return (
    <div
      className={css`
        max-width: 42em;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
      `}>
      <Slate editor={editor} value={value} onChange={value => setValue(value)}>
        <Toolbar />
        <Editable
          decorate={decorate}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={hotKeyHandler}
          spellCheck
          autoFocus
        />
      </Slate>
    </div>
  );
};

export default App;
