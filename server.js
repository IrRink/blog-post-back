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
const tokenRoutes = require("./routes/tokenRoutes")

const app = express();  
app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const corsOptions = {
  origin: ["http://localhost:3000", "http://192.168.99.115:3000", "http://localhost:5500", "http://127.0.0.1:5500"],
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT","DELETE", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOptions));

// 라우트 설정
app.use("/admin", adminRoutes); // 관리자 관련 라우트
app.use("/info", authRoutes); // 인증 관련 라우트
app.use("/user", userRoutes); // 사용자 관련 라우트
app.use("/token",tokenRoutes);
app.use("/board", boardRoutes);


const PORT =  5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
