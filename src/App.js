import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Editor, ProseMirror, EditorUtils } from '@progress/kendo-react-editor';
import { addMentionNodes, addTagNodes, getMentionsPlugin } from 'prosemirror-mentions';
import { defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown';
import { createView } from './createView'; // Import createView function
import './style.css';

const { Schema, EditorView, EditorState } = ProseMirror;

const mentionsData = [
  { name: 'Anna Brown', id: '103', email: 'anna@gmail.com' },
  { name: 'John Doe', id: '101', email: 'joe@gmail.com' },
  { name: 'Joe Lewis', id: '102', email: 'lewis@gmail.com' }
];

const tagsData = [
  { tag: 'WikiLeaks' },
  { tag: 'NetNeutrality' },
  { tag: 'KendoReact' }
];

/**
 * IMPORTANT: outer div's "suggestion-item-list" class is mandatory. The plugin uses this class for querying.
 * IMPORTANT: inner div's "suggestion-item" class is mandatory too for the same reasons
 */
const getMentionSuggestionsHTML = (items) => {
  return (
    '<div class="suggestion-item-list">' +
    items
      .map((i) => '<div class="suggestion-item">' + i.name + "</div>")
      .join("") +
    "</div>"
  );
};

/**
 * IMPORTANT: outer div's "suggestion-item-list" class is mandatory. The plugin uses this class for querying.
 * IMPORTANT: inner div's "suggestion-item" class is mandatory too for the same reasons
 */
const getTagSuggestionsHTML = (items) => {
  return (
    '<div class="suggestion-item-list">' +
    items
      .map((i) => '<div class="suggestion-item">' + i.tag + "</div>")
      .join("") +
    "</div>"
  );
};

const mentionPlugin = getMentionsPlugin({
  getSuggestions: (type, text, done) => {
    setTimeout(() => {
      if (type === 'mention') {
        done(mentionsData);
      } else if (type === 'tag') {
        done(tagsData);
      } else {
        done([]);
      }
    }, 0);
  },
  getSuggestionsHTML: (items, type) => {
    if (type === 'mention') {
      return getMentionSuggestionsHTML(items);
    } else if (type === 'tag') {
      return getTagSuggestionsHTML(items);
    }
    return null;
  }
});

const App = () => {
  const [value, setValue] = React.useState(
    ''
  );
  
  const onChange = (event) => setValue(event.value);
  if (value) {
    console.log(defaultMarkdownSerializer.serialize(value));
  }
  
  const handleMount = (event) => {
    const { viewProps } = event;
    const { plugins, schema } = viewProps.state;
    const marks = schema.spec.marks;
    const nodes = schema.spec.nodes;

    const mySchema = new Schema({
      nodes: addTagNodes(addMentionNodes(nodes)),
      marks
    });

    const doc = EditorUtils.createDocument(mySchema, '');

    plugins.unshift(mentionPlugin);

    // Call createView to initialize EditorView
    return createView({
      dom: event.dom,
      viewProps: {
        ...viewProps,
        state: EditorState.create({ doc, plugins })
      }
    });
  };

  return (
    <Editor
      contentStyle={{ height: 500 }}
      onMount={handleMount}
      onChange={onChange}
      value={value}
    />
  );
};

export default App;
