import { Node } from 'editure';

export type EditorState = {
  value: Node[];
};

const initialState: EditorState = {
  value: [{ type: 'paragraph', children: [{ text: 'editor 1' }] }],
};

export const editor = {
  state: initialState,
  reducers: {
    setValue(state: EditorState, payload: Node[]) {
      return { ...state, value: payload };
    },
  },
};
