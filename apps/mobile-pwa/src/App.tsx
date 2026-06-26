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

// ========== APP PRINCIPALE ==========
function App() {
  const queryClient = new QueryClient();
  useEffect(() => { openDB(); }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

function AppContent() {
  const [page, setPage] = useState<'login'|'accueil'|'courses'|'versements'|'stats'|'profil'|'notifications'>(tk()?'accueil':'login');
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const go=()=>setOnline(true), goff=()=>setOnline(false);
    window.addEventListener('online',go); window.addEventListener('offline',goff);
    if (online) syncOffline();
    return ()=>{window.removeEventListener('online',go); window.removeEventListener('offline',goff);};
  }, [online]);

  if (page==='login') return <LoginPage onLogin={()=>setPage('accueil')}/>;

  return (
    <>
      {!online && <div className="offline-indicator">📡 Mode hors ligne - Synchronisation automatique dès le retour de connexion</div>}
      <Header onLogout={()=>{localStorage.clear();setPage('login');}} online={online}/>
      <div className="main-content">
        {page==='accueil'&&<DashboardPage online={online}/>}
        {page==='courses'&&<CoursesPage/>}
        {page==='versements'&&<VersementsPage/>}
        {page==='stats'&&<StatsPage/>}
        {page==='profil'&&<ProfilPage onLogout={()=>{localStorage.clear();setPage('login');}}/>}
        {page==='notifications'&&<NotificationsPage onBack={()=>setPage('accueil')}/>}
      </div>
      <BottomNav current={page} onChange={setPage}/>
      <button className="fab-refresh" onClick={()=>window.location.reload()}>🔄</button>
      <button className="fab-assistance" onClick={()=>{
        const motif=prompt('📞 Décrivez votre problème :');
        if(motif&&motif.length>=10) axios.post(`${API}/assistance`,{chauffeurId:chauffeur()?.id,type:'AUTRE',urgence:'NORMALE',description:motif},{headers:{Authorization:`Bearer ${tk()}`}}).then(()=>alert('✅ Demande envoyée !')).catch(()=>alert('❌ Erreur'));
      }}>🆘</button>
    </>
  );
}

// ========== LOGIN ==========
function LoginPage({onLogin}:{onLogin:()=>void}){
  const [code,setCode]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setError('');if(!code||code.length<3){setError('Code requis');return;}setLoading(true);
    try{const{data}=await axios.post(`${API}/auth/chauffeur/code`,{code:code.toUpperCase()});localStorage.setItem('chauffeur-token',data.accessToken);localStorage.setItem('chauffeur',JSON.stringify(data.chauffeur));if(data.chauffeur?.moto)localStorage.setItem('moto',JSON.stringify(data.chauffeur.moto));onLogin();}catch{setError('Code introuvable');}finally{setLoading(false);}};
  return <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,fontFamily:'system-ui, sans-serif'}}>
    <div className="app-header" style={{position:'fixed',top:0}}><div className="header-content"><div className="header-left"><div className="header-logo"><img src="/assets/logo/b-trans.png" alt="Logo"/></div><div className="header-info"><h1>Trans ByGagoos</h1><p>Application Chauffeur</p></div></div></div></div>
    <div style={{width:'100%',maxWidth:380,marginTop:60}}><div className="card"><div className="card-title">🔑 Connexion</div>{error&&<div style={{color:'#e74c3c',marginBottom:12,fontSize:12,textAlign:'center',background:'rgba(231,76,60,0.1)',padding:8,borderRadius:8}}>{error}</div>}<form onSubmit={submit}><div className="form-group"><input type="text" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="CODE" maxLength={6} autoFocus style={{textAlign:'center',fontSize:26,fontWeight:'bold',letterSpacing:6,color:'#DAA520',border:'2px solid #DAA520'}}/></div><button type="submit" disabled={loading} className="btn-primary">{loading?'Connexion...':'Se connecter'}</button></form></div></div></div>;
}

