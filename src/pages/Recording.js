import axios from "axios";
import Papa from "papaparse";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingModal from "../components/LoadingModal";
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
  const [isLoaded, setIsLoaded] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState("");
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedPhrases, setRecordedPhrases] = useState(new Set());
  const mediaStream = useRef(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const navigate = useNavigate();

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
      alert("Вы не авторизованы!");
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
        alert("Аудио успешно загружено!");
        setRecordedPhrases((prevSet) => new Set(prevSet).add(wordList[wordIndex]));
      } else {
        alert(`Ошибка загрузки аудио: ${response.statusText}`);
      }
    } catch (error) {
      console.error(
        "Upload error:",
        error.response ? error.response.data : error.message
      );
      alert("Ошибка загрузки аудио!");
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
            setIsLoaded(true);
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
    const fetchRecordedPhrases = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Вы не авторизованы!");
        return;
      }

      try {
        const response = await axios.get(
          "https://topshur-backend.onrender.com/get-audios",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const recordedPhrasesSet = new Set(response.data.transcripts);
        setRecordedPhrases(recordedPhrasesSet);
        console.log("Fetched recorded phrases:", recordedPhrasesSet);
      } catch (error) {
        console.error(
          "Error fetching recorded phrases:",
          error.response ? error.response.data : error.message
        );
        alert("Пожалуйста авторизуйтесь!");
        navigate.push("/main"); // Redirect to the main page on error
      }
    };

    fetchRecordedPhrases();
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
      {recordedPhrases.has(wordList[wordIndex]) && (
        <div className="recorded-notice">
          <p>Аудиозапись уже записана. Нажмите "Перезаписать", чтобы записать заново.</p>
        </div>
      )}
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
            {isRecording ? "Стоп" : recordedPhrases.has(wordList[wordIndex]) ? "Перезаписать" : "Начать запись"}
          </button>
          <button className="btnRec" onClick={rightArrowAction}>
            {">"}
          </button>
        </div>
        <div className="audio-control">
          <audio controls src={recordedUrl} />
        </div>
      </div>
      {loadingModal.isModalVisible && (
        <LoadingModal message="Загружаем запись, пожалуйста подождите." />
      )}
    </div>
  );
};

export default Recording;
