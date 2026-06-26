import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://trans-bygagoos.onrender.com/api/v1';
const tk = () => localStorage.getItem('chauffeur-token') || '';
const chauffeur = () => JSON.parse(localStorage.getItem('chauffeur') || '{}');
const moto = () => JSON.parse(localStorage.getItem('moto') || 'null') || chauffeur()?.moto;

// ========== INDEXEDDB POUR MODE HORS LIGNE ==========
let db: any = null;
function openDB(): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TransByGagoosOffline', 4);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore('courses_offline', { keyPath: 'id', autoIncrement: true });
      store.createIndex('synced', 'synced');
    };
    request.onsuccess = () => { db = request.result; resolve(db); };
    request.onerror = () => reject(request.error);
  });
}
async function saveOffline(course: any) {
  if (!db) await openDB();
  const tx = db.transaction('courses_offline', 'readwrite');
  await tx.store.add({ ...course, synced: 0, date: new Date().toISOString() });
}
async function syncOffline() {
  if (!db) return;
  const tx = db.transaction('courses_offline', 'readonly');
  const courses = await tx.store.getAll();
  const unsynced = courses.filter((c: any) => c.synced === 0);
  for (const c of unsynced) {
    try {
      await axios.post(`${API}/courses/sync`, { chauffeurId: c.chauffeurId, courses: [c] }, { headers: { Authorization: `Bearer ${tk()}` } });
      const delTx = db.transaction('courses_offline', 'readwrite');
      await delTx.store.delete(c.id);
    } catch (e) {}
  }
}

function CoursesPage(){
  const c=chauffeur();
  const {data}=useQuery({queryKey:['courses',c?.id],queryFn:()=>axios.get(`${API}/courses`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data).catch(()=>[]),enabled:!!c?.id});
  const courses=Array.isArray(data)?data:[];
  return <div><div className="card"><div className="card-title">📋 Mes courses</div></div>{courses.length===0?<p style={{color:'#888',textAlign:'center',padding:20}}>Aucune course</p>:courses.slice(0,100).map((course:any)=><div key={course.id} className="course-item"><div><div style={{fontWeight:'bold',color:'#DAA520',fontSize:12}}>{course.type}</div><div className="course-date">{new Date(course.createdAt).toLocaleString('fr')}</div></div><div className="course-price">{course.prix?.toLocaleString()} Ar</div></div>)}</div>;
}

// ========== VERSEMENTS ==========

