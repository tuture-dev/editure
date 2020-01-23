import { Transforms, Editor } from "slate";

export const withHeadings = editor => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    insertBreak();

    let heading;

    const [match] = Editor.nodes(editor, {
      match: n => {
        if (n.type && n.type.startsWith("heading-")) {
          heading = n.type;
          return true;
        }
        return false;
      }
    });

    if (match) {
      toggleHeading(editor, heading);
    }
  };

  return editor;
};

export const isHeadingActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });

  return !!match;
};

export const toggleHeading = (editor, format) => {
  const isActive = isHeadingActive(editor, format);

  Transforms.setNodes(
    editor,
    {
      type: isActive ? null : format
    },
    {
      match: n => Editor.isBlock(editor, n)
    }
  );
};
