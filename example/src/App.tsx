import React, { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Editure, Editable } from 'editure-react';
import { updateLastSelection } from 'editure';

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

  const style = {
    margin: '8%',
    width: '700px',
    padding: '1%',
    border: '1px solid grey',
  };

  const value = useSelector((state: RootState) => state.editor.value);
  console.log('nodes', editor.children);

  updateLastSelection(editor.selection);

  return (
    <ButtonRefsContext.Provider value={buttonRefs}>
      <Editure
        editor={editor}
        value={value}
        onChange={(newVal) => dispatch.editor.setValue(newVal)}>
        <Toolbar />
        <div style={style}>
          <Editable
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
      </Editure>
    </ButtonRefsContext.Provider>
  );
}

export default App;
