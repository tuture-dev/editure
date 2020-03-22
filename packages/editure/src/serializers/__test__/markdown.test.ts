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
  LIST_ITEM,
} from 'editure-constants';
import { toMarkdown, parseMarkdown } from '../markdown';

describe('markdown serialization', () => {
  describe('pure mark', () => {
    test('bare text', () => {
      const node = { text: 'test' };
      const output = 'test';
      expect(toMarkdown(node)).toBe(output);
    });

    test('bold', () => {
      const node = { bold: true, text: 'test' };
      const output = '**test**';
      expect(toMarkdown(node)).toBe(output);
    });

    test('italic', () => {
      const node = { italic: true, text: 'test' };
      const output = '*test*';
      expect(toMarkdown(node)).toBe(output);
    });

    test('code', () => {
      const node = { code: true, text: 'test' };
      const output = '`test`';
      expect(toMarkdown(node)).toBe(output);
    });

    test('strikethrough', () => {
      const node = { strikethrough: true, text: 'test' };
      const output = '~~test~~';
      expect(toMarkdown(node)).toBe(output);
    });

    test('underline', () => {
      const node = { underline: true, text: 'test' };

      // Underlined text is simply rendered as plain text.
      const output = 'test';
      expect(toMarkdown(node)).toBe(output);
    });

    test('link', () => {
      const node = { link: true, text: 'test', url: 'https://test.com' };
      const output = `[test](https://test.com)`;
      expect(toMarkdown(node)).toBe(output);
    });

    test('sequential marks in a paragraph', () => {
      const node = {
        type: PARAGRAPH,
        children: [
          { text: 'This is ' },
          { bold: true, text: 'bold' },
          { text: ' and ' },
          { italic: true, text: 'italic' },
          { text: ' and ' },
          { code: true, text: 'code' },
          { text: '.' },
        ],
      };
      const output = 'This is **bold** and *italic* and `code`.';
      expect(toMarkdown(node)).toBe(output);
    });
  });

  describe('mixed marks', () => {
    test('bold + italic', () => {
      const node = { bold: true, italic: true, text: 'test' };
      const output = '***test***';
      expect(toMarkdown(node)).toBe(output);
    });

    test('bold + code', () => {
      const node = { bold: true, code: true, text: 'test' };
      const output = '**`test`**';
      expect(toMarkdown(node)).toBe(output);
    });

    test('bold + underline', () => {
      const node = { bold: true, underline: true, text: 'test' };
      const output = '**test**';
      expect(toMarkdown(node)).toBe(output);
    });

    test('bold + strikethrough', () => {
      const node = { bold: true, strikethrough: true, text: 'test' };
      const output = '~~**test**~~';
      expect(toMarkdown(node)).toBe(output);
    });

    test('bold + link', () => {
      const node = { bold: true, link: true, url: 'https://test.com', text: 'test' };
      const output = `[**test**](${node.url})`;
      expect(toMarkdown(node)).toBe(output);
    });

    test('bold + italic + code + underline + strikethrough + link', () => {
      const node = {
        bold: true,
        italic: true,
        code: true,
        underline: true,
        link: true,
        strikethrough: true,
        url: 'https://test.com',
        text: 'test',
      };
      const output = `[~~***\`test\`***~~](${node.url})`;
      expect(toMarkdown(node)).toBe(output);
    });

    test('sequential mixed marks', () => {
      const node = {
        type: PARAGRAPH,
        children: [
          { text: 'This is ' },
          { bold: true, italic: true, text: 'mixed' },
          { text: ' and ' },
          { underline: true, strikethrough: true, text: 'mixed' },
          { text: ' and ' },
          { code: true, link: true, url: 'https://test.com', text: 'code' },
          { text: '.' },
        ],
      };
      const output = `This is ***mixed*** and ~~mixed~~ and [\`code\`](https://test.com).`;
      expect(toMarkdown(node)).toBe(output);
    });
  });

  describe('pure block', () => {
    test('bare paragraph', () => {
      const node = { children: [{ text: 'test' }] };
      const output = 'test';
      expect(toMarkdown(node)).toBe(output);
    });

    test('paragraph', () => {
      const node = { type: PARAGRAPH, children: [{ text: 'test' }] };
      const output = 'test';
      expect(toMarkdown(node)).toBe(output);
    });

    test('h1', () => {
      const node = { type: H1, children: [{ text: 'test' }] };
      const output = '# test';
      expect(toMarkdown(node)).toBe(output);
    });

    test('h2', () => {
      const node = { type: H2, children: [{ text: 'test' }] };
      const output = '## test';
      expect(toMarkdown(node)).toBe(output);
    });

    test('h3', () => {
      const node = { type: H3, children: [{ text: 'test' }] };
      const output = '### test';
      expect(toMarkdown(node)).toBe(output);
    });

    test('h4', () => {
      const node = { type: H4, children: [{ text: 'test' }] };
      const output = '#### test';
      expect(toMarkdown(node)).toBe(output);
    });

    test('h5', () => {
      const node = { type: H5, children: [{ text: 'test' }] };
      const output = '##### test';
      expect(toMarkdown(node)).toBe(output);
    });

    test('hr', () => {
      const node = { type: HR, children: [{ text: '' }] };
      const output = '---';
      expect(toMarkdown(node)).toBe(output);
    });

    test('image', () => {
      const node = {
        type: IMAGE,
        url: 'https://test.com/image.png',
        children: [{ text: '' }],
      };
      const output = `![](${node.url})`;
      expect(toMarkdown(node)).toBe(output);
    });

    test('blockquote (single line)', () => {
      const node = {
        type: BLOCK_QUOTE,
        children: [{ type: PARAGRAPH, children: [{ text: 'test' }] }],
      };
      const output = '> test';
      expect(toMarkdown(node)).toBe(output);
    });

    test('blockquote (multiple lines)', () => {
      const node = {
        type: BLOCK_QUOTE,
        children: [
          { type: PARAGRAPH, children: [{ text: 'foo' }] },
          { type: PARAGRAPH, children: [{ text: 'bar' }] },
        ],
      };
      const output = '> foo\n>\n> bar';
      expect(toMarkdown(node)).toBe(output);
    });

    test('note (single line)', () => {
      const node = {
        type: NOTE,
        level: 'info',
        children: [{ type: PARAGRAPH, children: [{ text: 'test' }] }],
      };

      // Should degrade to blockquote.
      const output = '> test';
      expect(toMarkdown(node)).toBe(output);
    });

    test('note (multiple lines)', () => {
      const node = {
        type: NOTE,
        level: 'warning',
        children: [
          { type: PARAGRAPH, children: [{ text: 'foo' }] },
          { type: PARAGRAPH, children: [{ text: 'bar' }] },
        ],
      };

      // Should degrade to blockquote.
      const output = '> foo\n>\n> bar';
      expect(toMarkdown(node)).toBe(output);
    });

    test('code-block (single line)', () => {
      const node = {
        type: CODE_BLOCK,
        lang: '',
        children: [{ type: CODE_LINE, children: [{ text: 'test' }] }],
      };
      const output = '```\ntest\n```';
      expect(toMarkdown(node)).toBe(output);
    });

    test('code-block (multiple lines)', () => {
      const node = {
        type: CODE_BLOCK,
        lang: '',
        children: [
          { type: CODE_LINE, children: [{ text: 'foo' }] },
          { type: CODE_LINE, children: [{ text: 'bar' }] },
        ],
      };
      const output = '```\nfoo\nbar\n```';
      expect(toMarkdown(node)).toBe(output);
    });

    test('code-block (with lang)', () => {
      const node = {
        type: CODE_BLOCK,
        lang: 'javascript',
        children: [
          { type: CODE_LINE, children: [{ text: 'foo' }] },
          { type: CODE_LINE, children: [{ text: 'bar' }] },
        ],
      };
      const output = '```javascript\nfoo\nbar\n```';
      expect(toMarkdown(node)).toBe(output);
    });

    test('bulleted-list (no level)', () => {
      const node = {
        type: BULLETED_LIST,
        children: [
          { type: LIST_ITEM, children: [{ text: 'foo' }] },
          { type: LIST_ITEM, children: [{ text: 'bar ' }, { text: 'baz', bold: true }] },
        ],
      };
      const output = '- foo\n- bar **baz**';
      expect(toMarkdown(node)).toBe(output);
    });

    test('bulleted-list (with level)', () => {
      const node = {
        type: BULLETED_LIST,
        level: 1,
        children: [
          { type: LIST_ITEM, children: [{ text: 'foo' }] },
          { type: LIST_ITEM, children: [{ text: 'bar ' }, { text: 'baz', code: true }] },
        ],
      };
      const output = '  - foo\n  - bar `baz`';
      expect(toMarkdown(node)).toBe(output);
    });

    test('bulleted-list (with mixed level)', () => {
      const node = {
        children: [
          {
            type: BULLETED_LIST,
            children: [
              { type: LIST_ITEM, children: [{ text: 'foo' }] },
              { type: LIST_ITEM, children: [{ text: 'bar' }] },
            ],
          },
          {
            type: BULLETED_LIST,
            level: 1,
            children: [
              { type: LIST_ITEM, children: [{ text: 'hello' }] },
              { type: LIST_ITEM, children: [{ text: 'world' }] },
            ],
          },
          {
            type: BULLETED_LIST,
            level: 0,
            children: [{ type: LIST_ITEM, children: [{ text: 'test' }] }],
          },
        ],
      };
      const output = `- foo
- bar

  - hello
  - world

- test`;

      expect(toMarkdown(node)).toBe(output);
    });

    test('numbered-list (no level)', () => {
      const node = {
        type: NUMBERED_LIST,
        children: [
          { type: LIST_ITEM, children: [{ text: 'foo' }] },
          { type: LIST_ITEM, children: [{ text: 'bar' }] },
        ],
      };
      const output = '1. foo\n2. bar';
      expect(toMarkdown(node)).toBe(output);
    });

    test('numbered-list (with level)', () => {
      const node = {
        type: NUMBERED_LIST,
        level: 1,
        children: [
          { type: LIST_ITEM, children: [{ text: 'foo' }] },
          { type: LIST_ITEM, children: [{ text: 'bar' }] },
        ],
      };
      const output = '  1. foo\n  2. bar';
      expect(toMarkdown(node)).toBe(output);
    });

    test('numbered-list (with mixed level)', () => {
      // TODO: correct the sequence number
    });

    test('mixed bulleted and numbered list', () => {
      const node = {
        children: [
          {
            type: BULLETED_LIST,
            children: [
              { type: LIST_ITEM, children: [{ text: 'foo' }] },
              { type: LIST_ITEM, children: [{ text: 'bar' }] },
            ],
          },
          {
            type: NUMBERED_LIST,
            level: 1,
            children: [
              { type: LIST_ITEM, children: [{ text: 'hello' }] },
              { type: LIST_ITEM, children: [{ text: 'world' }] },
            ],
          },
          {
            type: BULLETED_LIST,
            level: 0,
            children: [{ type: LIST_ITEM, children: [{ text: 'test' }] }],
          },
        ],
      };
      const output = `- foo
- bar

  1. hello
  2. world

- test`;
      expect(toMarkdown(node)).toBe(output);
    });

    test('sequential blocks', () => {
      const node = {
        children: [
          { type: H1, children: [{ text: 'title' }] },
          { type: PARAGRAPH, children: [{ text: 'paragraph1' }] },
          {
            type: BLOCK_QUOTE,
            children: [{ type: PARAGRAPH, children: [{ text: 'blockquote' }] }],
          },
          {
            type: CODE_BLOCK,
            lang: 'javascript',
            children: [
              { type: CODE_LINE, children: [{ text: 'const a = 1;' }] },
              { type: CODE_LINE, children: [{ text: "console.log('hello');" }] },
            ],
          },
        ],
      };
      const output = `# title

paragraph1

> blockquote

\`\`\`javascript
const a = 1;
console.log('hello');
\`\`\``;

      expect(toMarkdown(node)).toBe(output);
    });
  });

  describe('nested blocks', () => {
    test('blockquote as a container', () => {
      const node = {
        type: BLOCK_QUOTE,
        children: [
          { type: PARAGRAPH, children: [{ text: 'This is some code:' }] },
          {
            type: CODE_BLOCK,
            lang: 'typescript',
            children: [
              { type: CODE_LINE, children: [{ text: 'const a = 1;' }] },
              { type: CODE_LINE, children: [{ text: "console.log('hello');" }] },
            ],
          },
          { type: PARAGRAPH, children: [{ text: 'Bye.' }] },
        ],
      };
      const output = `> This is some code:
>
> \`\`\`typescript
> const a = 1;
> console.log('hello');
> \`\`\`
>
> Bye.`;

      expect(toMarkdown(node)).toBe(output);
    });

    test('note as a container', () => {
      const node = {
        type: NOTE,
        level: 'danger',
        children: [
          { type: PARAGRAPH, children: [{ bold: true, text: 'Danger!' }] },
          {
            type: BLOCK_QUOTE,
            children: [{ type: PARAGRAPH, children: [{ text: 'A really wise quote.' }] }],
          },
          { type: PARAGRAPH, children: [{ text: 'Bye.' }] },
        ],
      };
      const output = `> **Danger!**
>
> > A really wise quote.
>
> Bye.`;

      expect(toMarkdown(node)).toBe(output);
    });
  });
});