function VersementsPage(){
  const c=chauffeur(); const [montant,setMontant]=useState(''); const [msg,setMsg]=useState('');
  const qc=useQueryClient();
  const {data}=useQuery({queryKey:['versements',c?.id],queryFn:()=>axios.get(`${API}/versements/chauffeur/${c?.id}`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data),enabled:!!c?.id});
  const resume=data?.resume||{totalDu:0,totalVerse:0,resteAPayer:0,gainNetJour:0,disponible:0};
  const impayes=data?.impayes||[];
  const versements=data?.versements||[];
  const envoyer=()=>{if(!montant)return;axios.post(`${API}/versements`,{chauffeurId:c?.id,montantVerse:parseFloat(montant)},{headers:{Authorization:`Bearer ${tk()}`}}).then(()=>{setMsg('✅ Demande envoyée');setMontant('');qc.invalidateQueries({queryKey:['versements']});}).catch((err:any)=>setMsg('❌ '+(err.response?.data?.message||'Erreur')));};
  return (
    <div>
      {msg&&<div className={`floating-alert ${msg.includes('✅')?'success':'warning'}`}>{msg}</div>}
      <div className="card"><div className="card-title">💰 Résumé</div>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-value" style={{color:'#DAA520'}}>{resume.gainNetJour.toLocaleString()} Ar</div><div className="stat-label">Gain net du jour</div></div>
          <div className="stat-item"><div className="stat-value" style={{color:'#27ae60'}}>{resume.totalVerse.toLocaleString()} Ar</div><div className="stat-label">Total versé</div></div>
          <div className="stat-item"><div className="stat-value" style={{color:'#e74c3c'}}>{resume.resteAPayer.toLocaleString()} Ar</div><div className="stat-label">Reste à payer</div></div>
          <div className="stat-item"><div className="stat-value" style={{color:resume.disponible>=0?'#27ae60':'#e74c3c'}}>{resume.disponible.toLocaleString()} Ar</div><div className="stat-label">Disponible</div></div>
        </div>
      </div>
      {impayes.length>0&&(<div className="card" style={{borderLeft:'3px solid #e74c3c'}}><div className="card-title">⚠️ Versements impayés ({impayes.length})</div>
        {impayes.map((v:any)=>(<div key={v.id} style={{background:'#252525',borderRadius:10,padding:10,marginBottom:6,display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'bold',color:'#e74c3c'}}>{v.reste?.toLocaleString()} Ar</div><div style={{fontSize:10,color:'#888'}}>{new Date(v.date).toLocaleDateString('fr')} - Dû: {v.montantDu?.toLocaleString()} Ar</div></div><span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'rgba(239,68,68,0.2)',color:'#ef4444'}}>⚠️ Impayé</span></div>))}
      </div>)}
      <div className="card"><div style={{display:'flex',gap:8}}><input type="number" value={montant} onChange={e=>setMontant(e.target.value)} placeholder="Montant à verser" style={{flex:1,padding:10,background:'#252525',border:'1px solid #333',borderRadius:10,color:'#fff'}}/><button onClick={envoyer} className="btn-primary" style={{width:'auto'}}>Envoyer</button></div></div>
      <div className="card"><div className="card-title">📋 Historique</div>
        {versements.map((v:any)=>(<div key={v.id} style={{background:'#252525',borderRadius:10,padding:10,marginBottom:6,display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'bold'}}>{v.montantVerse?.toLocaleString()} Ar</div><div style={{fontSize:10,color:'#888'}}>{new Date(v.createdAt).toLocaleDateString('fr')}</div></div><span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:v.statut==='VALIDE'?'rgba(39,174,96,0.2)':'rgba(243,156,18,0.2)',color:v.statut==='VALIDE'?'#27ae60':'#f39c12'}}>{v.statut==='VALIDE'?'✅ Validé':'⏳ En attente'}</span></div>))}
      </div>
    </div>
  );
}
function StatsPage(){
  const c=chauffeur();
  const {data:dash}=useQuery({queryKey:['dashboard',c?.id],queryFn:()=>axios.get(`${API}/chauffeurs/${c?.id}/dashboard`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data),enabled:!!c?.id});
  const s=(p:string)=>dash?.[p]||{count:0,prix:0,commission:0,gainNet:0};
  return <div>{['aujourdhui','semaine','mois'].map(p=><div className="card" key={p}><div className="card-title">{p==='aujourdhui'?"📅 Aujourd'hui":p==='semaine'?'📆 Cette semaine':'🗓️ Ce mois'}</div><div className="stats-grid"><div className="stat-item"><div className="stat-value">{s(p).count}</div><div className="stat-label">Courses</div></div><div className="stat-item"><div className="stat-value">{s(p).prix.toLocaleString()} Ar</div><div className="stat-label">CA</div></div><div className="stat-item"><div className="stat-value">{s(p).commission.toLocaleString()} Ar</div><div className="stat-label">Commission</div></div><div className="stat-item"><div className="stat-value" style={{color:s(p).gainNet>=0?'#27ae60':'#e74c3c'}}>{s(p).gainNet.toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div></div></div>)}<div className="card" style={{background:'linear-gradient(135deg, #1a1a1a, #DAA52022)',border:'1px solid #DAA520',textAlign:'center',padding:20}}><div style={{fontSize:11,color:'#DAA520',letterSpacing:2}}>SOLDE ACTUEL</div><div style={{fontSize:30,fontWeight:800,color:'#DAA520'}}>{dash?.solde?.toLocaleString()||0} Ar</div></div></div>;
}

// ========== PROFIL ==========

function ProfilPage({onLogout}:{onLogout:()=>void}){
  const c=chauffeur(); const m=moto();
  return <div><div className="card"><div className="card-title">👤 Mon profil</div><div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}><div style={{width:60,height:60,borderRadius:'50%',background:'#DAA520',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:'bold',color:'#000'}}>{c?.nom?.charAt(0)||'?'}</div><div><div style={{fontSize:18,fontWeight:700}}>{c?.nom}</div><div style={{fontSize:12,color:'#888'}}>{c?.codeAcces}</div></div></div><div style={{borderTop:'1px solid #333',paddingTop:12}}><div className="profil-item"><span style={{color:'#888'}}>📱 Téléphone</span><span>{c?.telephone||'-'}</span></div><div className="profil-item"><span style={{color:'#888'}}>🏍️ Moto</span><span>{m?.immatriculation||'Aucune'}</span></div><div className="profil-item"><span style={{color:'#888'}}>📊 Statut</span><span>{c?.statut||'HORS_SERVICE'}</span></div><div className="profil-item"><span style={{color:'#888'}}>💰 Solde</span><span style={{color:'#DAA520',fontWeight:700}}>{c?.solde?.toLocaleString()||0} Ar</span></div></div></div><button onClick={onLogout} style={{width:'100%',padding:14,background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:12,color:'#f87171',fontWeight:600,fontSize:14,cursor:'pointer',marginTop:10}}>🚪 Déconnexion</button></div>;
}

// ========== NOTIFICATIONS ==========

function BottomNav({current,onChange}:{current:string;onChange:(p:any)=>void}){
  const tabs=[{key:'accueil',label:'Accueil',icon:'🏠'},{key:'courses',label:'Courses',icon:'📋'},{key:'versements',label:'Versements',icon:'💰'},{key:'stats',label:'Stats',icon:'📊'},{key:'profil',label:'Profil',icon:'👤'}];
  return <nav className="bottom-nav"><div className="nav-items">{tabs.map(t=><button key={t.key} onClick={()=>onChange(t.key)} className={`nav-item ${current===t.key?'active':''}`}><span style={{fontSize:18}}>{t.icon}</span><span>{t.label}</span></button>)}</div></nav>;
}




export default App;
