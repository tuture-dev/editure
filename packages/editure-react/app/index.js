import React, { useMemo, useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { createEditor } from 'tuture-slate';
import { Slate, Editable, withReact } from 'tuture-slate-react';
import { defaultPlugins } from 'editure';

import Leaf from '../src/leaf';
import Element from '../src/element';

const plugins = [withReact, ...defaultPlugins];

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
    <Slate editor={editor} value={value} onChange={newVal => setValue(newVal)}>
      <div style={style}>
        <Editable
          placeholder="Enter something ..."
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </div>
    </Slate>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
