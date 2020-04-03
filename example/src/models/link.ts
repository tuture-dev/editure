export type LinkState = {
  isEditing: boolean;
  text: string;
  url: string;
};

const initialState: LinkState = {
  isEditing: false,
  text: '',
  url: '',
};

export const link = {
  state: initialState,
  reducers: {
    startEdit(state: LinkState) {
      return { ...state, isEditing: true };
    },
    reset(state: LinkState) {
      return { isEditing: false, text: '', url: '' };
    },
    setText(state: LinkState, text: string) {
      return { ...state, text };
    },
    setUrl(state: LinkState, url: string) {
      return { ...state, url };
    },
  },
};
