const initAuth = () => {
  const auth = [
    {
      auth_name: 'ARTICLE_MANAGE',
      auth_value: '文章管理',
    },
    {
      auth_name: 'COMMENT_MANAGE',
      auth_value: '评论管理',
    },
    {
      auth_name: 'STAR_MANAGE',
      auth_value: '点赞管理',
    },
    {
      auth_name: 'TYPE_MANAGE',
      auth_value: '分类管理',
    },
    {
      auth_name: 'TAG_MANAGE',
      auth_value: '标签管理',
    },
    {
      auth_name: 'LINK_MANAGE',
      auth_value: '友链管理',
    },
    {
      auth_name: 'MUSIC_MANAGE',
      auth_value: '音乐管理',
    },
    {
      auth_name: 'USER_MANAGE',
      auth_value: '用户管理',
    },
    {
      auth_name: 'ROLE_MANAGE',
      auth_value: '角色管理',
    },
    {
      auth_name: 'AUTH_MANAGE',
      auth_value: '权限管理',
    },
    {
      auth_name: 'THEME_MANAGE',
      auth_value: '主题管理',
    },
    {
      auth_name: 'WORK_MANAGE',
      auth_value: '作品管理',
    },
    {
      auth_name: 'SETTING_MANAGE',
      auth_value: '设置管理',
    },
    {
      auth_name: 'VISITOR_MANAGE',
      auth_value: '访客管理',
    },
    {
      auth_name: 'LOG_MANAGE',
      auth_value: '日志管理',
    },
    {
      auth_name: 'QINIU_MANAGE',
      auth_value: '七牛云管理',
    },
    {
      auth_name: 'TASK_MANAGE',
      auth_value: '任务管理',
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
    const { auth_value } = item;
    authResult.push({
      auth_name: `SELECT_${auth_name.split('_')[0]}`,
      auth_value: `${auth_value} - 查询`,
      id: arr.length + 2,
      p_id: item.id,
    });
    authResult.push({
      auth_name: `ADD_${auth_name.split('_')[0]}`,
      auth_value: `${auth_value} - 新增`,
      id: arr.length + 2,
      p_id: item.id,
    });
    authResult.push({
      auth_name: `DELETE_${auth_name.split('_')[0]}`,
      auth_value: `${auth_value} - 删除`,
      id: arr.length + 2,
      p_id: item.id,
    });
    authResult.push({
      auth_name: `UPDATE_${auth_name.split('_')[0]}`,
      auth_value: `${auth_value} - 修改`,
      id: arr.length + 2,
      p_id: item.id,
    });
  });
  authResult.unshift({
    auth_name: 'ALL_AUTH',
    auth_value: '全部权限',
    id: 1,
    p_id: 0,
  });
  return authResult;
};

const initRole = () => {
  const role = [
    {
      id: 1,
      role_name: '全部角色',
      role_value: 'ALL_ROLE',
      type: 1,
      priority: 1,
      p_id: 0,
    },
    {
      id: 2,
      role_name: '管理员',
      role_value: 'ADMIN',
      type: 1,
      priority: 1,
      p_id: 1,
    },
    {
      id: 3,
      role_name: '超级管理员',
      role_value: 'SUPER_ADMIN',
      type: 1,
      priority: 1,
      p_id: 2,
    },
    {
      id: 4,
      role_name: '用户',
      role_value: 'USER',
      type: 1,
      priority: 1,
      p_id: 1,
    },
    {
      id: 5,
      role_name: 'VIP用户',
      role_value: 'VIP_USER',
      type: 1,
      priority: 1,
      p_id: 4,
    },
    {
      id: 6,
      role_name: '游客',
      role_value: 'TOURIST_USER',
      type: 1,
      priority: 1,
      p_id: 4,
    },
    {
      id: 7,
      role_name: '开发部门',
      role_value: 'DEVELOP',
      type: 1,
      priority: 1,
      p_id: 1,
    },
    {
      id: 8,
      role_name: '前端组',
      role_value: 'FRONTEND	',
      type: 1,
      priority: 1,
      p_id: 7,
    },
    {
      id: 9,
      role_name: '前端实习',
      role_value: 'FRONTEND_TRAINEE',
      type: 1,
      priority: 1,
      p_id: 8,
    },
    {
      id: 10,
      role_name: '前端经理',
      role_value: 'FRONTEND_MANAGER',
      type: 1,
      priority: 1,
      p_id: 8,
    },
    {
      id: 11,
      role_name: '后端组',
      role_value: 'BACKEND',
      type: 1,
      priority: 1,
      p_id: 7,
    },
    {
      id: 12,
      role_name: '业务部门',
      role_value: 'BUSINESS',
      type: 1,
      priority: 1,
      p_id: 1,
    },
    {
      id: 13,
      role_name: '产品',
      role_value: 'PRODUCT',
      type: 1,
      priority: 1,
      p_id: 12,
    },
    {
      id: 14,
      role_name: '运营',
      role_value: 'OPERATE',
      type: 1,
      priority: 1,
      p_id: 12,
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
