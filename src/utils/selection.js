let lastSelection = null;

export const getLastSelection = () => {
  return lastSelection;
};

export const updateLastSelection = selection => {
  if (selection) {
    lastSelection = selection;
  }
};