// ========== HEADER ==========
function Header({onLogout,online}:{onLogout:()=>void,online:boolean}){
  const c=chauffeur(); const m=moto();
  const {data:dash}=useQuery({queryKey:['dashboard',c?.id],queryFn:()=>axios.get(`${API}/chauffeurs/${c?.id}/dashboard`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data),enabled:!!c?.id,refetchInterval:10000});
  const s:any={EN_SERVICE:{class:'presence-present',icon:'🟢',label:'En service'},EN_PAUSE:{class:'presence-pause',icon:'🟠',label:'En pause'},HORS_SERVICE:{class:'presence-absent',icon:'🔴',label:'Hors service'}};
  const st=s[c?.statut]||s.HORS_SERVICE;
  return <div className="app-header"><div className="header-content"><div className="header-left"><div className="header-logo"><img src="/assets/logo/b-trans.png" alt="Logo"/></div><div className="header-info"><h1>{c?.nom||'Chauffeur'}</h1><p><span className={`presence-badge ${st.class}`}>{st.icon} {st.label}</span><span className={`moto-badge ${!m?'sans-moto':''}`}>🏍️ {m?.immatriculation||'Pas de moto'}</span><span>🔑 {c?.codeAcces}</span></p></div></div><div className="header-right"><button className="icon-btn sync" onClick={()=>window.location.reload()} title="Synchroniser">🔄</button><button className="icon-btn" onClick={()=>{}} title="Notifications" style={{position:'relative'}}>🔔</button><button className="icon-btn logout" onClick={onLogout} title="Déconnexion">🚪</button><button className={`icon-btn ${online?'online':'offline'}`} title={online?'En ligne':'Hors ligne'}>{online?'📶':'📡'}</button></div></div></div>;
}

