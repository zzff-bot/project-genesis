/**
 * Project Genesis API Worker v3
 * 功能：认证、智能体/对话/消息 CRUD、管理员后台、账户管理
 */

// ===== 配置 =====
const ORIGINS = ['https://zzff-bot.github.io','http://localhost:5173','http://localhost:5174','http://localhost:4173'];
const JWT_EXPIRY = 7*24*60*60;

// ===== 工具 =====
function cors(request) {
  const o = request.headers.get('Origin')||'';
  const a = ORIGINS.includes(o) ? o : ORIGINS[0];
  return {'Access-Control-Allow-Origin':a,'Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Max-Age':'86400'};
}
function json(d,s=200,e={}){return new Response(JSON.stringify(d),{status:s,headers:{'Content-Type':'application/json',...e}});}
function err(m,s=400){return json({error:m},s);}
function b64(b){return btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function te(s){return new TextEncoder().encode(s);}
function td(b){return new TextDecoder().decode(b);}
function h2b(h){return Uint8Array.from(h.match(/.{1,2}/g),b=>parseInt(b,16));}
function b2h(b){return Array.from(b).map(x=>x.toString(16).padStart(2,'0')).join('');}
function uid(){try{return crypto.randomUUID();}catch{return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:r&0x3|0x8).toString(16);});}}

// ===== JWT =====
async function jwtSign(p,secret){
  const h={alg:'HS256',typ:'JWT'},n=Math.floor(Date.now()/1000);
  const f={...p,iat:n,exp:n+JWT_EXPIRY};
  const hb=b64(te(JSON.stringify(h))),pb=b64(te(JSON.stringify(f))),inp=`${hb}.${pb}`;
  const k=await crypto.subtle.importKey('raw',te(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const s=await crypto.subtle.sign('HMAC',k,te(inp));
  return`${inp}.${b64(new Uint8Array(s))}`;
}
async function jwtVerify(t,secret){
  try{
    const p=t.split('.');if(p.length!==3)return null;
    const[hb,pb,sb]=p,inp=`${hb}.${pb}`;
    const k=await crypto.subtle.importKey('raw',te(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
    const ss=sb.replace(/-/g,'+').replace(/_/g,'/');
    const sb2=Uint8Array.from(atob(ss),c=>c.charCodeAt(0));
    if(!(await crypto.subtle.verify('HMAC',k,sb2,te(inp))))return null;
    const pl=JSON.parse(atob(pb.replace(/-/g,'+').replace(/_/g,'/')));
    if(pl.exp&&pl.exp<Math.floor(Date.now()/1000))return null;
    return pl;
  }catch{return null;}
}

// ===== 密码 =====
async function hashPw(pw,salt){
  const s=salt||crypto.getRandomValues(new Uint8Array(16));
  const km=await crypto.subtle.importKey('raw',te(pw),'PBKDF2',false,['deriveBits']);
  const d=await crypto.subtle.deriveBits({name:'PBKDF2',salt:s,iterations:100000,hash:'SHA-256'},km,256);
  return`${b2h(s)}:${b2h(new Uint8Array(d))}`;
}
async function verifyPw(pw,stored){return(await hashPw(pw,h2b(stored.split(':')[0])))===stored;}
async function encryptPw(pt,keyStr){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const k=await crypto.subtle.importKey('raw',te(keyStr).slice(0,32),{name:'AES-GCM'},false,['encrypt']);
  const e=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,te(pt));
  return`${b2h(iv)}:${b2h(new Uint8Array(e))}`;
}
async function decryptPw(enc,keyStr){
  try{
    const[ivH,dH]=enc.split(':'),iv=h2b(ivH),d=h2b(dH);
    const k=await crypto.subtle.importKey('raw',te(keyStr).slice(0,32),{name:'AES-GCM'},false,['decrypt']);
    return td(new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv},k,d)));
  }catch{return'[解密失败]';}
}

// ===== 认证中间件 =====
async function auth(req,env){
  const h=req.headers.get('Authorization')||'';
  if(!h.startsWith('Bearer '))return null;
  const p=await jwtVerify(h.slice(7),env.JWT_SECRET);
  return p?{id:p.sub,email:p.email,username:p.username,role:p.role}:null;
}
async function requireAuth(req,env){
  const a=await auth(req,env);
  if(!a)throw new AuthError('未登录',401);
  const u=await env.DB.prepare('SELECT status FROM users WHERE id=?').bind(a.id).first();
  if(u&&u.status==='frozen')throw new AuthError('账户已被冻结',403);
  return a;
}
async function requireAdmin(req,env){const a=await requireAuth(req,env);if(a.role!=='admin')throw new AuthError('无权限',403);return a;}
class AuthError extends Error{constructor(m,s){super(m);this.status=s;}}

