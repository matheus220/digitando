// ========== Establish a WebSocket connection ==========

const socket = io();

// ========== References to HTML elements ==========

const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const inputImgField = document.querySelector(".message_img__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");
const inputImgGroup = document.querySelector(".input_img_group");
const clearImageInputButton = document.querySelector(".clear_image_input");
const actionsContainer = document.querySelector(".actions_container");
const loadingContainer = document.querySelector(".loading_container");

// ========== Global variables ==========

let userName = "";

// ========== General functions ==========

function handleLoadedImage(imageCode) {
  document.getElementById(imageCode).remove();
  messageBox.scrollTop = messageBox.scrollHeight;
}

const displayNewMessage = ({ username, message, image, date }) => {
  const time = new Date(parseInt(date));
  const formattedTime = time.toLocaleString("pt-BR", {
    hour: "numeric",
    minute: "numeric",
  });

  let messageContent = "";
  if (image) {
    let imageCode = Math.floor(Math.random() * 1000000);
    let loading = `<div id="${imageCode}" class="image_loading"><div class="loading"></div></div>`;
    messageContent += `
      <div class="image_container">
        <img src="${image}" onload="handleLoadedImage(${imageCode})" />
        ${loading}
      </div>`;
  }
  if (message) {
    messageContent += `<p>${message}</p>`;
  }

  const isMyMessage = username === userName;
  let msg = "";

  if (isMyMessage) {
    msg = `
      <div class="outgoing__message">
        <div class="sent__message">
          ${messageContent}
          <div class="message__info">
            <span class="time_date">${formattedTime}</span>
          </div>
        </div>
      </div>`;
  } else {
    msg = `
      <div class="incoming__message">
        <div class="received__message">
          ${messageContent}
          <div class="message__info">
            <span class="message__author">${username}</span>
            <span class="time_date">${formattedTime}</span>
          </div>
        </div>
      </div>`;
  }

  messageBox.innerHTML += msg;

  messageBox.scrollTop = messageBox.scrollHeight;
};

const addToUsersBox = (userName) => {
  if (!!document.querySelector(`.${userName}-userlist`)) {
    return;
  }

  const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <h4>${userName}</h4>
    </div>
  `;
  inboxPeople.innerHTML += userBox;
};

const newUserConnected = (user) => {
  let storedUsername = sessionStorage.getItem("@digitando_username");

  if (storedUsername) {
    userName = storedUsername;
  } else {
    userName = user || `Usuário${Math.floor(Math.random() * 10000)}`;
    sessionStorage.setItem("@digitando_username", userName);
  }

  socket.emit("new user", userName);
  addToUsersBox(userName);
};

const toggleLoadingMessageSending = () => {
  if (actionsContainer.style.display === "none") {
    actionsContainer.style.display = "flex";
    loadingContainer.style.display = "none";
    inputField.disabled = false;
  } else {
    actionsContainer.style.display = "none";
    loadingContainer.style.display = "flex";
    inputField.disabled = true;
  }
};

// ========== Initial settings ==========

// Get previous messages
axios
  .get("/message")
  .then(function (response) {
    if (response.data) {
      const { data } = response;

      data.map((message) => displayNewMessage(message));
    }
  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(() => {
    const historyLoading = document.querySelector(".history_loading");
    historyLoading.style.display = "none";
  });

// Manage a new user's connection
newUserConnected();

// ========== JavaScript DOM Event Listeners ==========

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (inputImgField.files.length > 0) {
    toggleLoadingMessageSending();
    const image = inputImgField.files[0];

    const message = inputField.value ? inputField.value : null;

    let data = new FormData();
    data.append("image", image);

    axios
      .post("/upload/image", data)
      .then((res) => {
        if (res.data && res.data.location) {
          socket.emit("chat message", {
            username: userName,
            message: message,
            image: res.data.location,
            date: Date.now(),
          });

          socket.emit("typing", {
            username: userName,
            isTyping: false,
          });

          inputField.value = "";
        } else {
          console.log(res);
          window.alert("Problema ao enviar a mensagem");
        }
      })
      .catch((err) => {
        console.log(err);
        window.alert("Problema ao enviar a mensagem");
      })
      .finally(() => {
        clearImageInputButton.style.display = "none";
        inputImgGroup.style.display = "flex";
        toggleLoadingMessageSending();
      });

    return;
  }

  if (!inputField.value) {
    window.alert("Messagem vazia!");
    return;
  }

  socket.emit("chat message", {
    username: userName,
    message: inputField.value,
    image: null,
    date: Date.now(),
  });

  socket.emit("typing", {
    username: userName,
    isTyping: false,
  });

  inputField.value = "";
});

inputImgField.addEventListener("change", (ev) => {
  clearImageInputButton.style.display = "flex";
  inputImgGroup.style.display = "none";
});

clearImageInputButton.addEventListener("click", (ev) => {
  inputImgField.value = "";
  clearImageInputButton.style.display = "none";
  inputImgGroup.style.display = "flex";
});

inputField.addEventListener("keyup", () => {
  socket.emit("typing", {
    username: userName,
    isTyping: inputField.value.length > 0,
  });
});

// ========== Socket IO Listeners ==========

socket.on("new user", function (data) {
  data.map((user) => addToUsersBox(user));
});

socket.on("user disconnected", function (userName) {
  document.querySelector(`.${userName}-userlist`).remove();
});

socket.on("chat message", function (data) {
  displayNewMessage(data);
});

socket.on("typing", function (data) {
  const { isTyping, username } = data;

  if (!isTyping) {
    fallback.innerHTML = "";
    return;
  }

  fallback.innerHTML = `<p>${username} está digitando...</p>`;
});
