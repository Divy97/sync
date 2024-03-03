import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const SAVE_INTERVAL_MS = 2000;
const TOOLBAR_OPTIONS = [["image"]];

export default function TextEditor() {
 const { id: documentId } = useParams();
 const [socket, setSocket] = useState();
 const [quill, setQuill] = useState();
 const [username, setUsername] = useState(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      const newUsername = prompt("Please enter your username:");
      if (newUsername) {
        localStorage.setItem("username", newUsername);
        return newUsername;
      }
    }
    return storedUsername;
 });

 useEffect(() => {
    const s = io("http://localhost:3001");
    setSocket(s);

    return () => {
      s.disconnect();
    };
 }, []);

 useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-document", (document) => {
      quill.setContents(document.data);
      if (document.isEditable) {
        quill.enable();
      } else {
        quill.enable(username === document.owner);
      }
    });

    socket.emit("get-document", documentId, username);
 }, [socket, quill, documentId, username]);

 useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents(), username);
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
 }, [socket, quill, username]);

 useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
 }, [socket, quill]);

 useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta, username);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
 }, [socket, quill, username]);

 useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (generatedText) => {
      const range = quill.getSelection();
      if (range && range.length === 0) {
        quill.insertText(range.index, generatedText);
      }
    };

    socket.on("receive-generated-text", handler);

    return () => {
      socket.off("receive-generated-text", handler);
    };
 }, [socket, quill]);

 const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    q.disable();
    q.setText("Loading...");
    setQuill(q);
 }, []);

 const [textModal, setTextModal] = useState(false);
 const writePrompt = () => {
    setTextModal(!textModal);
 };

 const [text, setText] = useState("");

 const apiCall = async () => {
    try {
      const response = await fetch("http://localhost:3001/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();
      const generatedText = result.response;

      if (quill) {
        const range = quill.getSelection();
        if (range && range.length === 0) {
          quill.insertText(range.index, generatedText);

          // Emit changes to other users
          socket.emit("send-generated-text", generatedText, username);
        }
      }

      setTextModal(false);
    } catch (error) {
      console.error(error);
    }
 };

 return (
    <>
      <h2>
        Username: {username} | Room ID: {documentId}
      </h2>
      <button onClick={writePrompt}>Help me write</button>
      {textModal && (
        <div>
          <input
            type="textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={apiCall}>Write</button>
        </div>
      )}
      <div className="container" ref={wrapperRef}></div>
    </>
 );
}
