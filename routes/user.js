const getUser = (raw_data) => {
  const { id, emp_ID, emp_name, emp_final_edu, skill, career, Dept_id } =
    raw_data;
  const dept = getDept(Dept_id);
  const current_user = {
    id,
    emp_ID,
    emp_name,
    emp_final_edu,
    skill,
    career,
    dept,
  };
  return current_user;
};
const getDept = (Dept_id) => {
  let dept;
  switch (Dept_id) {
    case 1:
      dept = "개발 1팀";
      break;
    case 2:
      dept = "개발 2팀";
      break;
    case 3:
      dept = "개발 3팀";
      break;
    default:
      dept = "개발 1팀";
      break;
  }
  return dept;
};
const getDeptId = (dept) => {
  let Dept_id;
  switch (dept) {
    case "개발 1팀":
      Dept_id = 1;
      break;
    case "개발 2팀":
      Dept_id = 2;
      break;
    case "개발 3팀":
      Dept_id = 3;
      break;
    default:
      Dept_id = 1;
      break;
  }
  return Dept_id;
};

module.exports = { getDept, getDeptId, getUser };
