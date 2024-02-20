const loginForm = document.getElementById("loginForm");
const chatForm = document.getElementById("chatForm");
const socket = io("ws://localhost:3000");



loginForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  if (username == "") {
    alert("You have to introduce a username to join the chatroom");
  } else {
    socket.emit('add user', username);
  }
});

chatForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const message = document.getElementById("message").value;
  if (message == "") {
    alert("You cannot send empty messages in the chat");
  } else {
    socket.emit('chat message', message);
  }
});


