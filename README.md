# Editure

[![Build Status](https://travis-ci.com/tuture-dev/editure.svg?branch=master)](https://travis-ci.com/tuture-dev/editure)[![codecov](https://codecov.io/gh/tuture-dev/editure/branch/master/graph/badge.svg)](https://codecov.io/gh/tuture-dev/editure)

Editure is a richtext markdown editor built on top of [Slate](https://www.slatejs.org/), with out-of-the-box support for markdown **shortcuts**, **hotkeys**, **serialization**. It aims to provide editing experience on par with [Typora](https://typora.io/) or [Yuque](https://www.yuque.com/).

> Warning: Editure is currently experimental. DO NOT USE IT IN PRODUCTION!

## Highlights

- **Hotkeys**: e.g. toggle bold font with `Ctrl+B` or `Cmd+B`
- **Shortcuts**: trigger the full rendering of Markdown as you are typing
- **Toolbar**: a toolbar for adjusting format with buttons

## Supported Formats

Marks: **bold**, _italic_, <span style="text-decoration: underline; ">underline</span>, ~~strikethrough~~ and [link](https://tuture.co).

Blocks: paragraphs, headings, blockquotes, code blocks, note blocks, bulleted lists, numbered lists, images, and horizontal lines.

## Installation

```bash
npm install editure editure-react
# or if you prefer yarn:
yarn add editure editure-react
```

## Getting Started

### Using the Component

A quick demo:

```javascript
import Editure from 'editure-react';

class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: [] };
  }

  handleChange = (value) => {
    this.setState({ value });
  };

  render() {
    return <Editure value={this.state.value} onChange={this.handleChange} />;
  }
}
```

Or, if you prefer [Hooks](https://reactjs.org/docs/hooks-intro.html):

```javascript
import Editure from 'editure-react';

function MyComponent() {
  const [value, setValue] = useState([]);
  return <Editure value={value} onChange={setValue} />;
}
```

### Content Serialization

As in Slate, the `value` prop is a plain JavaScript object. You can perform serialization with `JSON` global object:

```javascript
// serialize to JSON
const serialized = JSON.stringify(value);

// parse from JSON
const value = JSON.stringify(serialized);
```

Moreover, Editure provides serialization support for HTML and Markdown, for example:

```javascript
import { toHtml, toMarkdown, parseHtml, parseMarkdown } from 'editure';

// serialize to HTML
const htmlString = toHtml(value);

// parse from HTML
const value = parseHtml(htmlString);

// serialize to Markdown
const markdownString = toMarkdown(value);

// parse from Markdown
const value = parseMarkdown(markdownString);
```

## API Reference

### `editure`

The `editure` package provides low-level utilities to work with Slate.

### `editure-react`

Here is a full list of props from `Editure` component:

- `value`: the current value of the editor
- `onChange`: handler called after the content changed
- `placeholder`: placeholder string for the editor
- `readOnly`: if `true`, the editor won't allow changing its contents.

## LICENSE

MIT.
