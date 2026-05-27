const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken"); // jwt 불러오기

const app = express();

// JSON 형태로 요청을 받을 수 있게 설정
app.use(cors());
app.use(express.json());

// JWT 서명 시 사용하는 비밀키 (실제 서비스에서 환경 변수로 관리)
const SECRET = "access-secret-key";

// 임시 유저 목록 (Test)
const USERS = [
    {id: 1, email: "test@naver.com", password: "1234", name: "변진호"},
]

// POST /api/auth/signup - 회원가입
app.post("/api/auth/signup", (req, res) => {
  // 요청 body에서 이메일, 비밀번호, 이름 꺼내기
  const { email, password, name } = req.body;

  // 이미 존재하는 이메일인지 확인
  const exists = USERS.find((u) => u.email === email);
    if(exists){
      // 400 : 이미 존재하는 리소스
      return res.status(400).json({message: "이미 존재하는 메일."});
    }

    const newUser = {
      id: USERS.length + 1, // id 카운팅
      email,
      password,
      name
    };

    USERS.push(newUser);

    res.json({message: "회원가입 성공"});
});

// POST /api/auth/login - 로그인
app.post("/api/auth/login", (req, res) => {
  // 요청 body에서 이메일, 비밀번호 꺼내기
  const { email, password } = req.body;

  // 일치하는 유저 정보 탐색
  const user = USERS.find(
    (u) => u.email === email && u.password === password
  );

  // 유저가 없으면 에러
  if (!user){
    return res.status(401).json({message: "이메일 또는 비밀번호가 틀렸습니다."})
  }

  /* 
    JWT 토큰 발급
    첫 번째 인자 : 토큰에 담을 정보 (payload)
    두 번째 인자 : 비밀키
    세 번째 인자 : 옵션 (만료 시간)
  */
  const accessToken = jwt.sign(
    {sub: user.id, email: user.email, name: user.name},
    SECRET,
    {expiresIn: "1h"}
  )

  // 성공한 경우 응답
  res.json({ accessToken });
});

// GET /api/user/me - 내 정보 조회
app.get("/api/user/me", (req, res) => {
  // 요청 헤더에서 Authorization 꺼내기 (증명 헤더)
  // 형태: "Bearer eyHJJSD..." (-> Bearer + JWT 토큰)
  const authHeader = req.headers.authorization;

  // 토큰이 없거나 Bearer 형식이 아니면 401 에러
  if(!authHeader || !authHeader.startsWith("Bearer ")){
    return res.status(401).json({message: "토큰 없음"});
  }

  // 앞에 Bearer + 공백 하나 제거하고 순수 토큰만 호출
  const token = authHeader.slice(7);

  try{
    // 토큰 검증 및 decode (SECRET이 다르면 에러 발생)
    const decoded = jwt.verify(token, SECRET);

    // decode 된 정보에서 유저 찾기
    const user = USERS.find((u) => u.id === decoded.sub);

    // 유저 정보 응답
    res.json({name: user.name, email: user.email});
  }catch(e){
    // 토큰이 만료되었거나 유효하지 않는 경우
    // 401 Unauthoried : 인증 실패
    res.status(401).json({message: "토큰이 만료되었거나 유효하지 않습니다."});
  }
});

// 4000번 포트로 서버 시작
app.listen(4000, () => {
  console.log("서버 실행 중 → http://localhost:4000");
});