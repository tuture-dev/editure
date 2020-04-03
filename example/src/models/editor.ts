import { Node } from 'editure';

export type EditorState = {
  value: Node[];
};

const initialState: EditorState = {
  value: [{ type: 'paragraph', children: [{ text: 'Write something beautiful here ...' }] }],
};

export const editor = {
  state: initialState,
  reducers: {
    setValue(state: EditorState, payload: Node[]) {
      return { ...state, value: payload };
    },
  },
};
