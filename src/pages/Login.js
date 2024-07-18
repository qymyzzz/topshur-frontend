import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingModal from "../components/LoadingModal";
import Modal from "../components/Modal";
import useModal from "../components/useModal";
import "../css/Login.css";
import useCycledMessages from "../hooks/useCycledMessages";

const registrationMessages = [
  "Создаем ваш аккаунт...", 
  "Creating your account...", 
  "Création de votre compte...", 
  "Erstellen Ihres Kontos...", 
  "Creando tu cuenta...", 
  "Criando sua conta...", 
  "创建您的帐户...", 
  "アカウントを作成しています...", 
  "계정을 만들고 있습니다...", 
  "Creando il tuo account..."
];

const loginMessages = [
  "Выполняем вход...", 
  "Logging in...", 
  "Connexion en cours...", 
  "Anmeldung läuft...", 
  "Iniciando sesión...", 
  "Fazendo login...", 
  "登录中...", 
  "ログイン中...", 
  "로그인 중...", 
  "Accesso in corso..."
];

const Login = () => {
  const modalLoginCorrect = useModal();
  const modalWannaUseSavedData = useModal();
  const loadingModal = useModal();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDisease, setSelectedDisease] = useState(""); // State for selected disease
  const [loginError, setLoginError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const savedLogin = localStorage.getItem("login");
  const savedPassword = localStorage.getItem("password");

  const { currentMessage, resetCurrentMessage } = useCycledMessages(
    isRegistering ? registrationMessages : loginMessages, 750
  );

  function handleSavedDataModal() {
    if (savedLogin && savedPassword && savedLogin !== "" && savedPassword !== "") {
      modalWannaUseSavedData.showModal();
    }
  }

  useEffect(() => {
    handleSavedDataModal();
  }, []);

  async function moveToIntro() {
    localStorage.setItem("login", login);
    localStorage.setItem("password", password);
    resetCurrentMessage();
    loadingModal.showModal();
    if (isRegistering) {
      try {
        const response = await axios.post(
          "https://topshur-backend.onrender.com/register",
          {
            username: login,
            password: password,
            disorder: selectedDisease, // Include selected disease in the registration data
          }
        );
        if (response) {
          loadingModal.hideModal();
        }
        if (response.status === 200) {
          const token = response.data.access_token;
          localStorage.setItem("token", token);
          console.log(`USER TOKEN: ${token}`);
          alert("Регистрация прошла успешно!");
          setIsRegistering(false);
          navigate("/intro");
        } else {
          alert("Ошибка регистрации!");
        }
      } catch (error) {
        loadingModal.hideModal();
        alert("Ошибка регистрации!");
      }
    } else {
      try {
        const formData = new FormData();
        formData.append("username", login);
        formData.append("password", password);

        const response = await axios.post(
          "https://topshur-backend.onrender.com/login/token",
          formData
        );
        if (response) {
          loadingModal.hideModal();
        }
        if (response.status === 200) {
          const token = response.data.access_token;
          localStorage.setItem("token", token);
          console.log(`USER TOKEN: ${token}`);
          navigate("/intro");
        } else {
          alert("Ошибка входа!");
        }
      } catch (error) {
        loadingModal.hideModal();
        alert("Ошибка входа!");
      }
    }
  }

  function onSaveClicked() {
    if (login !== "" && password !== "") {
      modalLoginCorrect.showModal();
    } else {
      if (login === "") {
        setLoginError(true);
      } else {
        setLoginError(false);
      }
      if (password === "") {
        setPasswordError(true);
      } else {
        setPasswordError(false);
      }
      alert("Некорректные данные!");
    }
  }

  return (
    <div className="loginPage">
      <div>
        <h1>{isRegistering ? "Регистрация" : "Вход"}</h1>
      </div>
      <div className="loginForms">
        <form>
          <div className="form-group">
            <label htmlFor="login">Логин:</label>
            <input
              className={loginError ? "error_input" : "norm_input"}
              placeholder={loginError ? "Необходим логин!" : "Логин"}
              type="text"
              id="login"
              value={login}
              onChange={(e) => {
                setLogin(e.target.value);
                setLoginError(false);
              }}
            />
          </div>
        </form>
        <form>
          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              className={passwordError ? "error_input" : "norm_input"}
              placeholder={passwordError ? "Необходим пароль!" : "Пароль"}
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
            />
          </div>
        </form>
        {isRegistering && (
          <div className="form-group">
            <label htmlFor="disease">Ваша болезнь:</label>
            <input
              type="text"
              id="disease"
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="norm_input"
              placeholder="Введите вашу болезнь"
            />
          </div>
        )}
        <button
          className="button"
          style={{ width: "max-width", alignSelf: "center", fontStyle: "bold" }}
          onClick={onSaveClicked}
          type="button"
        >
          {isRegistering ? "Зарегистрироваться" : "Войти"}
        </button>
        <p
          className="register"
          style={{
            textDecoration: "underline",
            color: "black",
            cursor: "pointer",
          }}
          onClick={() => {
            setIsRegistering(!isRegistering);
          }}
        >
          {isRegistering ? "Уже есть аккаунт?" : "Зарегистрироваться"}
        </p>
        {modalLoginCorrect.isModalVisible && (
          <Modal
            message={`Вы уверены что ввели все данные правильно?\nВаш логин: ${login}\nВаш пароль: ${password}`}
            onConfirm={() => {
              moveToIntro();
              modalLoginCorrect.hideModal();
            }}
            onClose={modalLoginCorrect.hideModal}
            confirmText="Да"
            cancelText="Отмена"
          />
        )}
        {modalWannaUseSavedData.isModalVisible && (
          <Modal
            message={`Хотите использовать сохраненные данные?\nСохраненный логин: ${savedLogin}\nСохраненный пароль: ${savedPassword}`}
            onConfirm={() => {
              setLogin(savedLogin);
              setPassword(savedPassword);
              modalWannaUseSavedData.hideModal();
            }}
            onClose={modalWannaUseSavedData.hideModal}
            confirmText="Да"
            cancelText="Нет"
          />
        )}
        {loadingModal.isModalVisible && (<LoadingModal message={currentMessage} />)}
      </div>
    </div>
  );
};

export default Login;
