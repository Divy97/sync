import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const TextEditor = () => {
  const wrapperRef = useRef();
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = document.createElement("div");
      wrapperRef.current.append(editor);
      editorRef.current = new Quill(editor, { theme: "snow" });
    }
  }, []);

  return <div className="container" ref={wrapperRef}></div>;
};

export default TextEditor;
