export interface ITheme {
  id?: number;
  model?: number;
  key?: string;
  value?: string;
  lang?: string;
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
  email?: string;
  status?: number;
  avatar?: string;
  desc?: string;
  token?: string;
  user_roles?: number[];
}
export interface IEmail {
  id?: number;
  email: string;
  code?: string;
  exp?: number;
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
export interface IGithubUser {
  id?: unknown;
  client_id?: unknown;
  login?: unknown;
  github_id?: unknown;
  node_id?: unknown;
  avatar_url?: unknown;
  gravatar_id?: unknown;
  url?: unknown;
  html_url?: unknown;
  type?: unknown;
  site_admin?: unknown;
  name?: unknown;
  company?: unknown;
  blog?: unknown;
  location?: unknown;
  email?: unknown;
  hireable?: unknown;
  bio?: unknown;
  twitter_username?: unknown;
  public_repos?: unknown;
  public_gists?: unknown;
  followers?: unknown;
  following?: unknown;
  github_created_at?: unknown;
  github_updated_at?: unknown;
  private_gists?: unknown;
  total_private_repos?: unknown;
  owned_private_repos?: unknown;
  disk_usage?: unknown;
  collaborators?: unknown;
  two_factor_authentication?: unknown;
}

export interface IType {
  id?: number;
  name?: string;
}

export interface IMusic {
  id?: number;
  name?: string;
  cover_pic?: string;
  author?: string;
  audio_url?: string;
  status?: number;
}
export interface IThirdUser {
  id?: number;
  user_id: number;
  third_user_id: number;
  third_platform: number;
}

export interface ILink {
  id?: number;
  email?: string;
  name?: string;
  avatar?: string;
  desc?: string;
  url?: string;
  status?: number;
}
export interface IWorks {
  id?: number;
  name?: string;
  desc?: string;
  url?: string;
  bg_url?: string;
  priority?: string;
  status?: number;
}

export interface ITag {
  id?: number;
  name?: string;
  color?: string;
}

export interface ILog {
  id?: number;
  user_id?: number;
  api_user_agent?: string;
  api_sql_duration?: number;
  api_from?: number;
  api_ip?: string;
  api_hostname?: string;
  api_method?: string;
  api_path?: string;
  api_query?: string;
  api_body?: string;
  api_err_msg?: string;
  api_err_stack?: string;
}

export interface IArticle {
  id?: number;
  title?: string;
  desc?: string;
  priority?: number;
  content?: string;
  head_img?: string;
  is_comment?: number;
  status?: number;
  click?: number;
  tags?: number[];
  types?: number[];
  users?: number[];
  keyWord?: string;
}
export interface IComment {
  id?: number;
  from_user_id?: number;
  content?: string;
  children_comment_total?: number;
  ua?: string;
  ip?: string;
  ip_data?: string;
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

export interface IVisitor {
  id?: number;
  user_id?: number;
  ip?: string;
  status?: number;
  ip_data?: string;
}
export interface IStar {
  id?: number;
  article_id?: number;
  comment_id?: number;
  to_user_id?: number;
  from_user_id: number;
}

export interface IAuth {
  id?: number;
  p_id?: number;
  auth_name?: string;
  auth_value?: string;
  type?: number;
  priority?: number;
  c_auths?: number[];
}
export interface IRole {
  id?: number;
  p_id: number;
  role_name?: string;
  role_value?: string;
  type?: number;
  priority?: number;
  role_auths?: number[];
  c_roles?: number[];
}

export interface IList {
  nowPage?: string;
  pageSize?: string;
  orderBy?: string;
  orderName?: string;
  keyWord?: string;
}

export interface IArticleTag {
  id?: number;
  article_id: number;
  tag_id: number;
}
