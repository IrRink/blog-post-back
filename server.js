// index.js
const express = require("express");
const path = require("path");
const static = require("serve-static");
const bcrypt = require("bcrypt");
const cors = require("cors");
const pool = require("./models/pool"); // pool.js에서 pool을 불러옴
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const boardRoutes = require("./routes/boardRoutes");
const tokenRoutes = require("./routes/tokenRoutes");
const commentsRoutes = require("./routes/commentsRoutes");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const corsOptions = {
  origin: [
    "http://192.168.99.115:3000",
    "http://localhost:3000",
    "http://127.0.0.1:5500",
  ],
  credentials: true,
};
app.use(cors(corsOptions));

// 라우트 설정
app.use("/api/admin", adminRoutes); // 관리자 관련 라우트
app.use("/api/info", authRoutes); // 인증 관련 라우트
app.use("/api/users", userRoutes); // 사용자 관련 라우트
// app.use("/token",tokenRoutes);
app.use("/api/board", boardRoutes);
app.use("/api/comments", commentsRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
