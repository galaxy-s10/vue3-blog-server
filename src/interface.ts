export interface ITheme {
  id?: number;
  model: number;
  key: string;
  value: string;
  lang: string;
}
export interface IFrontend {
  id?: number;
  frontend_login: number;
  frontend_register: number;
  frontend_qq_login: number;
  frontend_github_login: number;
  frontend_comment: number;
  frontend_link: number;
  frontend_about: string;
}
export interface IIpdata {
  city: string;
  country: string;
  district: string;
  info: string;
  infocode: string;
  ip: string;
  isp: string;
  location: string;
  province: string;
  status: string;
}

export interface IUser {
  id?: number;
  username?: string;
  password?: string;
  status?: number;
  avatar?: string;
  title?: string;
  token?: string;
}

export interface IQqUser {
  id?: number;
  client_id: number;
  openid: string;
  unionid: string;
  nickname: string;
  figureurl: string;
  figureurl_1: string;
  figureurl_2: string;
  figureurl_qq_1: string;
  figureurl_qq_2: string;
  constellation: string;
  gender: string;
  city: string;
  province: string;
  year: string;
  ret?: number;
}

export interface IType {
  id?: number;
  name: string;
}

export interface IMusic {
  id?: number;
  name: string;
  img: string;
  author: string;
  url: string;
  status: number;
}
export interface IThirdUser {
  id?: number;
  user_id: string;
  third_user_id: string;
  third_platform: string;
}

export interface ILink {
  id?: number;
  email?: string;
  name: string;
  avatar: string;
  desc: string;
  url: string;
  status?: number;
}

export interface ITag {
  id?: number;
  name: string;
  color: string;
}

export interface ILog {
  id?: number;
  user_id: number;
  api_user_agent: string;
  api_sql_duration?: number;
  api_from: number;
  api_ip: string;
  api_hostname: string;
  api_method: string;
  api_path: string;
  api_query: string;
  api_body: string;
  api_err_msg?: string;
  api_err_stack?: string;
}

export interface IArticle {
  id?: number;
  title: string;
  desc?: string;
  content: string;
  header_img?: string;
  is_comment?: number;
  status?: string;
  click?: string;
  tag_ids?: number[];
  type_ids?: number[];
  user_ids: number[];
  keyword?: string;
}
export interface IComment {
  id?: number;
  from_user_id: number;
  content: string;
  children_comment_total?: number;
  ua: string;
  ip: string;
  ip_data: string;
  parent_comment_id?: number;
  reply_comment_id?: number;
  article_id?: number;
  to_user_id?: number;
  p_comment?: any[];
  created_at?: string;
  updated_at?: string;
  to_user?: IUser;
  from_user?: IUser;
  stars?: any[];
}
export interface IAuth {
  id?: number;
  p_id: number;
  auth_name: string;
  auth_description: string;
}
export interface IStar {
  id?: number;
  article_id: number;
  comment_id: number;
  to_user_id?: number;
  from_user_id: number;
}

export interface IRole {
  id?: number;
  p_id: number;
  role_name: string;
  role_description: string;
}

export interface IList {
  nowPage?: string;
  pageSize?: string;
  orderBy?: string;
  orderName?: string;
}

export interface IArticleTag {
  id?: number;
  article_id: number;
  tag_id: number;
}
