# Editure for React

The React component for [Editure](https://github.com/tuture-dev/editure).

## Using the Component

A quick demo:

```javascript
import Editure from 'editure-react';

class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: [] };
  }

  handleChange = value => {
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
