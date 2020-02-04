import {
  BLOCK_QUOTE,
  H1,
  H2,
  H3,
  H4,
  H5,
  HR,
  NOTE,
  IMAGE,
  NUMBERED_LIST,
  BULLETED_LIST,
  PARAGRAPH,
  CODE_BLOCK,
  CODE_LINE,
  LIST_ITEM
} from "../../constants";
import { serializeToMarkdown as serialize } from "../markdown";

describe("markdown serialization", () => {
  describe("pure mark", () => {
    test("bare text", () => {
      const node = { text: "test" };
      const output = "test";
      expect(serialize(node)).toBe(output);
    });

    test("bold", () => {
      const node = { bold: true, text: "test" };
      const output = "**test**";
      expect(serialize(node)).toBe(output);
    });

    test("italic", () => {
      const node = { italic: true, text: "test" };
      const output = "*test*";
      expect(serialize(node)).toBe(output);
    });

    test("code", () => {
      const node = { code: true, text: "test" };
      const output = "`test`";
      expect(serialize(node)).toBe(output);
    });

    test("strikethrough", () => {
      const node = { strikethrough: true, text: "test" };
      const output = "~~test~~";
      expect(serialize(node)).toBe(output);
    });

    test("underline", () => {
      const node = { underline: true, text: "test" };

      // Underlined text is simply rendered as plain text.
      const output = "test";
      expect(serialize(node)).toBe(output);
    });

    test("link", () => {
      const node = { link: true, text: "test", url: "https://test.com" };
      const output = `[test](https://test.com)`;
      expect(serialize(node)).toBe(output);
    });

    test("sequential marks in a paragraph", () => {
      const node = {
        type: PARAGRAPH,
        children: [
          { text: "This is " },
          { bold: true, text: "bold" },
          { text: " and " },
          { italic: true, text: "italic" },
          { text: " and " },
          { code: true, text: "code" },
          { text: "." }
        ]
      };
      const output = "This is **bold** and *italic* and `code`.";
      expect(serialize(node)).toBe(output);
    });
  });

  describe("mixed marks", () => {
    test("bold + italic", () => {
      const node = { bold: true, italic: true, text: "test" };
      const output = "***test***";
      expect(serialize(node)).toBe(output);
    });

    test("bold + code", () => {
      const node = { bold: true, code: true, text: "test" };
      const output = "**`test`**";
      expect(serialize(node)).toBe(output);
    });

    test("bold + underline", () => {
      const node = { bold: true, underline: true, text: "test" };
      const output = "**test**";
      expect(serialize(node)).toBe(output);
    });

    test("bold + strikethrough", () => {
      const node = { bold: true, strikethrough: true, text: "test" };
      const output = "~~**test**~~";
      expect(serialize(node)).toBe(output);
    });

    test("bold + link", () => {
      const node = { bold: true, link: true, url: "https://test.com", text: "test" };
      const output = `[**test**](${node.url})`;
      expect(serialize(node)).toBe(output);
    });

    test("bold + italic + code + underline + strikethrough + link", () => {
      const node = {
        bold: true,
        italic: true,
        code: true,
        underline: true,
        link: true,
        strikethrough: true,
        url: "https://test.com",
        text: "test"
      };
      const output = `[~~***\`test\`***~~](${node.url})`;
      expect(serialize(node)).toBe(output);
    });

    test("sequential mixed marks", () => {
      const node = {
        type: PARAGRAPH,
        children: [
          { text: "This is " },
          { bold: true, italic: true, text: "mixed" },
          { text: " and " },
          { underline: true, strikethrough: true, text: "mixed" },
          { text: " and " },
          { code: true, link: true, url: "https://test.com", text: "code" },
          { text: "." }
        ]
      };
      const output = `This is ***mixed*** and ~~mixed~~ and [\`code\`](https://test.com).`;
      expect(serialize(node)).toBe(output);
    });
  });

  describe("pure block", () => {
    test("bare paragraph", () => {
      const node = { children: [{ text: "test" }] };
      const output = "test";
      expect(serialize(node)).toBe(output);
    });

    test("paragraph", () => {
      const node = { type: PARAGRAPH, children: [{ text: "test" }] };
      const output = "test";
      expect(serialize(node)).toBe(output);
    });

    test("h1", () => {
      const node = { type: H1, children: [{ text: "test" }] };
      const output = "# test";
      expect(serialize(node)).toBe(output);
    });

    test("h2", () => {
      const node = { type: H2, children: [{ text: "test" }] };
      const output = "## test";
      expect(serialize(node)).toBe(output);
    });

    test("h3", () => {
      const node = { type: H3, children: [{ text: "test" }] };
      const output = "### test";
      expect(serialize(node)).toBe(output);
    });

    test("h4", () => {
      const node = { type: H4, children: [{ text: "test" }] };
      const output = "#### test";
      expect(serialize(node)).toBe(output);
    });

    test("h5", () => {
      const node = { type: H5, children: [{ text: "test" }] };
      const output = "##### test";
      expect(serialize(node)).toBe(output);
    });

    test("hr", () => {
      const node = { type: HR, children: [{ text: "" }] };
      const output = "---";
      expect(serialize(node)).toBe(output);
    });

    test("image", () => {
      const node = {
        type: IMAGE,
        url: "https://test.com/image.png",
        children: [{ text: "" }]
      };
      const output = `![](${node.url})`;
      expect(serialize(node)).toBe(output);
    });

    test("blockquote (single line)", () => {
      const node = {
        type: BLOCK_QUOTE,
        children: [{ type: PARAGRAPH, children: [{ text: "test" }] }]
      };
      const output = "> test";
      expect(serialize(node)).toBe(output);
    });

    test("blockquote (multiple lines)", () => {
      const node = {
        type: BLOCK_QUOTE,
        children: [
          { type: PARAGRAPH, children: [{ text: "foo" }] },
          { type: PARAGRAPH, children: [{ text: "bar" }] }
        ]
      };
      const output = "> foo\n>\n> bar";
      expect(serialize(node)).toBe(output);
    });

    test("note (single line)", () => {
      const node = {
        type: NOTE,
        level: "info",
        children: [{ type: PARAGRAPH, children: [{ text: "test" }] }]
      };

      // Should degrade to blockquote.
      const output = "> test";
      expect(serialize(node)).toBe(output);
    });

    test("note (multiple lines)", () => {
      const node = {
        type: NOTE,
        level: "warning",
        children: [
          { type: PARAGRAPH, children: [{ text: "foo" }] },
          { type: PARAGRAPH, children: [{ text: "bar" }] }
        ]
      };

      // Should degrade to blockquote.
      const output = "> foo\n>\n> bar";
      expect(serialize(node)).toBe(output);
    });

    test("code-block (single line)", () => {
      const node = {
        type: CODE_BLOCK,
        lang: "",
        children: [{ type: CODE_LINE, children: [{ text: "test" }] }]
      };
      const output = "```\ntest\n```";
      expect(serialize(node)).toBe(output);
    });

    test("code-block (multiple lines)", () => {
      const node = {
        type: CODE_BLOCK,
        lang: "",
        children: [
          { type: CODE_LINE, children: [{ text: "foo" }] },
          { type: CODE_LINE, children: [{ text: "bar" }] }
        ]
      };
      const output = "```\nfoo\nbar\n```";
      expect(serialize(node)).toBe(output);
    });

    test("code-block (with lang)", () => {
      const node = {
        type: CODE_BLOCK,
        lang: "javascript",
        children: [
          { type: CODE_LINE, children: [{ text: "foo" }] },
          { type: CODE_LINE, children: [{ text: "bar" }] }
        ]
      };
      const output = "```javascript\nfoo\nbar\n```";
      expect(serialize(node)).toBe(output);
    });

    test("bulleted-list (no level)", () => {
      const node = {
        type: BULLETED_LIST,
        children: [
          { type: LIST_ITEM, children: [{ text: "foo" }] },
          { type: LIST_ITEM, children: [{ text: "bar" }] }
        ]
      };
      const output = "- foo\n- bar";
      expect(serialize(node)).toBe(output);
    });

    test("bulleted-list (with level)", () => {
      const node = {
        type: BULLETED_LIST,
        level: 1,
        children: [
          { type: LIST_ITEM, children: [{ text: "foo" }] },
          { type: LIST_ITEM, children: [{ text: "bar" }] }
        ]
      };
      const output = "  - foo\n  - bar";
      expect(serialize(node)).toBe(output);
    });

    test("bulleted-list (with mixed level)", () => {
      const node = {
        children: [
          {
            type: BULLETED_LIST,
            children: [
              { type: LIST_ITEM, children: [{ text: "foo" }] },
              { type: LIST_ITEM, children: [{ text: "bar" }] }
            ]
          },
          {
            type: BULLETED_LIST,
            level: 1,
            children: [
              { type: LIST_ITEM, children: [{ text: "hello" }] },
              { type: LIST_ITEM, children: [{ text: "world" }] }
            ]
          },
          {
            type: BULLETED_LIST,
            level: 0,
            children: [{ type: LIST_ITEM, children: [{ text: "test" }] }]
          }
        ]
      };
      const output = `- foo
- bar

  - hello
  - world

- test`;

      expect(serialize(node)).toBe(output);
    });

    test("numbered-list (no level)", () => {
      const node = {
        type: NUMBERED_LIST,
        children: [
          { type: LIST_ITEM, children: [{ text: "foo" }] },
          { type: LIST_ITEM, children: [{ text: "bar" }] }
        ]
      };
      const output = "1. foo\n2. bar";
      expect(serialize(node)).toBe(output);
    });

    test("bulleted-list (with level)", () => {
      const node = {
        type: NUMBERED_LIST,
        level: 1,
        children: [
          { type: LIST_ITEM, children: [{ text: "foo" }] },
          { type: LIST_ITEM, children: [{ text: "bar" }] }
        ]
      };
      const output = "  1. foo\n  2. bar";
      expect(serialize(node)).toBe(output);
    });

    test("bulleted-list (with mixed level)", () => {
      // TODO: correct the sequence number
    });

    test("sequential blocks", () => {
      const node = {
        children: [
          { type: H1, children: [{ text: "title" }] },
          { type: PARAGRAPH, children: [{ text: "paragraph1" }] },
          {
            type: BLOCK_QUOTE,
            children: [{ type: PARAGRAPH, children: [{ text: "blockquote" }] }]
          },
          {
            type: CODE_BLOCK,
            lang: "javascript",
            children: [
              { type: CODE_LINE, children: [{ text: "const a = 1;" }] },
              { type: CODE_LINE, children: [{ text: "console.log('hello');" }] }
            ]
          }
        ]
      };
      const output = `# title

paragraph1

> blockquote

\`\`\`javascript
const a = 1;
console.log('hello');
\`\`\``;

      expect(serialize(node)).toBe(output);
    });
  });

  describe("nested blocks", () => {
    test("blockquote as a container", () => {
      const node = {
        type: BLOCK_QUOTE,
        children: [
          { type: PARAGRAPH, children: [{ text: "This is some code:" }] },
          {
            type: CODE_BLOCK,
            lang: "typescript",
            children: [
              { type: CODE_LINE, children: [{ text: "const a = 1;" }] },
              { type: CODE_LINE, children: [{ text: "console.log('hello');" }] }
            ]
          },
          { type: PARAGRAPH, children: [{ text: "Bye." }] }
        ]
      };
      const output = `> This is some code:
>
> \`\`\`typescript
> const a = 1;
> console.log('hello');
> \`\`\`
>
> Bye.`;

      expect(serialize(node)).toBe(output);
    });

    test("note as a container", () => {
      const node = {
        type: NOTE,
        level: "danger",
        children: [
          { type: PARAGRAPH, children: [{ bold: true, text: "Danger!" }] },
          {
            type: BLOCK_QUOTE,
            children: [{ type: PARAGRAPH, children: [{ text: "A really wise quote." }] }]
          },
          { type: PARAGRAPH, children: [{ text: "Bye." }] }
        ]
      };
      const output = `> **Danger!**
>
> > A really wise quote.
>
> Bye.`;

      expect(serialize(node)).toBe(output);
    });
  });
});