// ===== 认证 API =====
async function handleRegister(req,env){
  let b;try{b=await req.json();}catch{return err('请求格式错误');}
  const{email,username,password}=b;
  if(!email||!username||!password)return err('请填写完整');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return err('邮箱格式错误');
  if(password.length<6)return err('密码至少6位');

  const ex=await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first();
  if(ex)return err('该邮箱已被注册',409);

  const admins=(env.ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase());
  const role=admins.includes(email.toLowerCase())?'admin':'user';
  const pwHash=await hashPw(password);
  const pwEnc=env.ENCRYPTION_KEY?await encryptPw(password,env.ENCRYPTION_KEY):null;
  const id=uid(),now=Date.now();

  await env.DB.prepare(
    'INSERT INTO users(id,email,username,password_hash,password_encrypted,role,status,created_at,last_login)VALUES(?,?,?,?,?,?,?,?,?)'
  ).bind(id,email,username,pwHash,pwEnc,role,'active',now,now).run();

  await env.DB.prepare('INSERT INTO usage_logs(user_id,event_type,metadata,timestamp)VALUES(?,?,?,?)')
    .bind(id,'register',JSON.stringify({email}),now).run();

  const token=await jwtSign({sub:id,email,username,role},env.JWT_SECRET);
  return json({token,user:{id,email,username,role,status:'active',created_at:now}},201);
}

async function handleLogin(req,env){
  let b;try{b=await req.json();}catch{return err('请求格式错误');}
  const{email,password}=b;
  if(!email||!password)return err('请填写完整');

  const u=await env.DB.prepare(
    'SELECT id,email,username,password_hash,role,status,created_at FROM users WHERE email=?'
  ).bind(email).first();
  if(!u)return err('邮箱或密码错误',401);
  if(u.status==='frozen')return err('账户已被冻结，请联系管理员',403);
  if(!(await verifyPw(password,u.password_hash)))return err('邮箱或密码错误',401);

  const now=Date.now();
  await env.DB.prepare('UPDATE users SET last_login=? WHERE id=?').bind(now,u.id).run();
  await env.DB.prepare('INSERT INTO usage_logs(user_id,event_type,metadata,timestamp)VALUES(?,?,?,?)')
    .bind(u.id,'login','{}',now).run();

  const token=await jwtSign({sub:u.id,email:u.email,username:u.username,role:u.role},env.JWT_SECRET);
  return json({token,user:{id:u.id,email:u.email,username:u.username,role:u.role,status:u.status,created_at:u.created_at,last_login:now}});
}

async function handleMe(req,env){
  const a=await requireAuth(req,env);
  return json({user:{id:a.id,email:a.email,username:a.username,role:a.role}});
}

// ===== 智能体 API =====
async function getAgents(req,env){
  const a=await requireAuth(req,env);
  const r=await env.DB.prepare('SELECT id,name,config_json,created_at,updated_at FROM agents WHERE user_id=? ORDER BY updated_at DESC').bind(a.id).all();
  return json({agents:r.results.map(x=>({...x,config:JSON.parse(x.config_json)}))});
}
async function createAgent(req,env){
  const a=await requireAuth(req,env);
  let b;try{b=await req.json();}catch{return err('请求格式错误');}
  const{name,config}=b;
  if(!name||!config)return err('缺少名称或配置');
  const id=uid(),now=Date.now();
  await env.DB.prepare('INSERT INTO agents(id,user_id,name,config_json,created_at,updated_at)VALUES(?,?,?,?,?,?)')
    .bind(id,a.id,name,JSON.stringify(config),now,now).run();
  await env.DB.prepare('INSERT INTO usage_logs(user_id,event_type,metadata,timestamp)VALUES(?,?,?,?)')
    .bind(a.id,'agent_create',JSON.stringify({agent_id:id,name}),now).run();
  return json({id,name,config,created_at:now,updated_at:now},201);
}
async function updateAgent(req,env,agentId){
  const a=await requireAuth(req,env);
  const ex=await env.DB.prepare('SELECT id FROM agents WHERE id=? AND user_id=?').bind(agentId,a.id).first();
  if(!ex)return err('智能体不存在',404);
  let b;try{b=await req.json();}catch{return err('请求格式错误');}
  const{name,config}=b;const now=Date.now();
  if(name!==undefined&&config!==undefined)
    await env.DB.prepare('UPDATE agents SET name=?,config_json=?,updated_at=? WHERE id=?').bind(name,JSON.stringify(config),now,agentId).run();
  else if(name!==undefined)
    await env.DB.prepare('UPDATE agents SET name=?,updated_at=? WHERE id=?').bind(name,now,agentId).run();
  else if(config!==undefined)
    await env.DB.prepare('UPDATE agents SET config_json=?,updated_at=? WHERE id=?').bind(JSON.stringify(config),now,agentId).run();
  return json({success:true});
}
async function deleteAgent(req,env,agentId){
  const a=await requireAuth(req,env);
  const ex=await env.DB.prepare('SELECT id FROM agents WHERE id=? AND user_id=?').bind(agentId,a.id).first();
  if(!ex)return err('智能体不存在',404);
  const cs=await env.DB.prepare('SELECT id FROM conversations WHERE agent_id=?').bind(agentId).all();
  for(const c of cs.results)await env.DB.prepare('DELETE FROM messages WHERE conversation_id=?').bind(c.id).run();
  await env.DB.prepare('DELETE FROM conversations WHERE agent_id=?').bind(agentId).run();
  await env.DB.prepare('DELETE FROM agents WHERE id=?').bind(agentId).run();
  return json({success:true});
}

