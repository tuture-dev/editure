import React, { useMemo, useState, useCallback, useReducer } from "react";

// Import the Slate editor factory.
import { createEditor, Editor } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { css } from "emotion";

import customPlugins from "./plugins";
import Leaf from "./marks";
import Element from "./blocks";
import createHotKeysHandler from "./hotkeys";
import { Toolbar, EditLink, HoverLink } from "./components";
import highlight from "./utils/highlight";
import { createDropListener } from "./utils/image";
import { updateLastSelection } from "./utils/selection";
import { linkReducer } from "./utils/link";

import "./App.css";
import "material-icons/iconfont/material-icons.css";

const defaultValue = [
  {
    type: "paragraph",
    children: [
      { text: "there is a " },
      { text: "link", link: true, url: "https://tuture.co" },
      { text: " in the paragraph." }
    ]
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
  const decorate = useCallback(args => highlight(args), []);

  const hotKeyHandler = createHotKeysHandler(editor);

  const [linkStatus, linkDispatch] = useReducer(linkReducer, {
    isEditing: false,
    text: "",
    url: ""
  });

  console.log("linkStatus", linkStatus);
  console.log("editor", editor);
  updateLastSelection(editor.selection);

  return (
    <div
      className={css`
        max-width: 42em;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
      `}>
      <Slate editor={editor} value={value} onChange={value => setValue(value)}>
        <Toolbar linkDispatch={linkDispatch} />
        <HoverLink dispatch={linkDispatch} />
        <EditLink link={linkStatus} dispatch={linkDispatch} />
        <Editable
          decorate={decorate}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={hotKeyHandler}
          // onClick={() => updateLastSelection(editor.selection)}
          onDrop={createDropListener(editor)}
          autoFocus
        />
      </Slate>
    </div>
  );
};

export default App;
