import { useState, useEffect, useRef } from 'react';
import MessagesPage from './pages/MessagesPage';
import DepensesChauffeurPage from './pages/DepensesChauffeurPage';
import AlertesMotoPage from './pages/AlertesMotoPage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://trans-bygagoos.onrender.com/api/v1';
const tk = () => localStorage.getItem('chauffeur-token') || '';
const chauffeur = () => JSON.parse(localStorage.getItem('chauffeur') || '{}');
const moto = () => JSON.parse(localStorage.getItem('moto') || 'null') || chauffeur()?.moto;

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

export default function App() {
  const queryClient = new QueryClient();
  useEffect(() => { openDB(); }, []);
  return <QueryClientProvider client={queryClient}><AppContent /></QueryClientProvider>;
}

type Page = 'login'|'accueil'|'courses'|'versements'|'stats'|'profil'|'notifications'|'messages'|'depenses'|'alertes';

function AppContent() {
  const [page, setPage] = useState<Page>(tk()?'accueil':'login');
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
      {!online && <div className="offline-indicator">📡 Mode hors ligne</div>}
      <Header onLogout={()=>{localStorage.clear();setPage('login');}} online={online}/>
      <div className="main-content">
        {page==='accueil'&&<DashboardPage online={online}/>}
        {page==='courses'&&<CoursesPage/>}
        {page==='versements'&&<VersementsSimplePage/>}
        {page==='stats'&&<StatsPage/>}
        {page==='profil'&&<ProfilPage onLogout={()=>{localStorage.clear();setPage('login');}}/>}
        {page==='notifications'&&<NotificationsPage onBack={()=>setPage('accueil')}/>}
        {page==='messages'&&<MessagesPage/>}
        {page==='depenses'&&<DepensesChauffeurPage/>}
        {page==='alertes'&&<AlertesMotoPage/>}
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

function LoginPage({onLogin}:{onLogin:()=>void}){
  const [code,setCode]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setError('');if(!code||code.length<3){setError('Code requis');return;}setLoading(true);
    try{const{data}=await axios.post(`${API}/auth/chauffeur/code`,{code:code.toUpperCase()});localStorage.setItem('chauffeur-token',data.accessToken);localStorage.setItem('chauffeur',JSON.stringify(data.chauffeur));if(data.chauffeur?.moto)localStorage.setItem('moto',JSON.stringify(data.chauffeur.moto));onLogin();}catch{setError('Code introuvable');}finally{setLoading(false);}};
  return <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,fontFamily:'system-ui, sans-serif'}}>
    <div className="app-header" style={{position:'fixed',top:0}}><div className="header-content"><div className="header-left"><div className="header-logo"><img src="/assets/logo/b-trans.png" alt="Logo"/></div><div className="header-info"><h1>Trans ByGagoos</h1><p>Application Chauffeur</p></div></div></div></div>
    <div style={{width:'100%',maxWidth:380,marginTop:60}}><div className="card"><div className="card-title">🔑 Connexion</div>{error&&<div style={{color:'#e74c3c',marginBottom:12,fontSize:12,textAlign:'center',background:'rgba(231,76,60,0.1)',padding:8,borderRadius:8}}>{error}</div>}<form onSubmit={submit}><div className="form-group"><input type="text" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="CODE" maxLength={6} autoFocus style={{textAlign:'center',fontSize:26,fontWeight:'bold',letterSpacing:6,color:'#DAA520',border:'2px solid #DAA520'}}/></div><button type="submit" disabled={loading} className="btn-primary">{loading?'Connexion...':'Se connecter'}</button></form></div></div></div>;
}