// ===== 对话 API =====
async function getConversations(req,env){
  const a=await requireAuth(req,env);
  const url=new URL(req.url);const agId=url.searchParams.get('agent_id');
  let q='SELECT id,user_id,agent_id,title,created_at,updated_at FROM conversations WHERE user_id=?';
  const p=[a.id];
  if(agId){q+=' AND agent_id=?';p.push(agId);}
  q+=' ORDER BY updated_at DESC';
  const cs=await env.DB.prepare(q).bind(...p).all();
  const r=[];
  for(const c of cs.results){
    const cnt=await env.DB.prepare('SELECT COUNT(*)as c FROM messages WHERE conversation_id=?').bind(c.id).first();
    r.push({...c,messageCount:cnt?.c||0});
  }
  return json({conversations:r});
}
async function createConversation(req,env){
  const a=await requireAuth(req,env);
  let b;try{b=await req.json();}catch{return err('请求格式错误');}
  const{agent_id,title}=b;
  if(!agent_id)return err('缺少 agent_id');
  const id=uid(),now=Date.now();
  await env.DB.prepare('INSERT INTO conversations(id,user_id,agent_id,title,created_at,updated_at)VALUES(?,?,?,?,?,?)')
    .bind(id,a.id,agent_id,title||null,now,now).run();
  return json({id,user_id:a.id,agent_id,title:title||null,created_at:now,updated_at:now,messageCount:0},201);
}
async function addMessage(req,env,convId){
  const a=await requireAuth(req,env);
  const cv=await env.DB.prepare('SELECT id FROM conversations WHERE id=? AND user_id=?').bind(convId,a.id).first();
  if(!cv)return err('对话不存在',404);
  let b;try{b=await req.json();}catch{return err('请求格式错误');}
  const{role,content}=b;
  if(!role||!content)return err('缺少 role 或 content');
  const now=Date.now();
  await env.DB.prepare('INSERT INTO messages(conversation_id,role,content,timestamp)VALUES(?,?,?,?)').bind(convId,role,content,now).run();
  await env.DB.prepare('UPDATE conversations SET updated_at=? WHERE id=?').bind(now,convId).run();
  await env.DB.prepare('INSERT INTO usage_logs(user_id,event_type,metadata,timestamp)VALUES(?,?,?,?)')
    .bind(a.id,'chat_message',JSON.stringify({conversation_id:convId,role}),now).run();
  return json({success:true,timestamp:now});
}
async function getMessages(req,env,convId){
  const a=await requireAuth(req,env);
  const cv=await env.DB.prepare('SELECT id FROM conversations WHERE id=? AND user_id=?').bind(convId,a.id).first();
  if(!cv)return err('对话不存在',404);
  const ms=await env.DB.prepare('SELECT id,role,content,timestamp FROM messages WHERE conversation_id=? ORDER BY timestamp ASC').bind(convId).all();
  return json({messages:ms.results});
}

