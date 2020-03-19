import React, { useMemo, useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Editure, Editable, withReact } from 'editure-react';
import { createEditor, defaultPlugins } from 'editure';

import Leaf from './leaf';
import Element from './element';

import './index.css';

const withDebug = editor => {
  const {
    insertText,
    insertData,
    insertBreak,
    deleteForward,
    deleteBackward,
    deleteFragment,
    normalizeNode
  } = editor;

  editor.insertText = text => {
    console.log('insertText', text);
    insertText(text);
  };

  editor.insertData = data => {
    console.log('insertData', data);
    insertData(data);
  };

  editor.insertBreak = () => {
    console.log('insertBreak');
    insertBreak();
  };

  editor.deleteForward = (...args) => {
    console.log('deleteForward', args);
    deleteForward(...args);
  };

  editor.deleteBackward = (...args) => {
    console.log('deleteBackward', args);
    deleteBackward(...args);
  };

  editor.deleteFragment = () => {
    console.log('deleteFragment');
    deleteFragment();
  };

  editor.normalizeNode = (...args) => {
    // console.log("normalizeNode", args);
    normalizeNode(...args);
  };

  return editor;
};

const plugins = [withReact, withDebug, ...defaultPlugins];

function App() {
  const editor = useMemo(
    () => plugins.reduce((editor, plugin) => plugin(editor), createEditor()),
    []
  );

  const renderElement = useCallback(Element, []);
  const renderLeaf = useCallback(Leaf, []);

  const style = {
    margin: '8%',
    width: '700px',
    padding: '1%',
    border: '1px solid grey'
  };

  const [value, setValue] = useState([
    { type: 'paragraph', children: [{ text: 'editor 1' }] }
  ]);
  console.log('nodes', editor.children);

  return (
    <Editure editor={editor} value={value} onChange={newVal => setValue(newVal)}>
      <div style={style}>
        <Editable
          placeholder="Enter something ..."
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </div>
    </Editure>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
