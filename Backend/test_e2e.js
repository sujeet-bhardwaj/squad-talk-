const { io } = require("../Frontend/ChatApp/node_modules/socket.io-client");

async function runTest() {
  console.log("--- Starting E2E Verification Test ---");

  const timestamp = Date.now();
  const user1Data = {
    name: "Alex Rivera",
    email: `alex_${timestamp}@example.com`,
    password: "Password123!",
    mobile: "+1234567890",
  };

  const user2Data = {
    name: "Samira Khan",
    email: `samira_${timestamp}@example.com`,
    password: "Password123!",
    mobile: "+1987654321",
  };

  // 1. Test Registration
  console.log("[1] Registering test users...");
  const reg1 = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user1Data),
  }).then((r) => r.json());

  const reg2 = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user2Data),
  }).then((r) => r.json());

  console.log("User 1 registered:", reg1.user?.name, "Token:", !!reg1.token);
  console.log("User 2 registered:", reg2.user?.name, "Token:", !!reg2.token);

  if (!reg1.token || !reg2.token) {
    throw new Error("Registration failed: tokens not returned");
  }

  // 2. Test Chat Creation
  console.log("[2] User 1 accessing/creating chat with User 2...");
  const chatRes = await fetch("http://localhost:5000/api/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${reg1.token}`,
    },
    body: JSON.stringify({ userId: reg2.user._id }),
  }).then((r) => r.json());

  console.log("Chat created:", chatRes._id, "isGroup:", chatRes.isGroupChat);

  // 3. Test Real-Time Socket Connection Handshake
  console.log("[3] Connecting both users to Socket.io server...");
  const socket1 = io("http://localhost:5000", {
    auth: { token: reg1.token },
    transports: ["websocket"],
  });

  const socket2 = io("http://localhost:5000", {
    auth: { token: reg2.token },
    transports: ["websocket"],
  });

  await new Promise((resolve) => {
    let connectedCount = 0;
    const check = () => {
      connectedCount++;
      if (connectedCount === 2) resolve();
    };
    socket1.on("connect", () => {
      console.log("Socket 1 connected:", socket1.id);
      check();
    });
    socket2.on("connect", () => {
      console.log("Socket 2 connected:", socket2.id);
      check();
    });
  });

  // 4. Test Online Users Presence Event
  await new Promise((resolve) => {
    socket1.once("get_online_users", (onlineIds) => {
      console.log("Socket 1 received online users:", onlineIds.length, "users online");
      resolve();
    });
  });

  // Join chat rooms
  socket1.emit("join_chat", chatRes._id);
  socket2.emit("join_chat", chatRes._id);

  // 5. Test Real-time Direct Messaging
  console.log("[4] Testing real-time direct message sending...");
  const messagePromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Socket message receive timed out")), 5000);
    socket2.on("receive_message", (msg) => {
      clearTimeout(timeout);
      console.log("Socket 2 successfully received real-time message:", msg.content);
      resolve(msg);
    });
  });

  // User 1 sends message via API
  const sendRes = await fetch("http://localhost:5000/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${reg1.token}`,
    },
    body: JSON.stringify({
      chatId: chatRes._id,
      content: "Hello Samira! The real-time chat architecture is live 🚀",
    }),
  }).then((r) => r.json());

  // Emit socket event
  socket1.emit("send_message", sendRes);
  await messagePromise;

  // 6. Test Real-time Typing Indicator
  console.log("[5] Testing typing indicator event...");
  const typingPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Typing indicator timed out")), 5000);
    socket1.on("user_typing", ({ chatId, userName }) => {
      clearTimeout(timeout);
      console.log(`Socket 1 received typing indicator: ${userName} is typing in chat ${chatId}`);
      resolve();
    });
  });

  socket2.emit("typing", { chatId: chatRes._id, userName: "Samira Khan" });
  await typingPromise;

  // 7. Test Read Receipts
  console.log("[6] Testing read receipts...");
  const readPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Read receipt timed out")), 5000);
    socket1.on("messages_read", ({ chatId, readerId }) => {
      clearTimeout(timeout);
      console.log(`Socket 1 received read receipt from reader: ${readerId}`);
      resolve();
    });
  });

  socket2.emit("message_seen", { chatId: chatRes._id, messageIds: [sendRes._id] });
  await readPromise;

  // Cleanup
  socket1.disconnect();
  socket2.disconnect();

  console.log("🎉 ALL REAL-TIME & REST API TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