describe('markdown deserialization', () => {
  describe('pure mark', () => {
    test('bare text', () => {
      const markdown = 'test';
      const fragment = [{ type: PARAGRAPH, children: [{ text: 'test' }] }];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('bold', () => {
      const markdown = '**test**';
      const fragment = [{ type: PARAGRAPH, children: [{ text: 'test', bold: true }] }];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('italic', () => {
      const markdown = '*test*';
      const fragment = [{ type: PARAGRAPH, children: [{ text: 'test', italic: true }] }];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('code', () => {
      const markdown = '`test`';
      const fragment = [{ type: PARAGRAPH, children: [{ text: 'test', code: true }] }];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('link', () => {
      const markdown = `[test](https://test.com)`;
      const fragment = [
        {
          type: PARAGRAPH,
          children: [{ link: true, text: 'test', url: 'https://test.com' }],
        },
      ];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('sequential marks in a paragraph', () => {
      const markdown = 'This is **bold** and *italic* and `code`.';
      const fragment = [
        {
          type: PARAGRAPH,
          children: [
            { text: 'This is ' },
            { bold: true, text: 'bold' },
            { text: ' and ' },
            { italic: true, text: 'italic' },
            { text: ' and ' },
            { code: true, text: 'code' },
            { text: '.' },
          ],
        },
      ];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });
  });

  describe('mixed marks', () => {
    test('bold + italic', () => {
      const markdown = '***test***';
      const fragment = [
        { type: PARAGRAPH, children: [{ bold: true, italic: true, text: 'test' }] },
      ];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('bold + code', () => {
      const markdown = '**`test`**';
      const fragment = [{ type: PARAGRAPH, children: [{ bold: true, code: true, text: 'test' }] }];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('bold + link', () => {
      const markdown = '[**test**](https://test.com)';
      const fragment = [
        {
          type: PARAGRAPH,
          children: [{ bold: true, link: true, url: 'https://test.com', text: 'test' }],
        },
      ];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('bold + italic + code + strikethrough + link', () => {
      const markdown = '[***`test`***](https://test.com)';
      const fragment = [
        {
          type: PARAGRAPH,
          children: [
            {
              bold: true,
              italic: true,
              code: true,
              link: true,
              url: 'https://test.com',
              text: 'test',
            },
          ],
        },
      ];

      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('sequential mixed marks', () => {
      const markdown = 'This is ***mixed*** and [`code`](https://test.com).';
      const fragment = [
        {
          type: PARAGRAPH,
          children: [
            { text: 'This is ' },
            { bold: true, italic: true, text: 'mixed' },
            { text: ' and ' },
            { code: true, link: true, url: 'https://test.com', text: 'code' },
            { text: '.' },
          ],
        },
      ];

      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });
  });

  describe('pure block', () => {
    test('h1', () => {
      const markdown = '# test';
      const fragment = [{ type: H1, children: [{ text: 'test' }] }];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('h2', () => {
      const markdown = '## test';
      const fragment = [{ type: H2, children: [{ text: 'test' }] }];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('h3', () => {
      const markdown = '### test';
      const fragment = [{ type: H3, children: [{ text: 'test' }] }];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('h4', () => {
      const markdown = '#### test';
      const fragment = [{ type: H4, children: [{ text: 'test' }] }];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('h5', () => {
      const markdown = '##### test';
      const fragment = [{ type: H5, children: [{ text: 'test' }] }];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('hr', () => {
      const markdown = '---';
      const fragment = [{ type: HR, children: [{ text: '' }] }];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('image', () => {
      const markdown = '![](https://test.com/image.png)';
      const fragment = [
        {
          type: PARAGRAPH,
          children: [
            {
              type: IMAGE,
              url: 'https://test.com/image.png',
              children: [{ text: '' }],
            },
          ],
        },
      ];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('blockquote (single line)', () => {
      const markdown = '> test';
      const fragment = [
        {
          type: BLOCK_QUOTE,
          children: [{ type: PARAGRAPH, children: [{ text: 'test' }] }],
        },
      ];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('blockquote (multiple lines)', () => {
      const markdown = '> foo\n>\n> bar';
      const fragment = [
        {
          type: BLOCK_QUOTE,
          children: [
            { type: PARAGRAPH, children: [{ text: 'foo' }] },
            { type: PARAGRAPH, children: [{ text: 'bar' }] },
          ],
        },
      ];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('code-block (single line)', () => {
      const markdown = '```\ntest\n```';
      const fragment = [
        {
          type: CODE_BLOCK,
          lang: '',
          children: [{ type: CODE_LINE, children: [{ text: 'test' }] }],
        },
      ];
      expect(parseMarkdown(markdown)).toMatchObject(fragment);
    });

    test('code-block (multiple lines)', () => {
      const markdown = '```js\nfoo\nbar\n```';
      const fragment = [
        {
          type: CODE_BLOCK,
          lang: 'js',
          children: [
            { type: CODE_LINE, children: [{ text: 'foo' }] },
            { type: CODE_LINE, children: [{ text: 'bar' }] },
          ],
        },
      ];
      expect(parseMarkdown(markdown)).toMatchObject(fragment);
    });

    test('bulleted-list', () => {
      const markdown = '- foo\n- bar **baz**';
      const fragment = [
        {
          type: BULLETED_LIST,
          children: [
            {
              type: LIST_ITEM,
              parent: BULLETED_LIST,
              level: 0,
              children: [{ text: 'foo' }],
            },
            {
              type: LIST_ITEM,
              parent: BULLETED_LIST,
              level: 0,
              children: [{ text: 'bar ' }, { text: 'baz', bold: true }],
            },
          ],
        },
      ];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('numbered-list', () => {
      const markdown = '1. foo\n2. bar *baz*';
      const fragment = [
        {
          type: NUMBERED_LIST,
          children: [
            {
              type: LIST_ITEM,
              parent: NUMBERED_LIST,
              level: 0,
              number: 1,
              children: [{ text: 'foo' }],
            },
            {
              type: LIST_ITEM,
              parent: NUMBERED_LIST,
              level: 0,
              number: 2,
              children: [{ text: 'bar ' }, { text: 'baz', italic: true }],
            },
          ],
        },
      ];
      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });

    test('sequential blocks', () => {
      const markdown = `# title

paragraph1

> blockquote

paragraph2

\`\`\`
const a = 1;
console.log('hello');
\`\`\``;

      const fragment = [
        { type: H1, children: [{ text: 'title' }] },
        { type: PARAGRAPH, children: [{ text: 'paragraph1' }] },
        {
          type: BLOCK_QUOTE,
          children: [{ type: PARAGRAPH, children: [{ text: 'blockquote' }] }],
        },
        { type: PARAGRAPH, children: [{ text: 'paragraph2' }] },
        {
          type: CODE_BLOCK,
          lang: '',
          children: [
            { type: CODE_LINE, children: [{ text: 'const a = 1;' }] },
            { type: CODE_LINE, children: [{ text: "console.log('hello');" }] },
          ],
        },
      ];

      expect(parseMarkdown(markdown)).toStrictEqual(fragment);
    });
  });
});