// ========== DASHBOARD ==========
function DashboardPage({online}:{online:boolean}){
  const qc=useQueryClient(); const c=chauffeur(); const m=moto();
  const [msg,setMsg]=useState(''); const [showConfirm,setShowConfirm]=useState(false);
  const [typeCourse,setTypeCourse]=useState('NORMALE'); const [kmDepart,setKmDepart]=useState(''); const [kmArrivee,setKmArrivee]=useState(''); const [montant,setMontant]=useState('');

  const {data:dash}=useQuery({queryKey:['dashboard',c?.id],queryFn:()=>axios.get(`${API}/chauffeurs/${c?.id}/dashboard`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data),enabled:!!c?.id,refetchInterval:10000});

  const pointer=useMutation({mutationFn:(type:string)=>axios.post(`${API}/pointages`,{chauffeurId:c?.id,type},{headers:{Authorization:`Bearer ${tk()}`}}),onSuccess:(_,type)=>{const labels:any={ARRIVEE:'✅ Service débuté !',PAUSE:'⏸️ Pause',REPRISE:'🔄 Reprise',FIN_SERVICE:'🏁 Service terminé'};setMsg(labels[type]||'✅ OK');qc.invalidateQueries({queryKey:['dashboard']});setTimeout(()=>setMsg(''),3000);},onError:(err:any)=>setMsg('❌ '+(err?.response?.data?.message||'Erreur'))});

  const createCourse=useMutation({mutationFn:(data:any)=>{if(!online){saveOffline(data);return Promise.resolve({data:{offline:true}});}return axios.post(`${API}/courses`,data,{headers:{Authorization:`Bearer ${tk()}`}});},onSuccess:(res:any)=>{setMsg(res.data?.offline?'📱 Sauvegardé hors ligne':'✅ Course enregistrée');setKmDepart('');setKmArrivee('');setMontant('');qc.invalidateQueries({queryKey:['dashboard']});},onError:(err:any)=>setMsg('❌ '+(err?.response?.data?.message||'Erreur'))});

  const handleCourse=()=>{if(typeCourse==='NORMALE'){const d=parseFloat(kmArrivee)-parseFloat(kmDepart);if(d<=0){setMsg('⚠️ Km arrivée > Km départ');return;}createCourse.mutate({chauffeurId:c?.id,motoId:m?.id,type:'NORMALE',distance:d});}else{if(!montant){setMsg('⚠️ Entrez un montant');return;}createCourse.mutate({chauffeurId:c?.id,motoId:m?.id,type:typeCourse,prix:parseFloat(montant)});}};

  const distance=kmDepart&&kmArrivee?Math.max(0,parseFloat(kmArrivee)-parseFloat(kmDepart)):0;
  const stats=dash?.aujourdhui||{count:0,prix:0,commission:0,gainNet:0};
  const semaine=dash?.semaine||{count:0,prix:0,commission:0,gainNet:0};
  const mois=dash?.mois||{count:0,prix:0,commission:0,gainNet:0};

  return <div>
    {msg&&<div className={`floating-alert ${msg.includes('✅')||msg.includes('📱')?'success':'warning'}`}>{msg}</div>}
    {dash?.messageStatus&&<div style={{background:'rgba(52,152,219,0.15)',borderLeft:'3px solid #3498db',padding:10,borderRadius:8,marginBottom:12,fontSize:12,color:'#3498db'}}>{dash.messageStatus}</div>}
    <div className="status-buttons">
      <button onClick={()=>pointer.mutate('ARRIVEE')} className="status-btn debut">▶️ Début</button>
      <button onClick={()=>pointer.mutate(c?.statut==='EN_PAUSE'?'REPRISE':'PAUSE')} className="status-btn standby">{c?.statut==='EN_PAUSE'?'▶️ Reprendre':'⏸️ Standby'}</button>
      <button onClick={()=>setShowConfirm(true)} className="status-btn fin">⏹️ Fin</button>
    </div>
    <div className="card"><div className="card-title">📅 Aujourd'hui</div><div className="stats-grid"><div className="stat-item"><div className="stat-value">{stats.count}</div><div className="stat-label">Courses</div></div><div className="stat-item"><div className="stat-value">{stats.prix.toLocaleString()} Ar</div><div className="stat-label">CA</div></div><div className="stat-item"><div className="stat-value">{stats.commission.toLocaleString()} Ar</div><div className="stat-label">Commission</div></div><div className="stat-item"><div className="stat-value" style={{color:stats.gainNet>=0?'#27ae60':'#e74c3c'}}>{stats.gainNet.toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div></div></div>
    <div className="card"><div className="card-title">➕ Nouvelle course</div><div className="form-group"><select value={typeCourse} onChange={e=>setTypeCourse(e.target.value)}><option value="NORMALE">🚖 Course normale</option><option value="ADY_VAROTRA">🛺 Ady Varotra</option><option value="LOCATION_JOURNALIERE">📅 Location journalière</option></select></div>
      {typeCourse==='NORMALE'?<><div style={{display:'flex',gap:6,marginBottom:6}}><input type="number" step="0.1" value={kmDepart} onChange={e=>setKmDepart(e.target.value)} placeholder="Km départ" style={{flex:1,padding:10,background:'#252525',border:'1px solid #333',borderRadius:10,color:'#fff',fontSize:13}}/><input type="number" step="0.1" value={kmArrivee} onChange={e=>setKmArrivee(e.target.value)} placeholder="Km arrivée" style={{flex:1,padding:10,background:'#252525',border:'1px solid #333',borderRadius:10,color:'#fff',fontSize:13}}/></div>{distance>0&&<div style={{background:'#252525',borderRadius:8,padding:8,textAlign:'center',fontSize:12,marginBottom:8}}>📏 {distance.toFixed(1)} km · 💰 {(2000+distance*500).toLocaleString()} Ar</div>}</>:<div className="form-group"><input type="number" value={montant} onChange={e=>setMontant(e.target.value)} placeholder="Montant (Ar)"/></div>}
      <button onClick={handleCourse} disabled={createCourse.isPending} className="btn-primary">{createCourse.isPending?'⏳...':online?'✅ Enregistrer':'📱 Sauvegarder hors ligne'}</button></div>
    <div className="card"><div className="card-title">📆 Cette semaine</div><div className="stats-grid"><div className="stat-item"><div className="stat-value">{semaine.count}</div><div className="stat-label">Courses</div></div><div className="stat-item"><div className="stat-value">{semaine.prix.toLocaleString()} Ar</div><div className="stat-label">CA</div></div><div className="stat-item"><div className="stat-value">{semaine.commission.toLocaleString()} Ar</div><div className="stat-label">Commission</div></div><div className="stat-item"><div className="stat-value" style={{color:semaine.gainNet>=0?'#27ae60':'#e74c3c'}}>{semaine.gainNet.toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div></div></div>
    <div className="card"><div className="card-title">📅 Ce mois</div><div className="stats-grid"><div className="stat-item"><div className="stat-value">{mois.count}</div><div className="stat-label">Courses</div></div><div className="stat-item"><div className="stat-value">{mois.prix.toLocaleString()} Ar</div><div className="stat-label">CA</div></div><div className="stat-item"><div className="stat-value">{mois.commission.toLocaleString()} Ar</div><div className="stat-label">Commission</div></div><div className="stat-item"><div className="stat-value" style={{color:mois.gainNet>=0?'#27ae60':'#e74c3c'}}>{mois.gainNet.toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div></div></div>
    {showConfirm&&<div className="modal-overlay" onClick={()=>setShowConfirm(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}><h3 style={{color:'#DAA520',marginBottom:12}}>🏁 Terminer la journée ?</h3><p style={{color:'#888',fontSize:13,marginBottom:20}}>Vous ne pourrez plus enregistrer de courses aujourd'hui sans l'autorisation de l'administrateur.</p><div style={{display:'flex',gap:8}}><button onClick={()=>setShowConfirm(false)} style={{flex:1,padding:12,background:'#333',border:'none',borderRadius:10,color:'#fff',fontWeight:600,cursor:'pointer'}}>Annuler</button><button onClick={()=>{pointer.mutate('FIN_SERVICE');setShowConfirm(false);}} style={{flex:1,padding:12,background:'#e74c3c',border:'none',borderRadius:10,color:'#fff',fontWeight:600,cursor:'pointer'}}>Confirmer</button></div></div></div>}
  </div>;
}

// ========== COURSES ==========
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
  const versements=Array.isArray(data)?data:[];
  const stats=versements.reduce((acc:any,v:any)=>{acc.totalDu+=v.montantDu||0;acc.totalPaye+=v.montantVerse||0;return acc;},{totalDu:0,totalPaye:0});
  const reste=stats.totalDu-stats.totalPaye;
  const envoyer=()=>{if(!montant)return;axios.post(`${API}/versements`,{chauffeurId:c?.id,montantVerse:parseFloat(montant)},{headers:{Authorization:`Bearer ${tk()}`}}).then(()=>{setMsg('✅ Demande envoyée');setMontant('');qc.invalidateQueries({queryKey:['versements']});}).catch((err:any)=>setMsg('❌ '+(err.response?.data?.message||'Erreur')));};
  return <div>
    {msg&&<div className={`floating-alert ${msg.includes('✅')?'success':'warning'}`}>{msg}</div>}
    <div className="card"><div className="card-title">💰 Versements</div>
      <div className="stats-grid" style={{marginBottom:12}}>
        <div className="stat-item"><div className="stat-value" style={{color:'#DAA520'}}>{stats.totalDu.toLocaleString()} Ar</div><div className="stat-label">Total dû</div></div>
        <div className="stat-item"><div className="stat-value" style={{color:'#27ae60'}}>{stats.totalPaye.toLocaleString()} Ar</div><div className="stat-label">Payé</div></div>
        <div className="stat-item"><div className="stat-value" style={{color:reste>0?'#e74c3c':'#27ae60'}}>{reste.toLocaleString()} Ar</div><div className="stat-label">Reste</div></div>
      </div>
    </div>
    <div className="card"><div style={{display:'flex',gap:8}}><input type="number" value={montant} onChange={e=>setMontant(e.target.value)} placeholder="Montant à verser" style={{flex:1,padding:10,background:'#252525',border:'1px solid #333',borderRadius:10,color:'#fff'}}/><button onClick={envoyer} className="btn-primary" style={{width:'auto'}}>Envoyer</button></div></div>
    <div className="card"><div className="card-title">📋 Historique</div>{versements.map((v:any)=><div key={v.id} style={{background:'#252525',borderRadius:10,padding:10,marginBottom:6,display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'bold'}}>{v.montantVerse?.toLocaleString()} Ar</div><div style={{fontSize:10,color:'#888'}}>{new Date(v.createdAt).toLocaleDateString('fr')}</div></div><span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:v.statut==='VALIDE'?'rgba(39,174,96,0.2)':'rgba(243,156,18,0.2)',color:v.statut==='VALIDE'?'#27ae60':'#f39c12'}}>{v.statut==='VALIDE'?'✅ Validé':'⏳ En attente'}</span></div>)}</div>
  </div>;
}

// ========== STATS ==========
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
function NotificationsPage({onBack}:{onBack:()=>void}){
  const {data}=useQuery({queryKey:['notifications'],queryFn:()=>axios.get(`${API}/notifications`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data).catch(()=>[]),refetchInterval:15000});
  const notifs=Array.isArray(data)?data:[];
  return <div>
    <button className="back-btn" onClick={onBack}>← Retour</button>
    <div className="card"><div className="card-title">🔔 Notifications</div></div>
    {notifs.length===0?<p style={{color:'#888',textAlign:'center',padding:20}}>Aucune notification</p>:notifs.map((n:any)=><div key={n.id} style={{background:'#252525',borderRadius:10,padding:10,marginBottom:8,borderLeft:'3px solid '+(n.lu?'#DAA520':'#e74c3c')}}><div style={{fontWeight:'bold',color:'#DAA520',fontSize:12,marginBottom:4}}>{n.titre}</div><div style={{fontSize:11,color:'#ccc',marginBottom:4}}>{n.message}</div><div style={{fontSize:10,color:'#666'}}>{new Date(n.createdAt).toLocaleString('fr')}</div></div>)}
  </div>;
}

// ========== BOTTOM NAV ==========
function BottomNav({current,onChange}:{current:string;onChange:(p:any)=>void}){
  const tabs=[{key:'accueil',label:'Accueil',icon:'🏠'},{key:'courses',label:'Courses',icon:'📋'},{key:'versements',label:'Versements',icon:'💰'},{key:'stats',label:'Stats',icon:'📊'},{key:'profil',label:'Profil',icon:'👤'}];
  return <nav className="bottom-nav"><div className="nav-items">{tabs.map(t=><button key={t.key} onClick={()=>onChange(t.key)} className={`nav-item ${current===t.key?'active':''}`}><span style={{fontSize:18}}>{t.icon}</span><span>{t.label}</span></button>)}</div></nav>;
}

export default App;
