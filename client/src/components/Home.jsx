import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./home.css";
import { usePermission } from "../context/PermissionContext";

function generateRoomId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const Home = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const { permission, togglePermission } = usePermission();


  function handleCheckboxChange(event) {
      togglePermission(event.target.checked);
    }

    console.log(permission);
  const redirect = () => {
    navigate(`/documents/${generateRoomId()}`);
  };
  return (
    <div className="home_container">
      <div className="navigation">
        <h1 className="title">Sync</h1>
        <h3 className="title" style={{
              fontSize: "1.2rem",           
            }}>The rhythm of productivity</h3>
      </div>
      <div className="main_container">
        <div className="section_one">
          <h1
            className="title"
            style={{
              fontSize: "1.2rem",
              textAlign: "center",
            }}
          >
            Enter Your 4 digit code to sync in...
          </h1>
          <div
            style={{
              display: "flex",
              gap: "1rem",
            }}
          >
            <input
              type="text"
              placeholder="Enter code..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input_code"
              maxLength={4}
              required
            />
            <button
              onClick={() => {
                if (code) navigate(`/documents/${code}`);
                else alert("Enter 4 digit code");
              }}
              className="btn"
            >
              Go
            </button>
          </div>
        </div>
        <div className="section_two">
          <div className="paras">
            <h1><span>Connect.</span> Share. Create</h1>
            <h1>
            Write better, together. <span>AI</span> at your fingertips
            </h1>
            <h1>Your space. Your rules. Your best <span>work</span></h1>
          </div>
          <div className="section_one">
            <h1 className="para">Create a sync room</h1>
            <button onClick={redirect} className="btn2">
              Create
            </button>
            <div className="nav2">
              <input
                type="checkbox"
                checked={permission === false ? false : true}
                onChange={handleCheckboxChange}
                />
                <label>Allow everyone to edit this document</label>
        </div>
          </div>
        </div>
      </div>

      <a href="https://twitter.com/ParekhDivy">Created by - Divy Parekh</a >
    </div>
  );
};

export default Home;