function Header({onLogout,online}:{onLogout:()=>void,online:boolean}){
  const c=chauffeur(); const m=moto();
  const {data:dash}=useQuery({queryKey:['dashboard',c?.id],queryFn:()=>axios.get(`${API}/chauffeurs/${c?.id}/dashboard`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data),enabled:!!c?.id,refetchInterval:10000});
  const s:any={EN_SERVICE:{class:'presence-present',icon:'🟢',label:'En service'},EN_PAUSE:{class:'presence-pause',icon:'🟠',label:'En pause'},HORS_SERVICE:{class:'presence-absent',icon:'🔴',label:'Hors service'}};
  const st=s[c?.statut]||s.HORS_SERVICE;
  return <div className="app-header"><div className="header-content"><div className="header-left"><div className="header-logo"><img src="/assets/logo/b-trans.png" alt="Logo"/></div><div className="header-info"><h1>{c?.nom||'Chauffeur'}</h1><p><span className={`presence-badge ${st.class}`}>{st.icon} {st.label}</span><span className={`moto-badge ${!m?'sans-moto':''}`}>🏍️ {m?.immatriculation||'Pas de moto'}</span><span>🔑 {c?.codeAcces}</span></p></div></div><div className="header-right"><button className="icon-btn sync" onClick={()=>window.location.reload()}>🔄</button><button className="icon-btn">🔔</button><button className="icon-btn logout" onClick={onLogout}>🚪</button><button className={`icon-btn ${online?'online':'offline'}`}>{online?'📶':'📡'}</button></div></div></div>;
}

