// regex.js

// 정규 표현식 정의
const emailRegex =
  /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i; // 이메일 정규 표현식
const nameRegex = /^[가-힣a-zA-Z]{2,}$/; // 이름 정규 표현식 (한글 또는 영문자, 2자 이상)
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/; // 비밀번호 정규 표현식
const ageRegex = /^(1[0-9]{1}|[1-9]?[0-9])$/; // 나이 정규 표현식 (1세 이상 100세 이하)

module.exports = {
  emailRegex,
  nameRegex,
  passwordRegex,
  ageRegex,
};
