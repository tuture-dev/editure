import React, { useMemo, useState, useCallback } from "react";

// Import the Slate editor factory.
import { createEditor, Transforms, Editor, Element } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import isHotkey from "is-hotkey";
import { withHistory } from "slate-history";
import { css } from "emotion";
import Prism from "prismjs";

import CustomEditor, {
  withBulletedLists,
  withNumberedLists,
  withHeadings,
  withLinks,
  withImages,
  withHr,
  withShortcuts
} from "./helpers";
import {
  DefaultElement,
  CodeBlockElement,
  LinkElement,
  ImageElement,
  BlockquoteElement,
  BulletedListElement,
  ListItemElement,
  NumberedListElement,
  HeadingOneElement,
  HeadingTwoElement,
  HeadingThreeElement,
  HeadingFourElement,
  HrElement
} from "./elements";
import Leaf, { toggleMark } from "./marks";
import { Toolbar, MarkButton, BlockButton } from "./components";

import "./App.css";
import "material-icons/iconfont/material-icons.css";

const defaultValue = [
  {
    children: [
      {
        text: "Hail Tuture!"
      }
    ]
  }
];

const MARK_HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "ctrl+`": "code",
  "mod+shift+`": "strikethrough"
};

const BLOCK_HOTKEYS = {
  "mod+0": "paragraph",
  "mod+1": "heading-one",
  "mod+2": "heading-two",
  "mod+3": "heading-three",
  "mod+4": "heading-four",
  "mod+shift+c": "code-block",
  "mod+shift+i": "image",
  "mod+shift+u": "block-quote",
  "mod+alt+u": "bulleted-list",
  "mod+alt+o": "numbered-list",
  "mod+alt+-": "hr"
};

const plugins = [
  withReact,
  withHistory,
  withBulletedLists,
  withNumberedLists,
  withHeadings,
  withHr,
  withImages,
  withLinks,
  withShortcuts
];