// ===== 管理员 API =====
async function adminUsers(req,env){
  await requireAdmin(req,env);
  const url=new URL(req.url);
  const lim=Math.min(+url.searchParams.get('limit')||100,500),off=+url.searchParams.get('offset')||0;
  const us=await env.DB.prepare('SELECT id,email,username,role,status,created_at,last_login FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?').bind(lim,off).all();
  const t=await env.DB.prepare('SELECT COUNT(*)as c FROM users').first();
  return json({users:us.results,total:t?.c||0,limit:lim,offset:off});
}
async function adminStats(req,env){
  await requireAdmin(req,env);
  const tu=await env.DB.prepare('SELECT COUNT(*)as c FROM users').first();
  const ts=new Date();ts.setHours(0,0,0,0);
  const td=await env.DB.prepare('SELECT COUNT(*)as c FROM users WHERE created_at>=?').bind(ts.getTime()).first();
  const ac=await env.DB.prepare("SELECT COUNT(*)as c FROM users WHERE role='admin'").first();
  const ta=await env.DB.prepare('SELECT COUNT(*)as c FROM agents').first();
  const tc=await env.DB.prepare('SELECT COUNT(*)as c FROM conversations').first();
  const tm=await env.DB.prepare('SELECT COUNT(*)as c FROM messages').first();
  return json({totalUsers:tu?.c||0,todayUsers:td?.c||0,adminCount:ac?.c||0,totalAgents:ta?.c||0,totalConversations:tc?.c||0,totalMessages:tm?.c||0});
}
async function adminUserDetail(req,env,userId){
  await requireAdmin(req,env);
  const u=await env.DB.prepare('SELECT id,email,username,role,status,password_encrypted,created_at,last_login FROM users WHERE id=?').bind(userId).first();
  if(!u)return err('用户不存在',404);
  // 解密密码
  let pwd=null;
  if(u.password_encrypted&&env.ENCRYPTION_KEY)pwd=await decryptPw(u.password_encrypted,env.ENCRYPTION_KEY);
  // 智能体
  const ags=await env.DB.prepare('SELECT id,name,config_json,created_at,updated_at FROM agents WHERE user_id=? ORDER BY updated_at DESC').bind(userId).all();
  // 对话（含消息数和时长）
  const cvs=await env.DB.prepare('SELECT id,agent_id,title,created_at,updated_at FROM conversations WHERE user_id=? ORDER BY updated_at DESC').bind(userId).all();
  const cvs2=[];
  for(const c of cvs.results){
    const cnt=await env.DB.prepare('SELECT COUNT(*)as c FROM messages WHERE conversation_id=?').bind(c.id).first();
    const f=await env.DB.prepare('SELECT timestamp FROM messages WHERE conversation_id=? ORDER BY timestamp ASC LIMIT 1').bind(c.id).first();
    const l=await env.DB.prepare('SELECT timestamp FROM messages WHERE conversation_id=? ORDER BY timestamp DESC LIMIT 1').bind(c.id).first();
    cvs2.push({...c,messageCount:cnt?.c||0,duration:(f&&l)?l.timestamp-f.timestamp:0});
  }
  // 统计
  const ms=await env.DB.prepare("SELECT COUNT(*)as c FROM messages m JOIN conversations c ON m.conversation_id=c.id WHERE c.user_id=?").bind(userId).first();
  const logs=await env.DB.prepare('SELECT timestamp FROM usage_logs WHERE user_id=?').bind(userId).all();
  const days=new Set(logs.results.map(l=>new Date(l.timestamp).toDateString()));
  const la=await env.DB.prepare('SELECT event_type,timestamp FROM usage_logs WHERE user_id=? ORDER BY timestamp DESC LIMIT 10').bind(userId).all();

  return json({
    user:{...u,password_encrypted:undefined},
    password:pwd,
    agents:ags.results.map(x=>({...x,config:JSON.parse(x.config_json)})),
    conversations:cvs2,
    stats:{totalMessages:ms?.c||0,totalAgents:ags.results.length,totalConversations:cvs.results.length,activeDays:days.size,lastActivity:la.results}
  });
}
async function adminDeleteUser(req,env,userId){
  await requireAdmin(req,env);
  const u=await env.DB.prepare('SELECT id,role FROM users WHERE id=?').bind(userId).first();
  if(!u)return err('用户不存在',404);
  if(u.role==='admin')return err('不能删除管理员账户',403);
  // 级联删除
  const ags=await env.DB.prepare('SELECT id FROM agents WHERE user_id=?').bind(userId).all();
  for(const ag of ags.results){
    const cs=await env.DB.prepare('SELECT id FROM conversations WHERE agent_id=?').bind(ag.id).all();
    for(const c of cs.results)await env.DB.prepare('DELETE FROM messages WHERE conversation_id=?').bind(c.id).run();
    await env.DB.prepare('DELETE FROM conversations WHERE agent_id=?').bind(ag.id).run();
  }
  await env.DB.prepare('DELETE FROM agents WHERE user_id=?').bind(userId).run();
  await env.DB.prepare('DELETE FROM conversations WHERE user_id=?').bind(userId).run();
  await env.DB.prepare('DELETE FROM usage_logs WHERE user_id=?').bind(userId).run();
  await env.DB.prepare('DELETE FROM users WHERE id=?').bind(userId).run();
  return json({success:true});
}
async function adminUpdateStatus(req,env,userId){
  await requireAdmin(req,env);
  let b;try{b=await req.json();}catch{return err('请求格式错误');}
  const{status}=b;
  if(!status||!['active','frozen'].includes(status))return err('状态值无效');
  const u=await env.DB.prepare('SELECT id,role FROM users WHERE id=?').bind(userId).first();
  if(!u)return err('用户不存在',404);
  if(u.role==='admin'&&status==='frozen')return err('不能冻结管理员账户',403);
  await env.DB.prepare('UPDATE users SET status=? WHERE id=?').bind(status,userId).run();
  return json({success:true});
}
async function adminConversationMessages(req,env,convId){
  await requireAdmin(req,env);
  const cv=await env.DB.prepare('SELECT id,title,agent_id,user_id FROM conversations WHERE id=?').bind(convId).first();
  if(!cv)return err('对话不存在',404);
  const ms=await env.DB.prepare('SELECT id,role,content,timestamp FROM messages WHERE conversation_id=? ORDER BY timestamp ASC').bind(convId).all();
  return json({conversation:cv,messages:ms.results});
}
async function adminAllAgents(req,env){
  await requireAdmin(req,env);
  const url=new URL(req.url);
  const lim=Math.min(+url.searchParams.get('limit')||100,500),off=+url.searchParams.get('offset')||0;
  const ags=await env.DB.prepare(
    'SELECT a.id,a.name,a.config_json,a.user_id,u.username,u.email,a.created_at,a.updated_at FROM agents a JOIN users u ON a.user_id=u.id ORDER BY a.updated_at DESC LIMIT ? OFFSET ?'
  ).bind(lim,off).all();
  const t=await env.DB.prepare('SELECT COUNT(*)as c FROM agents').first();
  return json({agents:ags.results.map(x=>({...x,config:JSON.parse(x.config_json)})),total:t?.c||0,limit:lim,offset:off});
}
async function adminAllConversations(req,env){
  await requireAdmin(req,env);
  const url=new URL(req.url);
  const lim=Math.min(+url.searchParams.get('limit')||100,500),off=+url.searchParams.get('offset')||0;
  const cvs=await env.DB.prepare(
    'SELECT c.id,c.user_id,c.agent_id,c.title,c.created_at,c.updated_at,u.username,u.email FROM conversations c JOIN users u ON c.user_id=u.id ORDER BY c.updated_at DESC LIMIT ? OFFSET ?'
  ).bind(lim,off).all();
  const t=await env.DB.prepare('SELECT COUNT(*)as c FROM conversations').first();
  const r=[];
  for(const c of cvs.results){
    const cnt=await env.DB.prepare('SELECT COUNT(*)as c FROM messages WHERE conversation_id=?').bind(c.id).first();
    r.push({...c,messageCount:cnt?.c||0});
  }
  return json({conversations:r,total:t?.c||0,limit:lim,offset:off});
}

