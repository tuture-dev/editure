import React, { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Node, updateLastSelection } from 'editure';
import { Editure, Editable } from 'editure-react';

/** @jsx jsx */
import { css, jsx } from '@emotion/core';

import Element from './element';
import Leaf from './leaf';
import Toolbar from './components/Toolbar';
import { initializeEditor, IEditor } from './editor';
import { createHotKeysHandler, ButtonRefsContext, buttonRefs } from './utils/hotkeys';
import { createDropListener } from './utils/image';
import { RootState, Dispatch } from './store';

function App() {
  const dispatch = useDispatch<Dispatch>();
  const editor = useMemo(initializeEditor, []) as IEditor;

  const renderElement = useCallback(Element, []);
  const renderLeaf = useCallback(Leaf, []);

  const hotKeyHandler = createHotKeysHandler(editor);
  const dropListener = createDropListener(editor);

  const value = useSelector((state: RootState) => state.editor.value);
  console.log('nodes', editor.children);

  function handleChange(newVal: Node[]) {
    dispatch.editor.setValue(newVal);

    if (editor.selection) {
      updateLastSelection(editor.selection);
    }
  }

  return (
    <ButtonRefsContext.Provider value={buttonRefs}>
      <Editure editor={editor} value={value} onChange={handleChange}>
        <div
          css={css`
            width: 666px;
            padding-top: 3rem;
            margin: auto;
          `}>
          <Toolbar />
          <div>
            <Editable
              spellCheck={false}
              placeholder="Enter something ..."
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              onKeyDown={(e) => hotKeyHandler(e as any)}
              onDrop={dropListener}
              onCopy={(e) => {
                e.clipboardData.setData('application/x-editure-fragment', JSON.stringify(true));
              }}
            />
          </div>
        </div>
      </Editure>
    </ButtonRefsContext.Provider>
  );
}

export default App;
