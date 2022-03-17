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
      auth_name: 'ROLE_MANAGE',
      auth_description: '角色管理',
    },
    {
      auth_name: 'AUTH_MANAGE',
      auth_description: '权限管理',
    },
    {
      auth_name: 'SETTING_MANAGE',
      auth_description: '设置管理',
    },
    {
      auth_name: 'LOG_MANAGE',
      auth_description: '日志管理',
    },
    {
      auth_name: 'QINIU_MANAGE',
      auth_description: '七牛云管理',
    },
  ];
  let id = 1;
  const authResult = [];
  auth.forEach((v) => {
    id += 1;
    v.p_id = 0;
    v.id = id;
    authResult.push(v);
  });

  authResult.forEach((item, index, arr) => {
    const { auth_name } = item;
    const { auth_description } = item;
    // let id = arr.length + 1;
    authResult.push({
      id: arr.length + 1,
      auth_name: `SELECT_${auth_name.split('_')[0]}`,
      auth_description: `${auth_description} - 查询`,
      p_id: item.id,
    });
    authResult.push({
      id: arr.length + 1,
      auth_name: `ADD_${auth_name.split('_')[0]}`,
      auth_description: `${auth_description} - 新增`,
      p_id: item.id,
    });
    authResult.push({
      id: arr.length + 1,
      auth_name: `DELETE_${auth_name.split('_')[0]}`,
      auth_description: `${auth_description} - 删除`,
      p_id: item.id,
    });
    authResult.push({
      id: arr.length + 1,
      auth_name: `EDIT_${auth_name.split('_')[0]}`,
      auth_description: `${auth_description} - 修改`,
      p_id: item.id,
    });
  });
  // authResult.unshift({
  //   id: 0,
  //   auth_name: '全部',
  //   auth_description: '全部权限',
  //   p_id: item.id,
  // });
  return authResult;
};
const initRole = () => {
  const role = [
    {
      id: 1,
      role_name: 'ADMIN',
      role_description: '管理员',
      p_id: 0,
    },
    {
      id: 2,
      role_name: 'USER',
      role_description: '用户',
      p_id: 0,
    },
    {
      id: 3,
      role_name: 'TEST',
      role_description: '测试',
      p_id: 0,
    },
    {
      id: 4,
      role_name: 'SUPER_ADMIN',
      role_description: '超级管理员',
      p_id: 1,
    },
    {
      id: 5,
      role_name: 'VIP_USER',
      role_description: 'VIP用户',
      p_id: 2,
    },
    {
      id: 6,
      role_name: 'SVIP_USER',
      role_description: 'SVIP用户',
      p_id: 2,
    },
  ];
  return role;
};
const initRoleAuth = () => {
  const auth = initAuth();
  const roleAuth = [];
  let id = 1;
  auth.forEach((v) => {
    id += 1;
    roleAuth.push({
      id,
      role_id: 4,
      auth_id: v.id,
    });
  });
  return roleAuth;
};

export const bulkCreateAuth = initAuth();
export const bulkCreateRole = initRole();
export const bulkCreateRoleAuth = initRoleAuth();
