import { Node } from 'editure';

export type EditorState = {
  value: Node[];
};

const initialState: EditorState = {
  value: [
    { type: 'paragraph', children: [{ text: 'Write something beautiful here ...' }] },
    {
      type: 'image',
      url: 'https://imgkr.cn-bj.ufileos.com/233006bf-c5ae-4721-97ea-4817cd1fc8c7.png',
      children: [{ text: '' }],
    },
    { type: 'paragraph', children: [{ text: 'Write ...' }] },
  ],
};

export const editor = {
  state: initialState,
  reducers: {
    setValue(state: EditorState, payload: Node[]) {
      return { ...state, value: payload };
    },
  },
};
