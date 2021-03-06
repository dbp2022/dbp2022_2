var express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { getDeptId } = require("./user");
const Employee = require("../models/employee");
var router = express.Router();

// 요구사항 2번) 회원가입 시 회원 로그인은 중복 체크 기능을 추가하여
// 기 등록된 id로 회원가입 신청을 할 경우 에러 메시지를 출력하고
// 중복되지 않은 신규 id를 입력할 수 있어야 한다.
// 회원가입
router.post("/signup", isNotLoggedIn, async (req, res, next) => {
  const {
    id,
    password,
    name,
    resident_number,
    final_edu,
    skill,
    career,
    dept,
  } = req.body;
  const Dept_id = getDeptId(dept);
  try {
    const exEmp = await Employee.findOne({ where: { emp_ID: id } });
    // 기등록된 id의 경우 에러 메시지 출력
    if (exEmp) {
      return res.send(
        `<script type="text/javascript">window.location="/auth/signup";alert('이미 존재하는 사용자입니다.');</script>`
      );
    } else {
      const hash = await bcrypt.hash(password, 12);
      await Employee.create({
        emp_ID: id,
        emp_PW: hash,
        emp_name: name,
        emp_resident_number: resident_number,
        emp_final_edu: final_edu,
        skill,
        career,
        Dept_id,
      });
      return res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    return next(err);
  }
});
// 회원가입 화면
router.get("/signup", isNotLoggedIn, async (req, res, next) => {
  try {
    res.render("signup", { title: "Signup" });
  } catch (error) {
    console.error(error);
  }
});

// 요구사항 1번) 사용자는 아이디와 비밀번호로 로그인할 수 있다.
//로그인
router.post("/login", isNotLoggedIn, (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      // return res.redirect(`/?loginError=${info.message}`);
      return res.send(
        `<script type="text/javascript">window.location="/auth/login";alert('${info.message}');</script>`
      );
    }
    return req.logIn(user, (loginError) => {
      if (loginError) {
        console.error("loginError");
        return next(loginError);
      }
      return res.redirect("/");
    });
  })(req, res, next);
});

//로그인 화면
router.get("/login", isNotLoggedIn, (req, res, next) => {
  try {
    res.render("login", { title: "Login" });
  } catch (error) {
    console.error(error);
  }
});

//로그아웃
router.get("/signout", isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
  // req.logout(() => {
  //   res.redirect("/");
  // });
});

module.exports = router;
