import axios from "axios";
import Papa from "papaparse";
import React, { useEffect, useRef, useState } from "react";
import LoadingModal from "../components/LoadingModal";
import Modal from "../components/Modal";
import useModal from "../components/useModal";
import "../css/Recording.css";

const Recording = () => {
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState("");
  const [testValue, setTestValue] = useState("");
  const modalEnterFullScreen = useModal();
  const loadingModal = useModal();

  const [wordList, setWordList] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false); // To track if data is loaded

  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [recordedBlob, setRecordedBlob] = useState(null);
  const mediaStream = useRef(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    console.log("Starting recording...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("MediaStream obtained:", stream);
      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          console.log("Data available:", e.data);
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        console.log("MediaRecorder stopped.");
        const blob = new Blob(chunks.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setRecordedBlob(blob);
        chunks.current = [];
        console.log("Saved audio with URL:", url);
        console.log("Blob:", blob);
      };

      mediaRecorder.current.start();
      console.log("MediaRecorder started.");
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    console.log("Stopping recording...");
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      console.log("MediaRecorder stopped.");
    }
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => {
        track.stop();
      });
      console.log("MediaStream tracks stopped.");
    }
  };

  const uploadAudio = async (blob) => {
    console.log("Preparing to upload audio...");
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User is not authenticated!");
      return;
    }

    const formData = new FormData();
    const file = new File([blob], "recording1.wav", { type: "audio/wav" });
    formData.append("file", file);
    formData.append("transcript", wordList[wordIndex]);
    console.log("FormData prepared:", formData);

    try {
      console.log("Uploading audio with token:", token);
      const response = await axios.post(
        "https://topshur-backend.onrender.com/upload-audio",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Upload response:", response);
      if (response.status === 201) {
        alert("Audio uploaded successfully!");
      } else {
        alert(`Error uploading audio: ${response.statusText}`);
      }
    } catch (error) {
      console.error(
        "Upload error:",
        error.response ? error.response.data : error.message
      );
      alert("Error uploading audio!");
    }
  };

  function switchFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    modalEnterFullScreen.hideModal();
  }

  useEffect(() => {
    console.log("Fetching word list from CSV...");
    fetch("/speeches.csv", {
      headers: new Headers({ "Content-Type": "text/csv, charset=UTF-8" }),
    })
      .then((res) => res.text())
      .then((csvText) => {
        console.log("CSV text fetched:", csvText);
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const wordArray = results.data.map((row) => {
              console.log("Row data:", row);
              return row.phrase;
            });
            console.log("Results data:", results.data);
            setWordList(wordArray);
            setIsLoaded(true); // Mark data as loaded
            console.log("Loaded word list:", wordArray);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
          },
        });
      });

    const savedDisease = localStorage.getItem("selectedDisease");
    const savedTestValue = localStorage.getItem("testValue");
    const savedNavVisibility = localStorage.getItem("isNavVisible");
    const savedWordIndex = localStorage.getItem("wordIndex");

    if (savedDisease) {
      setSelectedDisease(savedDisease);
    }
    if (savedTestValue) {
      setTestValue(savedTestValue);
    }
    if (savedNavVisibility) {
      localStorage.setItem("isNavVisible", false);
    }
    if (savedWordIndex !== null) {
      setWordIndex(Number(savedWordIndex));
    }

    modalEnterFullScreen.showModal();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("wordIndex", wordIndex);
    }
  }, [wordIndex, isLoaded]);

  function leftArrowAction() {
    console.log("Left arrow clicked");
    setIsRecording(false);
    stopRecording();
    setWordIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  }

  async function rightArrowAction() {
    console.log("Right arrow clicked");
    setIsRecording(false);
    stopRecording();
    setWordIndex((prevIndex) =>
      prevIndex < wordList.length - 1 ? prevIndex + 1 : prevIndex
    );
  }

  async function handleRecording() {
    if (isRecording) {
      console.log("Stopping recording...");
      setIsRecording(false);
      stopRecording();
      if (recordedBlob) {
        console.log("Recorded Blob exists, proceeding to upload...");
        loadingModal.showModal();
        await uploadAudio(recordedBlob);
        loadingModal.hideModal();
      } else {
        alert("Пожалуйста, повторите запись.");
      }
    } else {
      console.log("Starting recording...");
      setIsRecording(true);
      startRecording();
    }
  }

  return (
    <div className="content">
      <div className="word">
        <h1 className="displayedWord">
          {wordList.length > 0 ? wordList[wordIndex] : "Loading..."}
        </h1>
      </div>
      <div className="btnsRec">
  <div className="buttons">
    <button className="btnRec" onClick={leftArrowAction}>
      {"<"}
    </button>
    <button className="btnRec" onClick={handleRecording}>
      {isRecording ? "Stop" : "Start"}
    </button>
    <button className="btnRec" onClick={rightArrowAction}>
      {">"}
    </button>
  </div>
  <div className="audio-control">
    <audio controls src={recordedUrl} />
  </div>
</div>

      {modalEnterFullScreen.isModalVisible && (
        <Modal
          message={`Пожалуйста войдите в полноэкранный режим для корректной работы приложения.\nВыполнить вход в полноэкранный режим?`}
          onClose={modalEnterFullScreen.hideModal}
          onConfirm={switchFullscreen}
          confirmText={"Войти"}
          cancelText={"Отмена"}
        />
      )}
      {loadingModal.isModalVisible && (
        <LoadingModal message="Загружаем запись, пожалуйста подождите." />
      )}
    </div>
  );
};

export default Recording;
