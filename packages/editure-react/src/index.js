import React, { useMemo, useCallback, useReducer } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { updateLastSelection, defaultPlugins } from 'editure';

import Leaf from './leaf';
import Element from './element';
import createHotKeysHandler from './hotkeys';
import { Toolbar, EditLink, HoverLink } from './components';
import { createDropListener, withImages } from './utils/image';
import { linkReducer } from './utils/link';

import 'material-icons/iconfont/material-icons.css';

const plugins = [withReact, withHistory, withImages, ...defaultPlugins];

const Editure = ({ value, onChange, placeholder, readOnly = false }) => {
  const editor = useMemo(
    () => plugins.reduce((editor, plugin) => plugin(editor), createEditor()),
    []
  );

  const renderElement = useCallback(Element, []);
  const renderLeaf = useCallback(Leaf, []);

  // Refs for controlling buttons.
  const buttonRefs = {
    imageBtnRef: React.createRef(),
    linkBtnRef: React.createRef()
  };

  const hotKeyHandler = createHotKeysHandler(editor, buttonRefs);

  const [linkStatus, linkDispatch] = useReducer(linkReducer, {
    isEditing: false,
    text: '',
    url: ''
  });

  updateLastSelection(editor.selection);

  return (
    <Slate editor={editor} value={value} onChange={onChange}>
      <Toolbar linkDispatch={linkDispatch} ref={buttonRefs} />
      <HoverLink dispatch={linkDispatch} />
      <EditLink link={linkStatus} dispatch={linkDispatch} />
      <Editable
        placeholder={placeholder}
        readOnly={readOnly}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={hotKeyHandler}
        onCopy={e => {
          e.clipboardData.setData('application/x-editure-fragment', true);
        }}
        onDrop={createDropListener(editor)}
        autoFocus
      />
    </Slate>
  );
};

export default Editure;
