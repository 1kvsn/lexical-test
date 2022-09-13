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
const DUMMY_JSON_STRINGIFIED_CHANGED = {"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"This is set just now","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}};


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

  injectToWindow('EditorComponent', Editor)
  return (
        <LexicalComposer initialConfig={getInitialConfig(props)}>
          <div className="editor-container">
            <PlainTextPlugin
                contentEditable={<ContentEditable className="editor-input" />}
                placeholder={<Placeholder/>}
            />

            <OnChangePlugin onChange={(editorState) => {
              editorStateRef.current = editorState
              injectToWindow('editorState', editorState)
              injectToWindow('exportJSON', editorState.toJSON)
            }} />

            <HistoryPlugin />

            <MyCustomAutoFocusPlugin />
          </div>

        </LexicalComposer>
  );
})

function Placeholder() {
  return <div className="editor-placeholder">Write your thoughts here..</div>;
}

function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
}

function injectToWindow(key, payloadToInject) {
  window.__kvsn = {
    ...window.__kvsn,
    [key]: payloadToInject,
  }
}

const messages = {
  EXPORT_JSON: 'exportJSON',
  GET_EDITOR_STATE: 'getEditorState',
  SET_JSON: 'setJSON',
}

function App() {
  const editorRef = React.useRef();

  // I was trying to set state with json after it is received from the RN.
  const [json, setJSON] = React.useState({})

  useEffect(() => {
    injectToWindow('setJSON', setJSON)
    

    // mock api response
    setTimeout(() => {
      
      setJSON(DUMMY_JSON_STRINGIFIED)
    }, 0)
  }, []);

  // const injectSanityCheck = `window.ReactNativeWebView.postMessage()`


  useEffect(() => {
    window.addEventListener('message', function (event) {
      console.log({event})
      if (typeof event.data === 'object') return;
      const message = JSON.parse(event.data);
      // console.log('webview', message)
      switch (message.type) {
        case messages.SET_JSON: {
          setJSON(DUMMY_JSON_STRINGIFIED_CHANGED)
          break;
        }
        case messages.EXPORT_JSON: {
          window.ReactNativeWebView.postMessage(JSON.stringify(window.__kvsn.editorState.toJSON()))
          break;
        }
        default:
          console.log('default case running')
      }
  });

  window.addEventListener('focus', function (event) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ready: true}))
  })


  document.addEventListener('message', function (event) {
    console.log({event})
    if (typeof event.data === 'object') return;
    const message = JSON.parse(event.data);
    // console.log('webview', message)
    console.log(message.type)
    switch (message.type) {
      
        case messages.SET_JSON: {
            setJSON(DUMMY_JSON_STRINGIFIED_CHANGED)
            break;
        }
        case messages.EXPORT_JSON: {
          window.ReactNativeWebView.postMessage(JSON.stringify(window.__kvsn.editorState.toJSON()))
            break;
        }
        
        default:
          console.log('default case running')
    }
  });

    return () => {
      window.removeEventListener('message', () => {})
      document.removeEventListener('message', () => {})
    }
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
    <div className="App">
      <div>This is Editor inside web-view</div>
      <button onClick={submitToRN}>Submit to RN</button>

      {/* I wanted to render the Editor only if the JSON is present and prevent it from rendering for empty object, so I'm using hasOwnProperty method */}
      {json?.hasOwnProperty('root') && <Editor json={json} ref={editorRef}/>}
    </div>
  );
}

export default App;
