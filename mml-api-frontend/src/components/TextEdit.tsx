import '../styles/TextEdit.scss';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import { TextAlign } from '@tiptap/extension-text-align';
import { Image } from '@tiptap/extension-image'; 
import Youtube from '@tiptap/extension-youtube';
import StarterKit from '@tiptap/starter-kit';
import { useState, useEffect } from 'react'; 
import { alignCenter, alignLeft, alignRight, bold, italic, code, bullet, orderedList, imageSvg, undo, redo, strikethrough } from '../assets/exports';

import { ResizableImage }  from 'tiptap-extension-resizable-image';
import 'tiptap-extension-resizable-image/styles.css';

const MenuBar = ({ onEditorReady }: { onEditorReady: (editor: any) => void }) => {
  const { editor  } = useCurrentEditor();
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);


  const insertImage = async () => {
    const url = prompt('Enter the URL of the image:');
    if (url) {
      if (editor) {
        await editor.chain().focus().setResizableImage({ src: url }).run();
      }
    }
  };

  const addYoutubeVideo = () => {
    const url = prompt('Enter YouTube URL:');
    const width = prompt('Enter width (in pixels):');
    const height = prompt('Enter height (in pixels):');
  
    if (url && width && height) {
      if (editor) {
        editor.chain().focus().setYoutubeVideo({
          src: url,
          width: parseInt(width),
          height: parseInt(height)
        }).run();
      }
    }
  }


  return (
    <div className='menu-buttons'>
      {editor && (
        <>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleBold()
            .run()
        }
        className={editor.isActive('bold') ? 'is-active' : ''}
      > 
        <img src={bold} width={"50%"} height={"50%"}/>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleItalic()
            .run()
        }
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        <img src={italic} width={"50%"} height={"50%"}/>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .toggleStrike()
            .run()
        }
        className={editor.isActive('strike') ? 'is-active' : ''}
      >
        <img src={strikethrough} width={"50%"} height={"50%"}/>
      </button>
      <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>
        Clear
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive('paragraph') ? 'is-active' : ''}
      >
        Paragraph
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
      >
        H3
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
      >
        H4
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
      >
        H5
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}
      >
        H6
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        <img src={bullet} width={"50%"} height={"50%"}/>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
      >
        <img src={orderedList} width={"50%"} height={"50%"}/>
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
      >
        <img src={alignLeft} width={"50%"} height={"50%"}/>
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
      >
        <img src={alignCenter} width={"50%"} height={"50%"}/>
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
      >
        <img src={alignRight} width={"50%"} height={"50%"}/>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'is-active' : ''}
      >
        <img src={code} width={"50%"} height={"50%"}/>
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .undo()
            .run()
        }
      >
        <img src={undo} width={"50%"} height={"50%"}/>
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={
          !editor.can()
            .chain()
            .focus()
            .redo()
            .run()
        }
      >
        <img src={redo} width={"50%"} height={"50%"}/>
      </button>
      <button onClick={insertImage}>
        <img src={imageSvg} width={"50%"} height={"50%"}/>
      </button>
      <button onClick={addYoutubeVideo}>
        Insert Video
      </button>
      </>
      )}
    </div>
  );
};

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle,
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right'],
  }),
  ResizableImage.configure({
    defaultWidth: 600,
    defaultHeight: 300,
  }),
  Youtube.configure({
    controls: true,
    allowFullscreen: true,
    inline: true
  }),
  Image,
];


interface TextEditProps {
  handleFormChange: (updatedHtml: string) => void;
  existingHtml: string | null;
}

const TextEdit = ({ handleFormChange, existingHtml }: TextEditProps) => {
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [,setContent] = useState<string>(existingHtml || '');
  const handleEditorReady = (editor: any) => {
    setEditorInstance(editor); 
  };

  useEffect(() => {
    if (existingHtml != null) {
      setContent(existingHtml);
    }    
  }, []);

  const handleUpdate = () => {
    if (editorInstance) {
      const updatedHtml = editorInstance.getHTML();
      handleFormChange(updatedHtml);
    }
  };

  return (
    <div className='editor'>
      <EditorProvider extensions={extensions} content={existingHtml} onUpdate={() => handleUpdate()}>
        <MenuBar onEditorReady={handleEditorReady} /> 
      </EditorProvider>
    </div>
  );
};

export default TextEdit;