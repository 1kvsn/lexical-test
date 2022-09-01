import React, {useEffect} from 'react';
import './App.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';


const exampleTheme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
};




const DUMMY_JSON_STRINGIFIED = {"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"React Native combines the best parts of native development with React, a best-in-class JavaScript library for building user interfaces. React Native combines the best parts of native development with React, a best-in-class JavaScript library for building user interfaces. React Native combines the best parts of native development with React, a best-in-class JavaScript library for building user interfaces. React Native combines the best parts of native development with React, a best-in-class JavaScript library for building user interfaces. React Native combines the best parts of native development with React, a best-in-class JavaScript library for building user interfaces.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}};


function getInitialConfig(props) {
  return {
    theme: exampleTheme,
    onError(error) {
      throw error;
    },
    nodes: [],
    readOnly: false,
    editorState: editor => {
      if (props.json?.hasOwnProperty('root')) {
        const editorState = editor.parseEditorState(props.json);
        editor.setEditorState(editorState);
      }

    },
  }
}

const Editor = React.forwardRef((props, ref) => {
  const editorStateRef = React.useRef();


  // This is a hook used to expose exportJSON method to the parent component so that this method can be accessed using ref.
  React.useImperativeHandle(ref, () => {
    return {
      exportJSON: () => {
        const editorState = editorStateRef.current
        return editorState?.toJSON()
      },
    }
  })

  return (
        <LexicalComposer initialConfig={getInitialConfig(props)}>
          <div className="editor-container">
            <PlainTextPlugin
                contentEditable={<ContentEditable className="editor-input" />}
                placeholder={<Placeholder />}
            />

            <OnChangePlugin onChange={(editorState) => (editorStateRef.current = editorState)} />

            <HistoryPlugin />

            <MyCustomAutoFocusPlugin />
          </div>

        </LexicalComposer>
  );
})

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
  const editorRef = React.useRef();

  // Since 'message' event listener is not firing when data is sent from RN, I was trying to add a custom event listener to this ref and
  // was trying to listen to that custom event to perform further actions.
  // However, it is not possible to attach custom listener from RN to elements in this web-view rendered app.
  // So, this ref is useless for now.
  const appRef = React.useRef()

  // I was trying to set state with json after it is received from the RN.
  const [json, setJSON] = React.useState({})

  useEffect(() => {
    // mock api response
    setTimeout(() => setJSON(DUMMY_JSON_STRINGIFIED), 5000)
  }, []);


  // NOTE: I wanted to listen to the data sent from the RN and set the state or perform whatever action with that JSON data.
  // This does NOT work.
  // The message listener will not fire this way for data passed from RN.
  useEffect(() => {
    window.addEventListener('message', function(e) {
      console.log('THIS IS FIRING IN WEB APP')
      console.log(e)
    })

    document.addEventListener('message', function(e) {
      console.log('THIS IS FIRING IN DOCUMENT WEB APP')
      console.log(e)
    })

  }, [])

  // NOTE: This works fine. We can get JSON from the Lexical and pass it to RN.
  // As you can see, I've created a method called exportJSON in the Editor component which gives us the raw JSON.
  function submitToRN() {
    window.ReactNativeWebView.postMessage(
        `Hey Priyanka, I'm coming from Web App`,
    );

    // This works fine. This gets the JSON from Editor component.
    const rawJSON = editorRef.current.exportJSON()

    // This works fine as well.
    window.ReactNativeWebView.postMessage(
        JSON.stringify(rawJSON),
    );
  }

  return (
    <div className="App" ref={appRef}>
      <div>This is Editor inside web-view</div>
      <button onClick={submitToRN}>Submit to RN</button>

      {/* I wanted to render the Editor only if the JSON is present and prevent it from rendering for empty object, so I'm using hasOwnProperty method */}
      {json?.hasOwnProperty('root') && <Editor json={json} ref={editorRef}/>}
    </div>
  );
}

export default App;
