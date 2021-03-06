var express = require("express");
var router = express.Router();
const { isLoggedIn, isAdmin } = require("./middlewares");
const { Project, Emp_Proj, Employee, Role, Dept } = require("../models");
const { Op } = require("sequelize");

// 요구사항 4번) 경영진은 일반직원과는 다르게
// 타 직원들의 정보를 검색할 수 있는 권한이 있어야 한다.
router.use(isLoggedIn, isAdmin);

// 경영진 - 직원 정보 검색
router.get("/searchEmployee", async (req, res, next) => {
  try {
    let page = req.query.page;
    let offset = 0;
    const limit = 5;

    let totalPage = await Employee.count();
    totalPage = Math.ceil(totalPage / limit);

    if (page > 1) {
      offset = limit * (page - 1);
    }

    const initemp = await Employee.findAll({
      include: [{ model: Dept }],
      offset,
      limit,
      order: [["id", "ASC"]],
    });

    //deleteit
    console.log("==================================");
    console.log(totalPage);
    res.render("manager/searchEmployee", {
      title: "searchEmployee",
      result: initemp,
      totalPage,
      n: 1
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

// 경영진 - 직원 프로젝트 이력 열람
router.post("/searchEmployeeProject", async (req, res, next) => {
  var selected_search_key = req.body.selected_search_key;
  var search_key = req.body.search_key;

  if (selected_search_key == "id") {
    try {
      const initemp = await Employee.findOne({
        where: [{ id: search_key }],
        include: [{ model: Dept }],
      });
      if (initemp) {
        const proj_all = await Emp_Proj.findAll({
          include: [
            { model: Employee, where: { id: search_key } },
            { model: Project },
            { model: Role },
          ],
        });
        res.render("manager/searchEmployeeProject", {
          title: "searchEmployeeProject",
          result: initemp,
          result2: proj_all,
        });
      } else {
        return res.send(
          `<script type="text/javascript">window.location="/manager/searchEmployee";alert('존재하지 않는 아이디입니다.');</script>`
        );
      }
    } catch (error) {
      console.error(error);
      return next(error);
    }
  } else {
    try {
      const initemp = await Employee.findOne({
        where: [{ emp_name: search_key }],
        include: [{ model: Dept }],
      });
      if (initemp) {
        const proj_all = await Emp_Proj.findAll({
          include: [
            { model: Employee, where: { emp_name: search_key } },
            { model: Project },
            { model: Role },
          ],
        });
        res.render("manager/searchEmployeeProject", {
          title: "searchEmployee",
          result: initemp,
          result2: proj_all,
        });
      } else {
        return res.send(
          `<script type="text/javascript">window.location="/manager/searchEmployee";alert('존재하지 않는 이름입니다.');</script>`
        );
      }
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }
});

// 요구사항 6번) 경영진은 관리페이지를 통해 각 프로젝트 진행 상황 관리를 할 수 있다.
// 경영진 - 프로젝트검색
router.get("/manageAllProject", async function (req, res, next) {
  let page = req.query.page;
  let offset = 0;
  const limit = 5;

  let totalPage = await Project.count();
  totalPage = Math.ceil(totalPage / limit);

  if (page > 1) {
    offset = limit * (page - 1);
  }

  const projList = await Project.findAll({
    offset,
    limit,
    order: [
      ["proj_start_date", "DESC"],
      ["proj_end_date", "DESC"],
    ],
  });

  //deleteit
  console.log("------------------");
  console.log(totalPage);
  res.render("manager/manageAllProject", {
    title: "manageAllProject",
    result: projList,
    totalPage,
    n: 1
  });
});

// 요구사항 7번) 경영진은 관리 페이지에서 기간을 입력하여
// 그 기간 내에 진행되었던 프로젝트를 볼 수 있다.
router.post("/manageAllProject", async function (req, res, next) {
  let page = req.query.page;
  let offset = 0;
  const limit = 5;

  if (page > 1) {
    offset = limit * (page - 1);
  }

  let { start_date, end_date } = req.body;
  start_date = new Date(start_date);
  end_date = new Date(end_date);
  if (end_date < start_date) {
    return res.send(
      `<script type="text/javascript">window.location="/manager/manageAllProject";alert('올바르지 않은 입력입니다.');</script>`
    );
  } else {
    const projList = await Project.findAll({
      where: {
        proj_start_date: { [Op.gte]: start_date },
        proj_end_date: { [Op.lte]: end_date },
      },
    });
    return res.render("manager/manageAllProject", {
      title: "manageAllProject",
      result: projList,
    });
  }
});

// 경영진 - 프로젝트 상세 페이지로 이동
router.get("/project/:id", async function (req, res, next) {
  try {
    const currentProj = await Project.findOne({ where: { id: req.params.id } });
    const employeeList = await Emp_Proj.findAll({
      include: [
        { model: Employee },
        { model: Project, where: { id: req.params.id } },
        { model: Role },
      ],
    });
    res.render("manager/manProjectDetail", {
      title: "manProjectDetail",
      currentProj,
      employeeList,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

// 경영진 - 프로젝트 수정
router.get("/project/:id/update", async function (req, res, next) {
  try {
    const currentProj = await Project.findOne({ where: { id: req.params.id } });
    const employeeList = await Emp_Proj.findAll({
      include: [
        { model: Employee },
        { model: Project, where: { id: req.params.id } },
        { model: Role },
      ],
    });
    res.render("manager/updateManProjectDetail", {
      title: "updateManProjectDetail",
      currentProj,
      employeeList,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

// 요구사항 12번) 경영진은 프로젝트 예산을 조정할 수 있다.
router.post("/project/:id/update", async (req, res, next) => {
  const { budget } = req.body;
  await Project.update(
    {
      budget,
    },
    { where: { id: req.params.id } }
  );
  res.redirect(`/manager/project/${req.params.id}`);
});
module.exports = router;
