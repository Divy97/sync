import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import TextEditor from "./components/TextEditor";
import {v4 as uuidV4} from 'uuid'
const RedirectComponent = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/documents/${uuidV4()}`);
  });

  return null;
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
