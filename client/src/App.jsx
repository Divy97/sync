import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import TextEditor from "./components/TextEditor";
import { useState } from "react";
function generateRoomId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
     result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
 }

 
const RedirectComponent = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
 
  const redirect = () => {
    navigate(`/documents/${generateRoomId()}`);
  }
  return (
    <>
      <input 
        type="text"
        placeholder="enter code: "
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={() => {navigate(`/documents/${code}`)}}>
        Go
      </button>
      <button onClick={redirect}>
        Create New 
      </button>
    </>
  );
 };
 

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RedirectComponent />} />
        <Route path="/documents/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  );
};

export default App;
