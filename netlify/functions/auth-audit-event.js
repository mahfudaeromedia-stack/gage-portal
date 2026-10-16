'use strict';
const {firebase,bearer,json}=require('./_firebase');
const ALLOWED=new Set(['Login','Logout']);
exports.handler=async(event)=>{
  if(event.httpMethod!=='POST')return json(405,{ok:false,message:'Method not allowed.'});
  try{
    const token=bearer(event);if(!token)return json(401,{ok:false,message:'Authentication required.'});
    const {auth,db}=firebase();const decoded=await auth.verifyIdToken(token,true);
    const snap=await db.collection('users').doc(decoded.uid).get();
    const profile=snap.exists?snap.data():{};
    const body=JSON.parse(event.body||'{}'),action=String(body.action||'');
    if(!ALLOWED.has(action))return json(400,{ok:false,message:'Unsupported audit action.'});
    const name=profile.name||profile.username||decoded.email||decoded.uid;
    const username=profile.username||profile.email||decoded.email||'';
    const role=profile.role||'';
    const timestamp=new Date().toISOString();
    await db.collection('portalData').doc('auditLogs').collection('records').add({
      action,actorId:decoded.uid,actorName:name,actorRole:role,name,username,role,
      module:'Authentication',object:'Session',detail:action==='Login'?'Portal sign-in':'Portal sign-out',
      page:body.page||'',createdAt:timestamp,timestamp,result:'SUCCESS'
    });
    return json(200,{ok:true});
  }catch(e){return json(e?.code==='auth/id-token-expired'?401:500,{ok:false,message:e.message||'Audit event failed.'})}
};
