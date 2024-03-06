/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import { usePermission } from '../context/PermissionContext';


const SAVE_INTERVAL_MS = 2000;

export default function TextEditor() {
  const { permission } = usePermission();

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

  const options = {
    debug: "info",
    modules: {
      toolbar: false,
    },
    placeholder: "Write Something...",
    theme: "bubble",
  };

  useEffect(() => {
    const s =io('http://localhost:3001');
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const [owner, setOwner] = useState("");
  const [isEditable, setIsEditable] = useState(permission);
  const [cursor, setCursor] = useState(0);
  useEffect(() => {
    if (socket == null || quill == null) return;
    socket.once("load-document", (document) => {
      setOwner(document.owner)
      quill.setContents(document.data);
      if (document.isEditable) {
        quill.enable(true);
      } else {
        quill.enable(username === document.owner);
      }
    });

    socket.emit("get-document", documentId, username, isEditable);
  }, [socket, quill, documentId, username, isEditable]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      const range = quill.getSelection();
      if (range && range.length === 0) {
        setCursor(range.index);
      }
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
    const range = quill.getSelection();
    if (range && range.length === 0) {
      setCursor(range.index);
    }
  
    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill, username]);
  

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (generatedText) => {
      // const range = quill.getSelection();
      // if (range && range.length === 0) {
      // }
      console.log("cursor", cursor);
      quill.insertText(cursor, generatedText);
    };

    socket.on("receive-generated-text", handler);

    return () => {
      socket.off("receive-generated-text", handler);
    };
  }, [socket, quill, cursor]);

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, options);
    q.disable();
    setQuill(q);
  }, []);

  const [textModal, setTextModal] = useState(false);
  const writePrompt = () => {
    setTextModal(!textModal);
  };

  const [text, setText] = useState("");

  const apiCall = async () => {
    quill.enable(false);
    // setLoading(true)
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
      console.log(generatedText);
      if (quill) {
        console.log("cursor", cursor);
        quill.insertText(cursor, generatedText);
        socket.emit("send-generated-text", generatedText, username);
      }
      setTextModal(false);
      setText("");
    } catch (error) {
      console.error(error);
    }
    // setLoading(false)
    quill.enable(true);
  };

  const [loading, setLoading] = useState(false);

  // const navigate = useNavigate();
  // function handleCheckboxChange(event) {
  //   setIsEditable(event.target.checked);
  // }
  
  // useEffect(() => {
  //   if (socket == null || quill == null) return;
  
  //   const handleEditableChange = (isEditable) => {
  //     setIsEditable(isEditable);
  //     if (isEditable || username === owner) {
  //       quill.enable();
  //     } else {
  //       quill.disable();
  //     }
  //   };
  
  //   socket.on("editable-change", handleEditableChange);
  
  //   return () => {
  //     socket.off("editable-change", handleEditableChange);
  //   };
  // }, [socket, quill, username, owner, isEditable]);
    

  const navigate = useNavigate();

  console.log('username', username, 'owner', owner);
  return (
    <div className="textEditor_container">
      <div className="textEditor_navigation">
        <h1 className="textEditor_title" onClick={() => navigate("/")}>
          Sync
        </h1>
      </div>
      <div className="nav">
        <h3>Room code: {documentId}</h3>
        <button onClick={writePrompt} className="btn2">
          Help me write
        </button>
      </div>
      {/* {username === owner && (
        <div className="nav2">
          <label>Allow everyone to edit this document</label>
          <input
            type="checkbox"
            checked={isEditable === null ? false : isEditable}
            onChange={handleCheckboxChange}
          />
        </div>
      )} */}
      {textModal && (
        <div className="textModal">
          <input
            type="textarea"
            value={text}
            className="modalText"
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a email to manager for sick leave...."
          />
          <button onClick={apiCall} className="btn">
            Write
          </button>
        </div>
      )}
      {loading ? (
        <div className="container">
          <h5
            style={{
              margin: "1rem",
            }}
          >
            Generating....
          </h5>
        </div>
      ) : (
        <div className="container" ref={wrapperRef}></div>
      )}
    </div>
  );
}
