import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useModal from "../components/useModal";
import "../css/Intro.css"; // Updated import path

const Intro = () => {
  // Step 2: Define the array of predefined words
  const diseases = ["Инсульт", "Дизартрия"];
  const navigate = useNavigate();
  const modalDataCorrect = useModal();
  // Step 4: Create state variables to keep track of the selected options
  const [selectedDisease, setSelectedDisease] = useState(diseases[0]);
  const [testValue, setTestValue] = useState("a");
  const [login, setLogin] = useState("");
  // Retrieve saved values from local storage when the component mounts
  useEffect(() => {
    const savedDisease = localStorage.getItem("selectedDisease");
    const savedTestValue = localStorage.getItem("testValue");
    const savedLogin = localStorage.getItem("login");
    if (savedDisease) {
      setSelectedDisease(savedDisease);
    }
    if (savedTestValue) {
      setTestValue(savedTestValue);
    }
    if (savedLogin) {
      setLogin(savedLogin);
    }
  }, []);

  // Save selected values to local storage
  const handleSave = () => {
    localStorage.setItem("selectedDisease", selectedDisease);
    localStorage.setItem("testValue", testValue);
    console.log(
      `Selected disease is: ${selectedDisease}`
    );
  };

  const handleNavigation = () => {
    navigate("/recording");
    // modalDataCorrect.showModal();
  };
  const handleModalShow = () => {
    modalDataCorrect.showModal();
  }
  
  return (
    <div className="introPage">
      <h1>Добро пожаловать, {login}!</h1>
      {/* <Dropdown
        label="test"
        options={["a", "b", "c"]}
        value={testValue}
        onChange={setTestValue}
      /> */}
      <div className="btns">
        <button className="button" onClick={handleNavigation}>
          Далее
        </button>
      </div>
    </div>
  );
};

export default Intro;
