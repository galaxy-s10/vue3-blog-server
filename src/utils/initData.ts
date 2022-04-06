const initAuth = () => {
  const auth = [
    {
      auth_name: 'ARTICLE_MANAGE',
      auth_description: '文章管理',
    },
    {
      auth_name: 'COMMENT_MANAGE',
      auth_description: '评论管理',
    },
    {
      auth_name: 'STAR_MANAGE',
      auth_description: '点赞管理',
    },
    {
      auth_name: 'TYPE_MANAGE',
      auth_description: '分类管理',
    },
    {
      auth_name: 'TAG_MANAGE',
      auth_description: '标签管理',
    },
    {
      auth_name: 'LINK_MANAGE',
      auth_description: '友链管理',
    },
    {
      auth_name: 'MUSIC_MANAGE',
      auth_description: '音乐管理',
    },
    {
      auth_name: 'USER_MANAGE',
      auth_description: '用户管理',
    },
    {
      auth_name: 'ROLE_MANAGE',
      auth_description: '角色管理',
    },
    {
      auth_name: 'AUTH_MANAGE',
      auth_description: '权限管理',
    },
    {
      auth_name: 'THEME_MANAGE',
      auth_description: '主题管理',
    },
    {
      auth_name: 'WORK_MANAGE',
      auth_description: '作品管理',
    },
    {
      auth_name: 'SETTING_MANAGE',
      auth_description: '设置管理',
    },
    {
      auth_name: 'VISITOR_MANAGE',
      auth_description: '访客管理',
    },
    {
      auth_name: 'LOG_MANAGE',
      auth_description: '日志管理',
    },
    {
      auth_name: 'QINIU_MANAGE',
      auth_description: '七牛云管理',
    },
    {
      auth_name: 'TASK_MANAGE',
      auth_description: '任务管理',
    },
  ];
  let id = 1;
  const authResult = [];
  auth.forEach((v: any) => {
    id += 1;
    // eslint-disable-next-line
    v.id = id;
    // eslint-disable-next-line
    v.p_id = 1;
    authResult.push(v);
  });

  authResult.forEach((item, index, arr) => {
    const { auth_name } = item;
    const { auth_description } = item;
    authResult.push({
      auth_name: `SELECT_${auth_name.split('_')[0]}`,
      auth_description: `${auth_description} - 查询`,
      id: arr.length + 2,
      p_id: item.id,
    });
    authResult.push({
      auth_name: `ADD_${auth_name.split('_')[0]}`,
      auth_description: `${auth_description} - 新增`,
      id: arr.length + 2,
      p_id: item.id,
    });
    authResult.push({
      auth_name: `DELETE_${auth_name.split('_')[0]}`,
      auth_description: `${auth_description} - 删除`,
      id: arr.length + 2,
      p_id: item.id,
    });
    authResult.push({
      auth_name: `UPDATE_${auth_name.split('_')[0]}`,
      auth_description: `${auth_description} - 修改`,
      id: arr.length + 2,
      p_id: item.id,
    });
  });
  authResult.unshift({
    auth_name: 'ALL_AUTH',
    auth_description: '全部权限',
    id: 1,
    p_id: 0,
  });
  return authResult;
};

const initRole = () => {
  const role = [
    {
      id: 1,
      role_name: 'ALL_ROLE',
      role_description: '全部角色',
      p_id: 0,
    },
    {
      id: 2,
      role_name: 'ADMIN',
      role_description: '管理员',
      p_id: 1,
    },
    {
      id: 3,
      role_name: 'SUPER_ADMIN',
      role_description: '超级管理员',
      p_id: 2,
    },
    {
      id: 4,
      role_name: 'USER',
      role_description: '用户',
      p_id: 1,
    },
    {
      id: 5,
      role_name: 'DEFAULT_USER',
      role_description: '普通用户',
      p_id: 4,
    },
    {
      id: 6,
      role_name: 'TOURIST_USER',
      role_description: '游客',
      p_id: 4,
    },
    {
      id: 7,
      role_name: 'DEVELOPER',
      role_description: '开发者',
      p_id: 1,
    },
  ];
  return role;
};

const initRoleAuth = () => {
  const auth = initAuth();
  const roleAuth = [];
  let id = 0;
  auth.forEach((v) => {
    id += 1;
    roleAuth.push({
      id,
      role_id: 1,
      auth_id: v.id,
    });
  });
  return roleAuth;
};

export const bulkCreateAuth = initAuth();
export const bulkCreateRole = initRole();
export const bulkCreateRoleAuth = initRoleAuth();
