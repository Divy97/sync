import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import TextEditor from "./components/TextEditor";
import Home from "./components/Home";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/documents/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  );
};

export default App;
