export interface ITheme {
  id?: number;
  model?: number;
  key?: string;
  value?: string;
  lang?: string;
  desc?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IBuryingPoint {
  id?: number;
  ip?: string;
  article_id?: number;
  user_id?: number;
  user_agent?: string;
  field_a?: string;
  field_b?: string;
  field_c?: string;
  field_d?: string;
  field_e?: string;
  field_f?: string;
  field_g?: string;
  remark?: string;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IBlacklist {
  id?: number;
  ip?: string;
  user_id?: number;
  type?: number;
  msg?: string;
  user_agent?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export type IFormType =
  | 'input'
  | 'password'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'markdown'
  | 'switch'
  | 'upload'
  | 'treeSelect';

export enum InteractionStatisType {
  historyInfo = 'historyInfo', // 历史数据，只有一条记录
  dayInfo = 'dayInfo', // 每天数据，有很多条记录
}

export interface IInteractionStatis {
  id?: number;
  key?: string;
  value?: string;
  desc?: string;
  type?: InteractionStatisType;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IInteraction {
  id?: number;
  user_type?: number;
  user_info?: string;
  ip?: string;
  ip_data?: string;
  type?: string;
  value?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IFrontend {
  id?: number;
  key?: string;
  value?: string;
  desc?: string;
  type?: IFormType;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IBackend {
  id?: number;
  key?: string;
  value?: string;
  desc?: string;
  type?: IFormType;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IIpdata {
  // 返回状态说明 返回状态说明，status 为0时，info 返回错误原因，否则返回“OK”。
  info: string;
  // 状态码 返回状态说明,10000代表正确,详情参阅 info 状态表
  infocode: string;
  // 返回结果状态值 值为0或1,0表示失败；1表示成功
  status: string;
  // 省份名称 若为直辖市则显示直辖市名称；如果在局域网 IP 网段内，则返回“局域网”；非法 IP 以及国外 IP 则返回空
  province: string;
  // 城市名称 若为直辖市则显示直辖市名称；如果为局域网网段内 IP 或者非法 IP 或国外 IP，则返回空
  city: string;
  // 城市的 adcode 编码 adcode 信息可参考 城市编码表 获取
  adcode: string;
  // 所在城市矩形区域范围 所在城市范围的左下右上对标对
  rectangle: string;
  country?: string;
  district?: string;
  ip?: string;
  isp?: string;
  location?: string;
  frontend_rec_ip?: string;
}

export interface IEmailUser {
  id?: number;
  email?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IEmail {
  id?: number;
  email?: string;
  code?: string;
  exp?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IQqUser {
  id?: number;
  client_id?: number;
  openid?: string;
  unionid?: string;
  nickname?: string;
  figureurl?: string;
  figureurl_1?: string;
  figureurl_2?: string;
  figureurl_qq_1?: string;
  figureurl_qq_2?: string;
  constellation?: string;
  gender?: string;
  city?: string;
  province?: string;
  year?: string;
  ret?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
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
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IType {
  id?: number;
  name?: string;
  priority?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IMusic {
  id?: number;
  name?: string;
  cover_pic?: string;
  author?: string;
  audio_url?: string;
  status?: number;
  priority?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IQiniuData {
  id?: number;
  user_id?: number;
  prefix?: string;
  bucket?: string;
  qiniu_key?: string;
  qiniu_hash?: string;
  qiniu_fsize?: number;
  qiniu_mimeType?: string;
  qiniu_putTime?: string;
  qiniu_type?: number;
  qiniu_status?: number;
  qiniu_md5?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IThirdUser {
  id?: number;
  user_id?: number;
  third_user_id?: number;
  third_platform?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IUploadRes {
  error: string[];
  success: {
    bucket: string;
    key: string;
    hash: string;
    fsize: number;
    mimeType: string;
    original: {
      filename: string;
      key: string;
      prefix: string;
      putTime: string;
    };
    url: string;
  }[];
}

export interface ILink {
  id?: number;
  email?: string;
  name?: string;
  avatar?: string;
  desc?: string;
  url?: string;
  status?: number;
  priority?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IWorks {
  id?: number;
  name?: string;
  desc?: string;
  url?: string;
  bg_url?: string;
  priority?: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ITag {
  id?: number;
  name?: string;
  color?: string;
  priority?: number;

  article_status?: number;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ILog {
  id?: number;
  user_id?: number;
  status?: number;
  api_user_agent?: string;
  api_duration?: number;
  api_from?: number;
  api_forwarded_for?: string;
  api_referer?: string;
  api_real_ip?: string;
  api_host?: string;
  api_hostname?: string;
  api_method?: string;
  api_path?: string;
  api_query?: string;
  api_body?: string;
  api_status_code?: number;
  api_error?: string;
  api_err_msg?: string;
  api_err_code?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IMonit {
  id?: number;
  type?: number;
  info?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
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
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  github_users?: IGithubUser[];
  qq_users?: IQqUser[];
  email_users?: IEmailUser[];
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
  visit?: number;
  click?: number;
  tags?: number[];
  types?: number[];
  users?: number[];
  keyWord?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IComment {
  id?: number;
  from_user_id?: number;
  content?: string;
  children_comment_total?: number;
  ip?: string;
  ip_data?: string;
  parent_comment_id?: number;
  reply_comment_id?: number;
  article_id?: number;
  to_user_id?: number;
  p_comment?: any[];
  to_user?: IUser;
  from_user?: IUser;
  stars?: any[];
  star_total?: number;
  status?: number;
  user_agent?: string;
  priority?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IVisitorLog {
  id?: number;
  user_id?: number;
  ip?: string;
  ip_data?: string;
  page_url?: string;
  user_agent?: string;
  total?: number; // 获取当天访客访问数据的时候添加了一个total字段
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IStar {
  id?: number;
  article_id?: number;
  comment_id?: number;
  to_user_id?: number;
  from_user_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface IAuth {
  id?: number;
  p_id?: number;
  auth_name?: string;
  auth_value?: string;
  type?: number;
  priority?: number;
  c_auths?: number[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IRole {
  id?: number;
  p_id?: number;
  role_name?: string;
  role_value?: string;
  type?: number;
  priority?: number;
  role_auths?: number[];
  c_roles?: number[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IRoleAuth {
  id?: number;
  role_id?: number;
  auth_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export type IList<T> = {
  nowPage?: string;
  pageSize?: string;
  orderBy?: string;
  orderName?: string;
  keyWord?: string;
  rangTimeType?: 'created_at' | 'updated_at' | 'deleted_at';
  rangTimeStart?: string;
  rangTimeEnd?: string;
} & T;

export interface IArticleTag {
  id?: number;
  article_id?: number;
  tag_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IArticleType {
  id?: number;
  article_id?: number;
  type_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IUserArticle {
  id?: number;
  user_id: number;
  article_id: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IUserRole {
  id?: number;
  user_id: number;
  role_id: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
export interface IDayData {
  id?: number;
  today: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