// ===== 使用日志 =====
async function handleUsageLog(req,env){
  const a=await requireAuth(req,env);
  let b;try{b=await req.json();}catch{return err('请求格式错误');}
  const{event_type,metadata}=b;
  if(!event_type)return err('缺少 event_type');
  await env.DB.prepare('INSERT INTO usage_logs(user_id,event_type,metadata,timestamp)VALUES(?,?,?,?)')
    .bind(a.id,event_type,JSON.stringify(metadata||{}),Date.now()).run();
  return json({success:true});
}

// ===== Chat 代理 =====
async function chatProxy(req,env,corsH){
  if(req.method!=='POST')return new Response('Method Not Allowed',{status:405,headers:{...corsH,'Content-Type':'text/plain'}});
  const body=await req.text();
  const dr=await fetch('https://api.deepseek.com/v1/chat/completions',{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${env.DEEPSEEK_API_KEY}`},body,
  });
  const rh=new Headers(dr.headers);
  for(const[k,v]of Object.entries(corsH))rh.set(k,v);
  return new Response(dr.body,{status:dr.status,statusText:dr.statusText,headers:rh});
}

// ===== 路由匹配 =====
function match(pattern,pathname){
  const pp=pattern.split('/'),pt=pathname.split('/');
  if(pp.length!==pt.length)return null;
  const params={};
  for(let i=0;i<pp.length;i++){
    if(pp[i].startsWith(':'))params[pp[i].slice(1)]=pt[i];
    else if(pp[i]!==pt[i])return null;
  }
  return params;
}
const ROUTES=[
  ['POST','/api/auth/register','register'],
  ['POST','/api/auth/login','login'],
  ['GET','/api/auth/me','me'],
  ['GET','/api/agents','getAgents'],
  ['POST','/api/agents','createAgent'],
  ['PUT','/api/agents/:id','updateAgent',true],
  ['DELETE','/api/agents/:id','deleteAgent',true],
  ['GET','/api/conversations','getConversations'],
  ['POST','/api/conversations','createConversation'],
  ['POST','/api/conversations/:id/messages','addMessage',true],
  ['GET','/api/conversations/:id/messages','getMessages',true],
  ['POST','/api/usage/log','usageLog'],
  ['GET','/api/admin/users','adminUsers'],
  ['GET','/api/admin/stats','adminStats'],
  ['GET','/api/admin/users/:id','adminUserDetail',true],
  ['DELETE','/api/admin/users/:id','adminDeleteUser',true],
  ['PUT','/api/admin/users/:id/status','adminUpdateStatus',true],
  ['GET','/api/admin/agents','adminAllAgents'],
  ['GET','/api/admin/conversations','adminAllConversations'],
  ['GET','/api/admin/conversations/:id/messages','adminConversationMessages',true],
  ['POST','/api/chat/completions','chatProxy'],
];

// ===== 主入口 =====
export default{async fetch(req,env){
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)});
  const url=new URL(req.url),pathname=url.pathname,corsH=cors(req);
  let matched=null,params={};
  for(const[m,p,h,hasP]of ROUTES){
    if(req.method!==m)continue;
    if(hasP){const ex=match(p,pathname);if(ex){matched=h;params=ex;break;}}
    else if(pathname===p){matched=h;break;}
  }
  if(!matched)return json({error:'Not Found',path:pathname},404,corsH);
  let r;
  try{
    switch(matched){
      case'register':r=await handleRegister(req,env);break;
      case'login':r=await handleLogin(req,env);break;
      case'me':r=await handleMe(req,env);break;
      case'getAgents':r=await getAgents(req,env);break;
      case'createAgent':r=await createAgent(req,env);break;
      case'updateAgent':r=await updateAgent(req,env,params.id);break;
      case'deleteAgent':r=await deleteAgent(req,env,params.id);break;
      case'getConversations':r=await getConversations(req,env);break;
      case'createConversation':r=await createConversation(req,env);break;
      case'addMessage':r=await addMessage(req,env,params.id);break;
      case'getMessages':r=await getMessages(req,env,params.id);break;
      case'usageLog':r=await handleUsageLog(req,env);break;
      case'adminUsers':r=await adminUsers(req,env);break;
      case'adminStats':r=await adminStats(req,env);break;
      case'adminUserDetail':r=await adminUserDetail(req,env,params.id);break;
      case'adminDeleteUser':r=await adminDeleteUser(req,env,params.id);break;
      case'adminUpdateStatus':r=await adminUpdateStatus(req,env,params.id);break;
      case'adminAllAgents':r=await adminAllAgents(req,env);break;
      case'adminAllConversations':r=await adminAllConversations(req,env);break;
      case'adminConversationMessages':r=await adminConversationMessages(req,env,params.id);break;
      case'chatProxy':r=await chatProxy(req,env,corsH);break;
      default:r=json({error:'Not Found'},404);
    }
  }catch(e){
    console.error(e);
    r=e instanceof AuthError?json({error:e.message},e.status):json({error:'服务器内部错误'},500);
  }
  const ct=r.headers.get('Content-Type')||'';
  if(ct.includes('application/json')){
    const nh=new Headers(r.headers);for(const[k,v]of Object.entries(corsH))nh.set(k,v);
    return new Response(r.body,{status:r.status,statusText:r.statusText,headers:nh});
  }
  return r;
}};
