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
  origin: ["http://localhost:3000", "http://192.168.99.115:3000", "http://localhost:5500"],
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOptions));

// 세션 미들웨어 설정
app.use(
  session({
    name: "user",
    secret: process.env.SESSION_SECRET || "0930",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 86400000,
      secure: false,
      sameSite: "lax",
      httpOnly: true,
      path: "/",
      domain: "localhost",
    },
  })
);

// 라우트 설정
app.use("/process", adminRoutes(pool)); // 관리자 관련 라우트
app.use("/process", authRoutes(pool)); // 인증 관련 라우트
app.use("/process", userRoutes(pool)); // 사용자 관련 라우트
app.use("/board", boardRoutes)

// 서버 실행
const port = 5500;
app.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 실행 중입니다.`);
});
