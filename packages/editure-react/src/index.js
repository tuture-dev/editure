import React, { useMemo, useState, useCallback, useReducer } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { css } from "emotion";
import { updateLastSelection, defaultPlugins } from "editure";

import Leaf from "./leaf";
import Element from "./element";
import createHotKeysHandler from "./hotkeys";
import { Toolbar, EditLink, HoverLink } from "./components";
import { createDropListener, withImages } from "./utils/image";
import { linkReducer } from "./utils/link";

import "./index.css";
import "material-icons/iconfont/material-icons.css";

const defaultValue = [
  {
    type: "paragraph",
    children: [
      { text: "There is a " },
      { text: "link", link: true, url: "https://tuture.co" },
      { text: " in the paragraph." }
    ]
  }
];

const plugins = [withReact, withHistory, withImages, ...defaultPlugins];

const Editure = () => {
  const editor = useMemo(
    () => plugins.reduce((editor, plugin) => plugin(editor), createEditor()),
    []
  );
  const [value, setValue] = useState(defaultValue);

  const renderElement = useCallback(Element, []);
  const renderLeaf = useCallback(Leaf, []);

  // 用来控制工具栏按钮的 refs
  const buttonRefs = {
    imageBtnRef: React.createRef(),
    linkBtnRef: React.createRef()
  };

  const hotKeyHandler = createHotKeysHandler(editor, buttonRefs);

  const [linkStatus, linkDispatch] = useReducer(linkReducer, {
    isEditing: false,
    text: "",
    url: ""
  });

  updateLastSelection(editor.selection);

  return (
    <div
      className={css`
        max-width: 42em;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
      `}>
      <Slate
        editor={editor}
        value={value}
        onChange={value => {
          setValue(value);
        }}>
        <Toolbar linkDispatch={linkDispatch} ref={buttonRefs} />
        <HoverLink dispatch={linkDispatch} />
        <EditLink link={linkStatus} dispatch={linkDispatch} />
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={hotKeyHandler}
          onCopy={e => {
            e.clipboardData.setData("application/x-editure-fragment", true);
          }}
          onDrop={createDropListener(editor)}
          autoFocus
        />
      </Slate>
    </div>
  );
};

export default Editure;