// index.js
const express = require("express");
const path = require("path");
const static = require("serve-static");
const bcrypt = require("bcrypt");
const session = require("express-session");
const cors = require("cors");
const pool = require("./models/pool"); // pool.js에서 pool을 불러옴
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const boardRoutes = require("./routes/boardRoutes");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", static(path.join(__dirname, "public")));

const corsOptions = {
  origin: ["*"],
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOptions));

// 라우트 설정
// app.use("/process", adminRoutes(pool)); // 관리자 관련 라우트
// app.use("/process", authRoutes(pool)); // 인증 관련 라우트
app.use("/process", userRoutes); // 사용자 관련 라우트
app.use("/board", boardRoutes)



// 서버 실행
const port = 5500;
app.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 실행 중입니다.`);
});