function DashboardPage({online}:{online:boolean}){
  const qc=useQueryClient(); const c=chauffeur(); const m=moto();
  const [msg,setMsg]=useState(''); const [showConfirm,setShowConfirm]=useState(false);
  const [typeCourse,setTypeCourse]=useState('NORMALE');
  const [kmDepart,setKmDepart]=useState(''); const [kmArrivee,setKmArrivee]=useState('');
  const [montant,setMontant]=useState('');
  const [kmDebut,setKmDebut]=useState(localStorage.getItem('kmDebut')||'');
  const [kmFinJour,setKmFinJour]=useState('');
  const [distanceJour,setDistanceJour]=useState(0);

  const {data:dash}=useQuery({queryKey:['dashboard',c?.id],queryFn:()=>axios.get(`${API}/chauffeurs/${c?.id}/dashboard`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data),enabled:!!c?.id,refetchInterval:10000});
  const {data:params}=useQuery({queryKey:['parametres'],queryFn:()=>axios.get(`${API}/parametres`).then(r=>r.data).catch(()=>({prix_base:2000,prix_km:500,tarif_location_journalier:15000})),staleTime:300000});
  const {data:typesData}=useQuery({queryKey:['types-autorises'],queryFn:()=>axios.get(`${API}/parametres/types-autorises`).then(r=>r.data?.types||['NORMALE','ADY_VAROTRA','LOCATION_JOURNALIERE']).catch(()=>['NORMALE','ADY_VAROTRA','LOCATION_JOURNALIERE']),staleTime:300000});
  const {data:dep}=useQuery({queryKey:['dep-dash',m?.id],queryFn:()=>axios.get(`${API}/depenses?motoId=${m?.id}`).then(r=>r.data).catch(()=>({items:[]})),enabled:!!m?.id,refetchInterval:30000});
  const typesAutorises=typesData||['NORMALE','ADY_VAROTRA','LOCATION_JOURNALIERE'];
  const enService=c?.statut==='EN_SERVICE';
  useEffect(()=>{if(typesAutorises.length===1)setTypeCourse(typesAutorises[0]);else if(!typesAutorises.includes(typeCourse))setTypeCourse(typesAutorises[0]);},[typesAutorises]);

  const pointer=useMutation({mutationFn:(type:string)=>axios.post(`${API}/pointages`,{chauffeurId:c?.id,type,kmDebut:kmDebut||undefined,kmFin:kmFinJour||undefined},{headers:{Authorization:`Bearer ${tk()}`}}),onSuccess:(_,type)=>{const cd=JSON.parse(localStorage.getItem('chauffeur')||'{}');cd.statut=type==='ARRIVEE'||type==='REPRISE'?'EN_SERVICE':type==='PAUSE'?'EN_PAUSE':'HORS_SERVICE';localStorage.setItem('chauffeur',JSON.stringify(cd));setMsg(type==='ARRIVEE'?'✅ Service débuté !':type==='PAUSE'?'⏸️ Pause':type==='REPRISE'?'🔄 Reprise':`🏁 Service terminé - ${distanceJour.toFixed(1)} km parcourus`);qc.invalidateQueries({queryKey:['dashboard']});setTimeout(()=>{setMsg('');window.location.reload();},2000);},onError:(err:any)=>setMsg('❌ '+(err?.response?.data?.message||'Erreur'))});

  const createCourse=useMutation({mutationFn:(data:any)=>{if(!online){saveOffline(data);return Promise.resolve({data:{offline:true}});}return axios.post(`${API}/courses`,data,{headers:{Authorization:`Bearer ${tk()}`}});},onSuccess:(res:any)=>{setMsg(res.data?.offline?'📱 Sauvegardé hors ligne':'✅ Course enregistrée');setKmDepart('');setKmArrivee('');setMontant('');qc.invalidateQueries({queryKey:['dashboard']});setTimeout(()=>window.location.reload(),1500);},onError:(err:any)=>setMsg('❌ '+(err?.response?.data?.message||'Erreur'))});

  const handleCourse=()=>{
    if(!enService){setMsg('❌ Vous devez être EN SERVICE');return;}
    if(typeCourse==='LOCATION_JOURNALIERE'){createCourse.mutate({chauffeurId:c?.id,motoId:m?.id,type:'LOCATION_JOURNALIERE',prix:params?.tarif_location_journalier||15000});}
    else if(typeCourse==='NORMALE'){const d=parseFloat(kmArrivee)-parseFloat(kmDepart);if(d<=0){setMsg('⚠️ Km arrivée > Km départ');return;}createCourse.mutate({chauffeurId:c?.id,motoId:m?.id,type:'NORMALE',distance:d});}
    else{if(!montant){setMsg('⚠️ Entrez un montant');return;}createCourse.mutate({chauffeurId:c?.id,motoId:m?.id,type:typeCourse,prix:parseFloat(montant)});}
  };

  const typeLabels:Record<string,string>={'NORMALE':'🚖 Course normale','ADY_VAROTRA':'🛺 Ady Varotra','LOCATION_JOURNALIERE':'📅 Location journalière'};
  const distance=kmDepart&&kmArrivee?Math.max(0,parseFloat(kmArrivee)-parseFloat(kmDepart)):0;
  const stats={count:0,prix:0,commission:0,gainNet:0,...(dash?.aujourdhui??{})};
  const semaine={count:0,prix:0,commission:0,gainNet:0,...(dash?.semaine??{})};
  const mois={count:0,prix:0,commission:0,gainNet:0,...(dash?.mois??{})};

  return <div>
    {msg&&<div className={`floating-alert ${msg.includes('✅')||msg.includes('📱')?'success':'warning'}`}>{msg}</div>}
    {dash?.messageStatus&&<div style={{background:'rgba(52,152,219,0.15)',borderLeft:'3px solid #3498db',padding:10,borderRadius:8,marginBottom:12,fontSize:12,color:'#3498db'}}>{dash.messageStatus}</div>}
    <div className="status-buttons">
      <button onClick={()=>{
        const horsService = !c?.statut || c.statut==='HORS_SERVICE';
        if(horsService){
          const km=prompt('🏍️ KM au compteur au départ:');
          if(km){setKmDebut(km);pointer.mutate('ARRIVEE');}
        }else{pointer.mutate('ARRIVEE');}
      }} className="status-btn debut">▶️ Début</button>
      <button onClick={()=>pointer.mutate(c?.statut==='EN_PAUSE'?'REPRISE':'PAUSE')} className="status-btn standby">{c?.statut==='EN_PAUSE'?'▶️ Reprendre':'⏸️ Standby'}</button>
      <button onClick={()=>setShowConfirm(true)} className="status-btn fin">⏹️ Fin</button>
    </div>
    {kmDebut && <div style={{background:'#252525',borderRadius:8,padding:8,textAlign:'center',fontSize:12,marginBottom:8}}>🏍️ KM départ: <strong style={{color:'#DAA520'}}>{kmDebut}</strong></div>}
    <div className="card"><div className="card-title">📅 Aujourd'hui</div><div className="stats-grid"><div className="stat-item"><div className="stat-value">{stats.count}</div><div className="stat-label">Courses</div></div><div className="stat-item"><div className="stat-value">{(stats.prix||0).toLocaleString()} Ar</div><div className="stat-label">CA</div></div><div className="stat-item"><div className="stat-value">{(stats.commission||0).toLocaleString()} Ar</div><div className="stat-label">Commission</div></div><div className="stat-item"><div className="stat-value" style={{color:(stats.gainNet||0)>=0?'#27ae60':'#e74c3c'}}>{(stats.gainNet||0).toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div></div></div>
    <DepensesResume dep={dep} m={m} stats={stats} />
    <div className="card">
      <div className="card-title">➕ Nouvelle course</div>
      {!enService&&<div style={{background:'rgba(239,68,68,0.1)',borderLeft:'3px solid #ef4444',padding:10,borderRadius:8,marginBottom:12,fontSize:12,color:'#ef4444'}}>🔒 Vous devez être EN SERVICE pour enregistrer une course.</div>}
      <div className="form-group"><select value={typeCourse} onChange={e=>setTypeCourse(e.target.value)} disabled={!enService} style={{width:'100%',padding:10,background:'#252525',border:'1px solid #333',borderRadius:10,color:'#fff',fontSize:13,opacity:enService?1:0.5}}>{typesAutorises.map((t:string)=>(<option key={t} value={t}>{typeLabels[t]||t}</option>))}</select></div>
      {typeCourse==='NORMALE'&&<div><div style={{display:'flex',gap:6,marginBottom:6}}><input type="number" step="0.1" value={kmDepart} onChange={e=>setKmDepart(e.target.value)} placeholder="Km départ" disabled={!enService} style={{flex:1,padding:10,background:'#252525',border:'1px solid #333',borderRadius:10,color:'#fff',fontSize:13}}/><input type="number" step="0.1" value={kmArrivee} onChange={e=>setKmArrivee(e.target.value)} placeholder="Km arrivée" disabled={!enService} style={{flex:1,padding:10,background:'#252525',border:'1px solid #333',borderRadius:10,color:'#fff',fontSize:13}}/></div>{distance>0&&<div style={{background:'#252525',borderRadius:8,padding:8,textAlign:'center',fontSize:12,marginBottom:8}}>📏 {distance.toFixed(1)} km · 💰 {((params?.prix_base||2000)+distance*(params?.prix_km||500)).toLocaleString()} Ar</div>}</div>}
      {typeCourse==='LOCATION_JOURNALIERE'&&<div style={{background:'#1a2a1a',borderRadius:10,padding:15,textAlign:'center',marginBottom:8,border:'1px solid #2ecc71'}}><div style={{fontSize:11,color:'#888'}}>📅 Tarif location journalière</div><div style={{fontSize:24,fontWeight:'bold',color:'#2ecc71'}}>{(params?.tarif_location_journalier||15000).toLocaleString()} Ar</div></div>}
      {typeCourse==='ADY_VAROTRA'&&<div className="form-group"><input type="number" value={montant} onChange={e=>setMontant(e.target.value)} placeholder="Montant (Ar)" disabled={!enService}/></div>}
      <button onClick={handleCourse} disabled={!enService||createCourse.isPending} className="btn-primary" style={{opacity:enService?1:0.5}}>{createCourse.isPending?'⏳...':online?'✅ Enregistrer':'📱 Sauvegarder hors ligne'}</button>
      {enService&&<div style={{marginTop:10,display:'flex',gap:6,flexWrap:'wrap'}}>
        <button onClick={()=>{const mt=prompt('⛽ Montant carburant (Ar):');if(mt&&parseFloat(mt)>0){const l=prompt('Litres (optionnel):');const st=prompt('Station (optionnelle):');axios.post(`${API}/depenses`,{description:'Carburant',montant:parseFloat(mt),categorie:'CARBURANT',motoId:m?.id,litres:l?parseFloat(l):undefined,station:st||undefined},{headers:{Authorization:`Bearer ${tk()}`}}).then(()=>{alert('✅ Carburant déclaré !');qc.invalidateQueries({queryKey:['dep-dash']});}).catch(()=>alert('❌ Erreur'));}}} style={{padding:'8px 12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:20,color:'#f87171',fontSize:11,cursor:'pointer'}}>⛽ Carburant</button>
        <button onClick={()=>{const mt=prompt('🛞 Montant pneu (Ar):');if(mt&&parseFloat(mt)>0){axios.post(`${API}/depenses`,{description:'Pneu',montant:parseFloat(mt),categorie:'PNEU',motoId:m?.id},{headers:{Authorization:`Bearer ${tk()}`}}).then(()=>{alert('✅ Pneu déclaré !');qc.invalidateQueries({queryKey:['dep-dash']});}).catch(()=>alert('❌ Erreur'));}}} style={{padding:'8px 12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:20,color:'#f87171',fontSize:11,cursor:'pointer'}}>🛞 Pneu</button>
        <button onClick={()=>{const mt=prompt('🔨 Montant réparation (Ar):');if(mt&&parseFloat(mt)>0){const desc=prompt('Description:');axios.post(`${API}/depenses`,{description:desc||'Réparation',montant:parseFloat(mt),categorie:'REPARATION',motoId:m?.id},{headers:{Authorization:`Bearer ${tk()}`}}).then(()=>{alert('✅ Réparation déclarée !');qc.invalidateQueries({queryKey:['dep-dash']});}).catch(()=>alert('❌ Erreur'));}}} style={{padding:'8px 12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:20,color:'#f87171',fontSize:11,cursor:'pointer'}}>🔨 Réparation</button>
      </div>}
    </div>
    <div className="card"><div className="card-title">📆 Cette semaine</div><div className="stats-grid"><div className="stat-item"><div className="stat-value">{semaine.count}</div><div className="stat-label">Courses</div></div><div className="stat-item"><div className="stat-value">{(semaine.prix||0).toLocaleString()} Ar</div><div className="stat-label">CA</div></div><div className="stat-item"><div className="stat-value">{(semaine.commission||0).toLocaleString()} Ar</div><div className="stat-label">Commission</div></div><div className="stat-item"><div className="stat-value" style={{color:(semaine.gainNet||0)>=0?'#27ae60':'#e74c3c'}}>{(semaine.gainNet||0).toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div></div></div>
    <div className="card"><div className="card-title">📅 Ce mois</div><div className="stats-grid"><div className="stat-item"><div className="stat-value">{mois.count}</div><div className="stat-label">Courses</div></div><div className="stat-item"><div className="stat-value">{(mois.prix||0).toLocaleString()} Ar</div><div className="stat-label">CA</div></div><div className="stat-item"><div className="stat-value">{(mois.commission||0).toLocaleString()} Ar</div><div className="stat-label">Commission</div></div><div className="stat-item"><div className="stat-value" style={{color:(mois.gainNet||0)>=0?'#27ae60':'#e74c3c'}}>{(mois.gainNet||0).toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div></div></div>
    {showConfirm&&<FinJourModal kmDebut={kmDebut} distanceJour={distanceJour} setDistanceJour={setDistanceJour} setShowConfirm={setShowConfirm} pointer={pointer} />}
  </div>;
}

function FinJourModal({kmDebut,distanceJour,setDistanceJour,setShowConfirm,pointer}:any){
  const [kmFin,setKmFin]=useState('');
  const handleKmChange=(val:string)=>{
    setKmFin(val);
    if(kmDebut&&val){
      const d=parseFloat(val)-parseFloat(kmDebut);
      setDistanceJour(d>0?d:0);
    }else{setDistanceJour(0);}
  };
  const confirmer=()=>{
    pointer.mutate('FIN_SERVICE');
    setShowConfirm(false);
  };
  return <div className="modal-overlay" onClick={()=>setShowConfirm(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}>
    <h3 style={{color:'#DAA520',marginBottom:12}}>🏁 Terminer la journée ?</h3>
    <div className="form-group"><input type="number" value={kmFin} onChange={e=>handleKmChange(e.target.value)} placeholder="🏍️ KM au compteur (arrivée)" style={{width:'100%',padding:10,background:'#252525',border:'1px solid #333',borderRadius:10,color:'#fff',fontSize:14}}/></div>
    {distanceJour>0&&<div style={{textAlign:'center',padding:10,background:'#1a2a1a',borderRadius:10,marginBottom:8}}>📏 Distance totale : <strong style={{color:'#2ecc71'}}>{distanceJour.toFixed(1)} km</strong></div>}
    {kmDebut&&<div style={{textAlign:'center',padding:8,fontSize:11,color:'#888'}}>KM départ: {kmDebut} → KM arrivée: {kmFin||'?'}</div>}
    <p style={{color:'#888',fontSize:13,marginBottom:20}}>Vous ne pourrez plus enregistrer de courses aujourd'hui.</p>
    <div style={{display:'flex',gap:8}}><button onClick={()=>{setShowConfirm(false);setKmFin('');setDistanceJour(0);}} style={{flex:1,padding:12,background:'#333',border:'none',borderRadius:10,color:'#fff',fontWeight:600,cursor:'pointer'}}>Annuler</button><button onClick={confirmer} style={{flex:1,padding:12,background:'#e74c3c',border:'none',borderRadius:10,color:'#fff',fontWeight:600,cursor:'pointer'}}>Confirmer</button></div>
  </div></div>;
}

function DepensesResume({dep,m,stats}:{dep:any,m:any,stats:any}){
  if(!m)return null;
  const now=new Date();const debutJour=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const items=dep?.items||[];
  const depJour=items.filter((d:any)=>new Date(d.date)>=debutJour).reduce((s:number,d:any)=>s+d.montant,0);
  const gainNet=stats?.gainNet||0;
  const isDepSup=depJour>gainNet;
  const catLabels:Record<string,string>={CARBURANT:'⛽ Carburant',PNEU:'🛞 Pneu',REPARATION:'🔨 Réparation',AUTRE:'📝 Autre'};
  const byCat:Record<string,number>={};
  items.forEach((d:any)=>{byCat[d.categorie]=(byCat[d.categorie]||0)+d.montant});
  return <div className="card" style={{borderLeft:'4px solid '+(isDepSup?'#ef4444':'#f59e0b')}}>
    <div className="card-title" style={{color:isDepSup?'#ef4444':'#f59e0b'}}>💸 Mes dépenses du jour</div>
    {depJour>0?<div style={{textAlign:'center',marginBottom:10}}><span style={{fontSize:28,fontWeight:800,color:isDepSup?'#ef4444':'#f59e0b'}}>-{depJour.toLocaleString()} Ar</span>{isDepSup&&<div style={{fontSize:10,color:'#ef4444',marginTop:2}}>⚠️ Dépenses supérieures au gain</div>}</div>:<p style={{color:'#888',textAlign:'center',fontSize:12,marginBottom:10}}>Aucune dépense aujourd'hui</p>}
    {Object.keys(byCat).length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:4}}>{Object.entries(byCat).map(([cat,montant])=><span key={cat} style={{padding:'3px 8px',background:isDepSup?'rgba(239,68,68,0.1)':'rgba(245,158,11,0.1)',borderRadius:20,fontSize:10,color:isDepSup?'#f87171':'#f59e0b'}}>{catLabels[cat]||cat}: {montant.toLocaleString()} Ar</span>)}</div>}
  </div>;
}

function CoursesPage(){
  const c=chauffeur();
  const {data}=useQuery({queryKey:['courses',c?.id],queryFn:()=>axios.get(`${API}/courses`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data).catch(()=>[]),enabled:!!c?.id});
  const courses=Array.isArray(data)?data:[];
  return <div><div className="card"><div className="card-title">📋 Mes courses</div></div>{courses.length===0?<p style={{color:'#888',textAlign:'center',padding:20}}>Aucune course</p>:courses.slice(0,100).map((course:any)=><div key={course.id} className="course-item"><div><div style={{fontWeight:'bold',color:'#DAA520',fontSize:12}}>{course.type}</div><div className="course-date">{new Date(course.createdAt).toLocaleString('fr')}</div></div><div className="course-price">{course.prix?.toLocaleString()} Ar</div></div>)}</div>;
}

function VersementsSimplePage(){
  const c=chauffeur(); const [montant,setMontant]=useState(''); const [msg,setMsg]=useState('');
  const qc=useQueryClient();
  const {data}=useQuery({queryKey:['versements',c?.id],queryFn:()=>axios.get(`${API}/versements/chauffeur/${c?.id}`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data),enabled:!!c?.id});
  const versements=data?.versements||[];
  const envoyer=()=>{if(!montant)return;axios.post(`${API}/versements`,{chauffeurId:c?.id,montantVerse:parseFloat(montant)},{headers:{Authorization:`Bearer ${tk()}`}}).then(()=>{setMsg('✅ Demande envoyée');setMontant('');qc.invalidateQueries({queryKey:['versements']});}).catch((err:any)=>setMsg('❌ '+(err.response?.data?.message||'Erreur')));};
  return <div>{msg&&<div className={`floating-alert ${msg.includes('✅')?'success':'warning'}`}>{msg}</div>}<h1 style={{color:'#DAA520',fontSize:18,fontWeight:700,marginBottom:12}}>💰 Versements</h1><p style={{fontSize:12,color:'#94a3b8',marginBottom:12}}>Solde : <strong style={{color:'#fff'}}>{c?.solde?.toLocaleString()||0} Ar</strong></p><div className="card"><div style={{display:'flex',gap:8}}><input type="number" value={montant} onChange={e=>setMontant(e.target.value)} placeholder="Montant à verser" style={{flex:1,padding:10,background:'#252525',border:'1px solid #333',borderRadius:10,color:'#fff',fontSize:14,outline:'none'}}/><button onClick={envoyer} disabled={!montant} style={{padding:'12px 20px',background:'#DAA520',color:'#000',border:'none',borderRadius:10,fontWeight:600,cursor:'pointer',opacity:!montant?0.5:1}}>Envoyer</button></div></div><div className="card"><div className="card-title">📋 Historique</div>{versements.map((v:any)=><div key={v.id} style={{background:'#252525',borderRadius:10,padding:10,marginBottom:6,display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'bold'}}>{v.montantVerse?.toLocaleString()||0} Ar</div><div style={{fontSize:10,color:'#888'}}>{new Date(v.createdAt).toLocaleDateString('fr')}</div></div><span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:v.statut==='VALIDE'?'rgba(39,174,96,0.2)':'rgba(243,156,18,0.2)',color:v.statut==='VALIDE'?'#27ae60':'#f39c12'}}>{v.statut==='VALIDE'?'✅ Validé':'⏳ En attente'}</span></div>)}{versements.length===0&&<p style={{color:'#888',textAlign:'center',padding:20}}>Aucun versement</p>}</div></div>;
}

function StatsPage(){
  const c=chauffeur();const m=moto();
  const {data:dash}=useQuery({queryKey:["dashboard",c?.id],queryFn:()=>axios.get(`${API}/chauffeurs/${c?.id}/dashboard`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data),enabled:!!c?.id});
  const {data:dep}=useQuery({queryKey:["depenses-stats",m?.id],queryFn:()=>axios.get(`${API}/depenses?motoId=${m?.id}`).then(r=>r.data).catch(()=>({items:[]})),enabled:!!m?.id});
  const s=(p:string)=>({count:0,prix:0,commission:0,gainNet:0,...(dash?.[p]??{})});
  const items=dep?.items||[];
  const now=new Date();const debutJour=new Date(now.getFullYear(),now.getMonth(),now.getDate());const debutSemaine=new Date(now);debutSemaine.setDate(now.getDate()-(now.getDay()===0?6:now.getDay()-1));debutSemaine.setHours(0,0,0,0);const debutMois=new Date(now.getFullYear(),now.getMonth(),1);
  const dp=(depuis:Date)=>items.filter((d:any)=>new Date(d.date)>=depuis).reduce((s:number,d:any)=>s+d.montant,0);
  const periodes=[{k:"aujourdhui",t:"📅 Aujourdhui",dep:dp(debutJour)},{k:"semaine",t:"📆 Cette semaine",dep:dp(debutSemaine)},{k:"mois",t:"🗓️ Ce mois",dep:dp(debutMois)}];
  return <div>{periodes.map(p=><div className="card" key={p.k}><div className="card-title">{p.t}</div><div className="stats-grid"><div className="stat-item"><div className="stat-value">{s(p.k).count}</div><div className="stat-label">Courses</div></div><div className="stat-item"><div className="stat-value" style={{color:"#10b981"}}>{(s(p.k).prix||0).toLocaleString()} Ar</div><div className="stat-label">CA brut</div></div><div className="stat-item"><div className="stat-value" style={{color:"#ef4444"}}>-{p.dep.toLocaleString()} Ar</div><div className="stat-label">Dépenses</div></div><div className="stat-item"><div className="stat-value" style={{color:"#f59e0b"}}>-{(s(p.k).commission||0).toLocaleString()} Ar</div><div className="stat-label">Commission</div></div></div><div style={{marginTop:10,padding:10,background:"#252525",borderRadius:10,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#888"}}>Gain net</span><span style={{fontSize:18,fontWeight:800,color:(s(p.k).gainNet||0)-p.dep>=0?"#10b981":"#ef4444"}}>{((s(p.k).gainNet||0)-p.dep).toLocaleString()} Ar</span></div></div>)}<div className="card" style={{background:"linear-gradient(135deg, #1a1a1a, #DAA52022)",border:"1px solid #DAA520",textAlign:"center",padding:20}}><div style={{fontSize:11,color:"#DAA520",letterSpacing:2}}>SOLDE ACTUEL</div><div style={{fontSize:30,fontWeight:800,color:"#DAA520"}}>{(dash?.solde||c?.solde||0).toLocaleString()} Ar</div></div></div>;
}

function ProfilPage({onLogout}:{onLogout:()=>void}){
  const c=chauffeur(); const m=moto();
  return <div><div className="card"><div className="card-title">👤 Mon profil</div><div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}><div style={{width:60,height:60,borderRadius:'50%',background:'#DAA520',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:'bold',color:'#000'}}>{c?.nom?.charAt(0)||'?'}</div><div><div style={{fontSize:18,fontWeight:700}}>{c?.nom}</div><div style={{fontSize:12,color:'#888'}}>{c?.codeAcces}</div></div></div><div style={{borderTop:'1px solid #333',paddingTop:12}}><div className="profil-item"><span style={{color:'#888'}}>📱 Téléphone</span><span>{c?.telephone||'-'}</span></div><div className="profil-item"><span style={{color:'#888'}}>🏍️ Moto</span><span>{m?.immatriculation||'Aucune'}</span></div><div className="profil-item"><span style={{color:'#888'}}>📊 Statut</span><span>{c?.statut||'HORS_SERVICE'}</span></div><div className="profil-item"><span style={{color:'#888'}}>💰 Solde</span><span style={{color:'#DAA520',fontWeight:700}}>{c?.solde?.toLocaleString()||0} Ar</span></div></div></div><button onClick={onLogout} style={{width:'100%',padding:14,background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:12,color:'#f87171',fontWeight:600,fontSize:14,cursor:'pointer',marginTop:10}}>🚪 Déconnexion</button></div>;
}

function NotificationsPage({onBack}:{onBack:()=>void}){
  const {data}=useQuery({queryKey:['notifications'],queryFn:()=>axios.get(`${API}/notifications`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data).catch(()=>[]),refetchInterval:15000});
  const notifs=Array.isArray(data)?data:[];
  return <div><button className="back-btn" onClick={onBack}>← Retour</button><div className="card"><div className="card-title">🔔 Notifications</div></div>{notifs.length===0?<p style={{color:'#888',textAlign:'center',padding:20}}>Aucune notification</p>:notifs.map((n:any)=><div key={n.id} style={{background:'#252525',borderRadius:10,padding:10,marginBottom:8,borderLeft:'3px solid '+(n.lu?'#DAA520':'#e74c3c')}}><div style={{fontWeight:'bold',color:'#DAA520',fontSize:12,marginBottom:4}}>{n.titre}</div><div style={{fontSize:11,color:'#ccc',marginBottom:4}}>{n.message}</div><div style={{fontSize:10,color:'#666'}}>{new Date(n.createdAt).toLocaleString('fr')}</div></div>)}</div>;
}

function BottomNav({current,onChange}:{current:string;onChange:(p:any)=>void}){
  const tabs=[{key:'accueil',label:'Accueil',icon:'🏠'},{key:'courses',label:'Courses',icon:'📋'},{key:'depenses',label:'Dépenses',icon:'🔧'},{key:'versements',label:'Versements',icon:'💰'},{key:'messages',label:'Chat',icon:'💬'},{key:'alertes',label:'Moto',icon:'⚠️'},{key:'stats',label:'Stats',icon:'📊'},{key:'profil',label:'Profil',icon:'👤'}];
  return <nav className="bottom-nav"><div className="nav-items" style={{overflowX:'auto',justifyContent:'flex-start',gap:2,padding:'0 4px'}}>{tabs.map(t=><button key={t.key} onClick={()=>onChange(t.key)} className={`nav-item ${current===t.key?'active':''}`} style={{minWidth:50,flex:'0 0 auto'}}><span style={{fontSize:16}}>{t.icon}</span><span style={{fontSize:9}}>{t.label}</span></button>)}</div></nav>;
}
