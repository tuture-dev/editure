export default function withHr(editor) {
  const { isVoid } = editor;

  editor.isVoid = element => {
    return element.type === "hr" ? true : isVoid(element);
  };

  return editor;
}
