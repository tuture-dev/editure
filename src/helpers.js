import { Transforms, Editor, Text } from "slate";

const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === "bold",
      universal: true
    });

    return !!match;
  },

  isCodeMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === "code",
      universal: true
    });

    return !!match;
  },

  isItalicMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === "italic",
      universal: true
    });

    return !!match;
  },

  isUnderlineMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === "underline",
      universal: true
    });

    return !!match;
  },

  isUnderlineMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === "underline",
      universal: true
    });

    return !!match;
  },

  isStrikethroughMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === "strikethrough",
      universal: true
    });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === "codeBlock"
    });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);

    Transforms.setNodes(
      editor,
      { type: isActive ? null : "bold" },
      { match: n => Text.isText(n), split: true }
    );
  },

  toggleCodeMark(editor) {
    const isActive = CustomEditor.isCodeMarkActive(editor);

    Transforms.setNodes(
      editor,
      { type: isActive ? null : "code" },
      { match: n => Text.isText(n), split: true }
    );
  },

  toggleCodeMark(editor) {
    const isActive = CustomEditor.isCodeMarkActive(editor);

    Transforms.setNodes(
      editor,
      { type: isActive ? null : "code" },
      { match: n => Text.isText(n), split: true }
    );
  },

  toggleItalicMark(editor) {
    const isActive = CustomEditor.isItalicMarkActive(editor);

    Transforms.setNodes(
      editor,
      { type: isActive ? null : "italic" },
      { match: n => Text.isText(n), split: true }
    );
  },

  toggleUnderlineMark(editor) {
    const isActive = CustomEditor.isUnderlineMarkActive(editor);

    Transforms.setNodes(
      editor,
      { type: isActive ? null : "underline" },
      { match: n => Text.isText(n), split: true }
    );
  },

  toggleStrikethroughMark(editor) {
    const isActive = CustomEditor.isStrikethroughMarkActive(editor);

    Transforms.setNodes(
      editor,
      { type: isActive ? null : "strikethrough" },
      { match: n => Text.isText(n), split: true }
    );
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);

    Transforms.setNodes(
      editor,
      {
        type: isActive ? null : "codeBlock"
      },
      {
        match: n => Editor.isBlock(editor, n)
      }
    );
  }
};

export default CustomEditor;
