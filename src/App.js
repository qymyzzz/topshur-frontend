import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Intro from "./pages/Intro";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Recording from "./pages/Recording";
// import Test from "./pages/Test";
import "./App.css";
import Test from "./pages/Test";


function App() {
  const [isNavVisible, setNavVisibility] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/recording") {
      setNavVisibility(false);
    } else {
      setNavVisibility(true);
    }
  }, [location]);

  return (
    <div className="App">
      {/* <nav className={isNavVisible ? "nav-visible" : "nav-invisible"}>
        <div>
          <Link to="/">Login</Link>
          <Link to="/intro">Intro</Link>
          <Link to="/recording">Recording</Link>
        </div>
      </nav> */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/intro" element={<Intro />} />
          <Route path="/recording" element={<Recording />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
