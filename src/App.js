import React, {useEffect} from 'react';
import './App.css';

import {$getRoot, $getSelection} from 'lexical';
import {$generateHtmlFromNodes} from '@lexical/html';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';

import {EmojiNode} from './nodes/EmojiNode';

// const exampleTheme = {
//   ltr: 'ltr',
//   rtl: 'rtl',
//   placeholder: 'editor-placeholder',
//   paragraph: 'editor-paragraph',
// };

const exampleTheme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
};

const editorConfig = {
  theme: exampleTheme,
  onError(error) {
    throw error;
  },
  nodes: [],
  readOnly: true,
  editorState: editor => {
    const editorState = editor.parseEditorState(DUMMY_JSON_STRINGIFIED);
    editor.setEditorState(editorState);
  },
};

//------- EDITOR CONFIG FOR CREATE POST -------

const DUMMY_JSON_STRINGIFIED = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"React Native combines the best parts of native development with React, a best-in-class JavaScript library for building user interfaces. React Native combines the best parts of native development with React, a best-in-class JavaScript library for building user interfaces. React Native combines the best parts of native development with React, a best-in-class JavaScript library for building user interfaces. React Native combines the best parts of native development with React, a best-in-class JavaScript library for building user interfaces. React Native combines the best parts of native development with React, a best-in-class JavaScript library for building user interfaces.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;

function onChangeFromFirstSandbox(editorState, editor) {
  // TO CONVERT EDITOR STATE TO HTML & SEND TO FE (REACT NATIVE)
  editor.update(() => {
    const htmlString = $generateHtmlFromNodes(editor, null);
    console.log(htmlString, '--htmlString');
    // window.ReactNativeWebView.postMessage(
    //   JSON.stringify(editor),
    //   '--htmlString',
    // ); //SENDING_HTML_EDITOR_STATE
  });

  // ------- TO SEND JSON TO REACT NATIVE -------
  const jsonConversion = editorState.toJSON();
  // window.ReactNativeWebView.postMessage(
  //   JSON.stringify(jsonConversion),
  //   '--jsonConversion',
  // ); //SENDING_JSON_EDITOR_STATE
  console.log(JSON.stringify(jsonConversion), '--JSON stringify');

  // ----- TESTS -----
  // console.log(jsonConversion.root, "--json");
  // window.ReactNativeWebView.postMessage(jsonConversion, "--jsonConversion");
  // const editorStateToJSON = JSON.stringify(
  //   DUMMY_JSON_STRINGIFIED_WITH_COIN_AND_MENTION
  // );
  // console.log(editorStateToJSON, "--editorStateToJSON");
  editorState.read(() => {
    // Read the contents of the EditorState here.
    const root = $getRoot();
    const selection = $getSelection();

    console.log(root, selection, '--root, selection');

    // // console.log(root, selection);
    // const htmlString = $generateHtmlFromNodes(editor, selection || null);
    // console.log(htmlString, "--htmlString");
    // console.log(root, "--text here");
    // window.ReactNativeWebView.postMessage(root);
    // window.ReactNativeWebView.postMessage(root.__cachedText); // was able to print EDITOR text
  });
}

function onChangeFromSecondSandbox(editorState, editor) {
  // alert(JSON.stringify(editorState));
  // window.addEventListener("message", (message) => {
  //   console.log(message.data); // Wayne is coming!!!
  // });
  // ------- TO SHOW JSON DATA IN WEBVIEW -------
  const json = JSON.parse(DUMMY_JSON_STRINGIFIED);
  const editorStateNew = editor.parseEditorState(JSON.stringify(json));
  console.log(editorStateNew, '--editorStateNew');
  editor.setEditorState(editorStateNew);
  // editor.setEditorState(editorRootNode);
  console.log(
    editor.setEditorState(editorStateNew),
    '--editor.setEditorState(editorStateNew)',
  );
  // ----- TESTS -----
  // console.log(jsonConversion.root, "--json");
  // window.ReactNativeWebView.postMessage(jsonConversion, "--jsonConversion");
  // const editorStateToJSON = JSON.stringify(
  //   DUMMY_JSON_STRINGIFIED_WITH_COIN_AND_MENTION
  // );
  // console.log(editorStateToJSON, "--editorStateToJSON");
  // editorState.read(() => {
  // console.log(jsonConversion, "--json");
  // Read the contents of the EditorState here.
  // const root = $getRoot();
  // const selection = $getSelection();
  // console.log(root, selection);
  // console.log(root, "--text here");
  // window.ReactNativeWebView.postMessage(root);
  // window.ReactNativeWebView.postMessage(root.__cachedText); // was able to print EDITOR text
  //   });
}

function Editor() {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <PlainTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={<Placeholder />}
        />
        <OnChangePlugin onChange={onChangeFromSecondSandbox} />
        {/* <OnChangePlugin onChange={onChangeFromFirstSandbox} /> */}

        <HistoryPlugin />

        <MyCustomAutoFocusPlugin />
      </div>
    </LexicalComposer>
  );
}

function Placeholder() {
  return <div className="editor-placeholder">Write your thoughts here...</div>;
}

function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
}

function App() {
  useEffect(() => {
    window.addEventListener('message', function (event) {
      console.log(event.data);
    });
    document.addEventListener('message', function (event) {
      console.log(event.data);
    });
  }, []);
  return (
    <div className="App">
      <div>hello world</div>
      {/* <Editor /> */}
    </div>
  );
}

export default App;