const App = () => {
  const editor = useMemo(
    () => plugins.reduce((editor, plugin) => plugin(editor), createEditor()),
    []
  );
  const [value, setValue] = useState(defaultValue);

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case "paragraph":
        return <DefaultElement {...props} />;

      case "code-block":
        return <CodeBlockElement {...props} />;

      case "link":
        return <LinkElement {...props} />;

      case "image":
        return <ImageElement {...props} />;

      case "block-quote":
        return <BlockquoteElement {...props} />;

      case "bulleted-list":
        return <BulletedListElement {...props} />;

      case "list-item":
        return <ListItemElement {...props} />;

      case "numbered-list":
        return <NumberedListElement {...props} />;

      case "heading-one":
        return <HeadingOneElement {...props} />;

      case "heading-two":
        return <HeadingTwoElement {...props} />;

      case "heading-three":
        return <HeadingThreeElement {...props} />;

      case "heading-four":
        return <HeadingFourElement {...props} />;

      case "hr":
        return <HrElement {...props} />;

      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  const decorate = useCallback(([node, path]) => {
    const decorations = [];
    const isCodeBlock = Element.matches(node, { type: "code-block" });

    if (isCodeBlock) {
      const grammarName = node.lang;
      const grammar = Prism.languages[grammarName];

      if (!grammar) {
        return [];
      }

      const texts = node.children.map(item => {
        if (item.children) {
          return item.children[0].text;
        }

        return item.text;
      });
      const blockText = texts.join("\n");
      const tokens = Prism.tokenize(blockText, grammar);

      let textStart = 0;
      let textEnd = 0;

      texts.forEach(text => {
        textEnd = textStart + text.length;

        let offset = 0;

        function processToken(token, accu) {
          accu = accu || "";

          if (typeof token === "string") {
            if (accu) {
              const decoration = createDecoration({
                text,
                textStart,
                textEnd,
                start: offset,
                end: offset + token.length,
                className: `prism-token token ${accu}`
              });

              if (decoration) {
                decorations.push(decoration);
              }
            }

            offset += token.length;
          } else {
            accu = `${accu} ${token.type} ${token.alias || ""}`;

            if (typeof token.content === "string") {
              const decoration = createDecoration({
                text,
                textStart,
                textEnd,
                start: offset,
                end: offset + token.content.length,
                className: `prism-token token ${accu}`
              });

              if (decoration) {
                decorations.push(decoration);
              }

              offset += token.content.length;
            } else {
              for (let i = 0; i < token.content.length; i += 1) {
                processToken(token.content[i], accu);
              }
            }
          }
        }

        tokens.forEach(processToken);
        textStart = textEnd + 1;
      });

      function createDecoration({
        text,
        textStart,
        textEnd,
        start,
        end,
        className
      }) {
        if (start >= textEnd || end <= textStart) {
          return null;
        }

        start = Math.max(start, textStart);
        end = Math.min(end, textEnd);

        start -= textStart;
        end -= textStart;

        return {
          anchor: { path, offset: start },
          focus: { path, offset: end },
          className,
          prismToken: true
        };
      }
    }

    console.log("decorations", decorations);
    return decorations;
  }, []);

  return (
    <div
      className={css`
        max-width: 42em;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
      `}
    >
      <Slate
        editor={editor}
        value={value}
        onChange={value => {
          setValue(value);
        }}
      >
        <Toolbar>
          <MarkButton format="bold" icon="format_bold" title="加粗" />
          <MarkButton format="italic" icon="format_italic" title="斜体" />
          <MarkButton
            format="underline"
            icon="format_underlined"
            title="下划线"
          />
          <MarkButton
            format="strikethrough"
            icon="format_strikethrough"
            title="删除线"
          />
          <MarkButton format="code" icon="code" title="内联代码" />
          <BlockButton
            format="link"
            icon="link"
            title="添加链接"
            isBlockActive={CustomEditor.isLinkActive}
            toggleBlock={CustomEditor.toggleLinkElement}
          />
          <BlockButton
            format="heading-one"
            icon="looks_one"
            title="一级标题"
            isBlockActive={CustomEditor.isHeadingActive}
            toggleBlock={CustomEditor.toggleHeading}
          />
          <BlockButton
            format="heading-two"
            icon="looks_two"
            title="二级标题"
            isBlockActive={CustomEditor.isHeadingActive}
            toggleBlock={CustomEditor.toggleHeading}
          />
          <BlockButton
            format="block-quote"
            icon="format_quote"
            title="引用"
            isBlockActive={CustomEditor.isBlockquoteActive}
            toggleBlock={CustomEditor.toggleBlockquoteElement}
          />
          <BlockButton
            format="code-block"
            icon="attach_money"
            title="代码块"
            isBlockActive={CustomEditor.isCodeBlockActive}
            toggleBlock={CustomEditor.toggleCodeBlockElement}
          />
          <BlockButton
            format="numbered-list"
            icon="format_list_numbered"
            title="有序列表"
            isBlockActive={CustomEditor.isNumberedListActive}
            toggleBlock={CustomEditor.toggleNumberedListElement}
          />
          <BlockButton
            format="bulleted-list"
            icon="format_list_bulleted"
            title="无序列表"
            isBlockActive={CustomEditor.isBulletedListActive}
            toggleBlock={CustomEditor.toggleBulletedListElement}
          />
          <BlockButton
            format="image"
            icon="image"
            title="图片"
            isBlockActive={CustomEditor.isImageActive}
            toggleBlock={CustomEditor.toggleImageElement}
          />
          <BlockButton
            format="hr"
            icon="remove"
            title="分割线"
            isBlockActive={CustomEditor.isHrActive}
            toggleBlock={CustomEditor.insertHr}
          />
        </Toolbar>
        <Editable
          decorate={decorate}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          spellCheck
          autoFocus
          onKeyDown={event => {
            console.log("editor", editor);
            for (const hotkey in MARK_HOTKEYS) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = MARK_HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            }

            if (isHotkey("mod+0", event)) {
              event.preventDefault();

              CustomEditor.toggleHeading(editor, "paragraph");
            }

            if (isHotkey("mod+1", event)) {
              event.preventDefault();

              CustomEditor.toggleHeading(editor, "heading-one");
            }

            if (isHotkey("mod+2", event)) {
              event.preventDefault();

              CustomEditor.toggleHeading(editor, "heading-two");
            }

            if (isHotkey("mod+3", event)) {
              event.preventDefault();

              CustomEditor.toggleHeading(editor, "heading-three");
            }

            if (isHotkey("mod+4", event)) {
              event.preventDefault();

              CustomEditor.toggleHeading(editor, "heading-four");
            }

            // 处理代码逻辑
            if (isHotkey("mod+shift+c", event)) {
              event.preventDefault();

              CustomEditor.toggleCodeBlockElement(editor);
            }

            // soft break
            if (
              event.key === "Enter" &&
              (CustomEditor.isCodeBlockActive(editor) ||
                CustomEditor.isBlockquoteActive(editor))
            ) {
              event.preventDefault();

              Transforms.insertText(editor, "\n");
            }

            // 全选，在代码块/引用里面按 mod+a 或者 shift + command + up
            // 应该选择代码块/引用内的内容
            if (isHotkey("mod+a", event) || isHotkey("mod+shift+up", event)) {
              if (
                CustomEditor.isBlockquoteActive(editor) ||
                CustomEditor.isCodeBlockActive(editor)
              ) {
                event.preventDefault();
                let type = "block-quote";

                if (CustomEditor.isCodeBlockActive(editor)) {
                  type = "code-block";
                }

                const match = Editor.above(editor, {
                  match: n => Element.matches(n, { type })
                });

                const path = match[1];

                const anchor = Editor.start(editor, path);
                const focus = Editor.end(editor, path);
                const range = { anchor, focus };
                Transforms.select(editor, range);
              }
            }

            // 删除，在代码块/引用里面按 mod+delete 或者 shift + command + up
            // 应该删除代码块/引用中当前行之前的内容
            if (isHotkey("mod+backspace", event)) {
              event.preventDefault();

              // 具体就是遍历此代码块/引用的  children 数组
              // 找到最近的一个 \n 字符，然后删除此 \n 之后的字符到光标此时选中的字符
              const { selection, children } = editor;
              const { anchor } = selection;
              const { path, offset } = anchor;

              for (let i = 0; i <= anchor.path[1]; i++) {
                const nowSelectionText =
                  children[path[0]].children[i].text || "";

                const sliceOffset =
                  i === anchor.path[1] ? offset : nowSelectionText.length;

                if (nowSelectionText.slice(0, sliceOffset).includes("\n")) {
                  const enterLocation = nowSelectionText.lastIndexOf("\n");

                  const focus = {
                    path: [path[0], i],
                    offset: enterLocation + 1
                  };
                  const range = { anchor: focus, focus: anchor };
                  Transforms.select(editor, range);
                  Transforms.delete(editor);
                } else if (i === 0) {
                  const range = {
                    anchor: { path: [path[0], 0], offset: 0 },
                    focus: anchor
                  };
                  Transforms.select(editor, range);
                  Transforms.delete(editor);
                }

                // const path = match[1];

                // const anchor = Editor.start(editor, path);
                // const focus = Editor.end(editor, path);
                // const range = { anchor, focus };
                // Transforms.select(editor, range);
              }
            }

            if (isHotkey("mod+k", event)) {
              event.preventDefault();

              CustomEditor.toggleLinkElement(editor);
            }

            if (isHotkey("mod+shift+i", event)) {
              event.preventDefault();

              CustomEditor.toggleImageElement(editor);
            }

            if (isHotkey("mod+shift+u", event)) {
              event.preventDefault();

              CustomEditor.toggleBlockquoteElement(editor);
            }

            if (isHotkey("mod+alt+u", event)) {
              event.preventDefault();

              CustomEditor.toggleBulletedListElement(editor);
            }

            if (isHotkey("mod+alt+o", event)) {
              event.preventDefault();

              CustomEditor.toggleNumberedListElement(editor);
            }

            if (isHotkey("mod+alt+-", event)) {
              event.preventDefault();

              CustomEditor.insertHr(editor);
            }
          }}
        />
      </Slate>
    </div>
  );
};

export default App;
