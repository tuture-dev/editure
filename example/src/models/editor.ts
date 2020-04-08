import { Node } from 'editure';

export type EditorState = {
  value: Node[];
};

const initialState: EditorState = {
  value: [
    { type: 'paragraph', children: [{ text: 'Write something beautiful here ...' }] },
    { type: 'image', url: 'https://source.unsplash.com/random/400x200', children: [{ text: '' }] },
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
