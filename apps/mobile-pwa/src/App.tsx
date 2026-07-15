/* eslint-disable */
import { useState, useEffect } from 'react';
import { LogOut, Home, ClipboardList, DollarSign, BarChart3, User, Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import FinancesPage from './pages/FinancesPage';

const API = 'https://trans-bygagoos-api.onrender.com/api';
const tk = () => localStorage.getItem('chauffeur-token') || '';
const chauffeur = () => JSON.parse(localStorage.getItem('chauffeur') || '{}');
const moto = () => JSON.parse(localStorage.getItem('moto') || 'null') || chauffeur()?.moto;

export default function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}><AppContent /></QueryClientProvider>;
}

type Page = 'login'|'accueil'|'courses'|'versements'|'stats'|'profil'|'notifications';

function AppContent() {
  const [page, setPage] = useState<Page>(tk()?'accueil':'login');
  const [showNotif, setShowNotif] = useState(false);

  if (page==='login') return <LoginPage onLogin={()=>setPage('accueil')}/>;

  return (
    <>
      <Header onLogout={()=>{localStorage.clear();setPage("login");}} onNotifications={()=>setShowNotif(!showNotif)} showNotif={showNotif} setShowNotif={setShowNotif}/>
      <div className="main-content">
        {page!=='accueil' && <div className="page-title">{{
          courses:'📋 Mes courses',
          stats:'📊 Statistiques',
          versements:'💰 Versements',
          profil:'👤 Mon profil'
        }[page]}</div>}
        {page==='accueil'&&<DashboardPage />}
        {page==='courses'&&<CoursesPage />}
        {page==='versements'&&<FinancesPage />}
        {page==='stats'&&<StatsPage />}
        {page==='profil'&&<ProfilPage onLogout={()=>{localStorage.clear();setPage('login');}}/>}
        {page==='notifications'&&<NotificationsPage onBack={()=>setPage('accueil')}/>}
      </div>
      {showNotif && <NotificationsPopup onClose={()=>setShowNotif(false)} onViewAll={()=>{setShowNotif(false);setPage('notifications');}} />}
      <BottomNav current={page} onChange={setPage}/>
    </>
  );
}

// ==================== LOGIN ====================
function LoginPage({onLogin}:{onLogin:()=>void}){
  const [code,setCode]=useState(''); const [pin,setPin]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  const [coopId,setFlotteId]=useState(localStorage.getItem('coopId')||'');
  const [flottes,setFlottes]=useState<any[]>([]);
  
  useEffect(()=>{
    axios.get(API + '/coops').then(r=>{
      if(Array.isArray(r.data)){setFlottes(r.data);if(r.data.length===1)setFlotteId(r.data[0].id);}
      else if(r.data?.items){setFlottes(r.data.items);if(r.data.items.length===1)setFlotteId(r.data.items[0].id);}
    }).catch(()=>{});
  },[]);

  const submit=async(e:React.FormEvent)=>{e.preventDefault();setError("");if(!code||code.length<3){setError("Code requis");return;}
    setLoading(true);
    try{
      const payload:any={codeAcces:code.toUpperCase(),pin};if(coopId)payload.coopId=coopId;
      const{data}=await axios.post(API+'/auth/chauffeur/login',payload);
      localStorage.setItem('chauffeur-token',data.accessToken);localStorage.setItem('chauffeur',JSON.stringify(data.chauffeur));
      if(data.chauffeur?.moto)localStorage.setItem('moto',JSON.stringify(data.chauffeur.moto));
      if(coopId)localStorage.setItem('coopId',coopId);onLogin();
    }catch{setError('Code introuvable ou flotte incorrecte');}finally{setLoading(false);}
  };

  const selectedFlotte=flottes.find((f:any)=>f.id===coopId);
  return <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,fontFamily:'system-ui, sans-serif'}}>
    <div className='app-header' style={{position:'fixed',top:0}}><div className='header-content'><div className='header-left'><div className='header-logo'><img src='/assets/logo/b-trans.png' alt='Logo'/></div><div className='header-info'><h1>{selectedFlotte?.nom||'Trans ByGagoos'}</h1><p>Application Chauffeur</p></div></div></div></div>
    <div style={{width:'100%',maxWidth:380,marginTop:60}}><div className='card'><div className='card-title'>🔑 Connexion</div>
    {error&&<div style={{color:'#e74c3c',marginBottom:12,fontSize:12,textAlign:'center',background:'rgba(231,76,60,0.1)',padding:8,borderRadius:8}}>{error}</div>}
    <form onSubmit={submit}>
    <div className='form-group'><select value={coopId} onChange={e=>setFlotteId(e.target.value)} style={{width:'100%',padding:10,background:'#252525',border:'1px solid #333',borderRadius:10,color:'#fff',fontSize:13,marginBottom:10}}><option value=''>🏢 Choisir une flotte</option>{flottes.map((f:any)=><option key={f.id} value={f.id}>🏢 {f.nom}</option>)}</select></div>
    <div className='form-group'><input type='text' value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder='CODE' maxLength={6} autoFocus style={{textAlign:'center',fontSize:26,fontWeight:'bold',letterSpacing:6,color:'#DAA520',border:'2px solid #DAA520'}}/></div>
    <div className='form-group'><input type='password' value={pin} onChange={e=>setPin(e.target.value)} placeholder='PIN' maxLength={4} style={{textAlign:'center',fontSize:20,fontWeight:'bold',letterSpacing:4,color:'#DAA520',border:'2px solid #DAA520',width:'100%',padding:10,background:'#252525',borderRadius:10}}/></div>
    <button type='submit' disabled={loading} className='btn-primary'>{loading?'Connexion...':'Se connecter'}</button>
    </form></div></div></div>;
}

// ==================== HEADER ====================
function Header({onLogout,onNotifications,showNotif,setShowNotif}:{onLogout:()=>void,onNotifications:()=>void,showNotif:boolean,setShowNotif:(v:boolean)=>void}){
  const c=chauffeur(); const m=moto();
  const {data:notifs} = useQuery({queryKey:['notifications-count'],queryFn:()=>axios.get(`${API}/notifications`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data).catch(()=>[]),refetchInterval:15000});
  const nonLues = Array.isArray(notifs) ? notifs.filter((n:any)=>!n.lu).length : 0;
  const s:any={EN_SERVICE:{class:'presence-present',icon:'🟢',label:'En service'},EN_PAUSE:{class:'presence-pause',icon:'🟠',label:'En pause'},HORS_SERVICE:{class:'presence-absent',icon:'🔴',label:'Hors service'}};
  const st=s[c?.statut]||s.HORS_SERVICE;
  return <div className="app-header"><div className="header-content"><div className="header-left"><div className="header-logo"><img src="/assets/logo/b-trans.png" alt="Logo"/></div><div className="header-info"><h1>{c?.nom||'Chauffeur'}</h1><p><span className={`presence-badge ${st.class}`}>{st.icon} {st.label}</span><span className={`moto-badge ${!m?'sans-moto':''}`}>🏍️ {m?.immatriculation||'Pas de moto'}</span></p></div></div><div className="header-right"><button className="icon-btn" onClick={onNotifications} style={{position:'relative'}}><Bell size={18} />{nonLues>0&&<span className="notif-badge">{nonLues}</span>}</button><button className="icon-btn logout" onClick={onLogout}><LogOut size={18} /></button></div></div></div>;
}

// ==================== DASHBOARD ====================
function DashboardPage(){
  const qc=useQueryClient(); const c=chauffeur(); const m=moto();
  const [msg,setMsg]=useState(''); const [showConfirm,setShowConfirm]=useState(false);
  const [typeCourse,setTypeCourse]=useState('NORMALE');
  const [kmDepart,setKmDepart]=useState(''); const [kmArrivee,setKmArrivee]=useState('');
  const [montant,setMontant]=useState('');
  const [kmDebut,setKmDebut]=useState(localStorage.getItem('kmDebut')||'');
  const [distanceJour,setDistanceJour]=useState(0);

  const {data:params}=useQuery({queryKey:['parametres'],queryFn:()=>axios.get(`${API}/parametres`).then(r=>r.data).catch(()=>({prix_base:2000,prix_km:500,tarif_location_journalier:15000})),staleTime:300000});
  const {data:dash}=useQuery({queryKey:["dashboard",c?.id],queryFn:()=>axios.get(`${API}/chauffeurs/${c?.id}/dashboard`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data),enabled:!!c?.id,refetchInterval:10000});
  const enService=c?.statut==='EN_SERVICE';

  const pointer=useMutation({mutationFn:(type:string)=>axios.post(`${API}/pointages`,{chauffeurId:c?.id,type,kmDebut:kmDebut||undefined},{headers:{Authorization:`Bearer ${tk()}`}}),onSuccess:(_,type)=>{const cd=JSON.parse(localStorage.getItem('chauffeur')||'{}');cd.statut=type==='ARRIVEE'||type==='REPRISE'?'EN_SERVICE':type==='PAUSE'?'EN_PAUSE':'HORS_SERVICE';localStorage.setItem('chauffeur',JSON.stringify(cd));setMsg(type==='ARRIVEE'?'✅ Service débuté !':type==='PAUSE'?'⏸️ Pause':type==='REPRISE'?'🔄 Reprise':`🏁 Service terminé - ${distanceJour.toFixed(1)} km parcourus`);qc.invalidateQueries({queryKey:['dashboard']});setTimeout(()=>setMsg(''),2000);}});

  const createCourse=useMutation({mutationFn:(data:any)=>axios.post(`${API}/courses`,data,{headers:{Authorization:`Bearer ${tk()}`}}),onSuccess:()=>{setMsg('✅ Course enregistrée');setKmDepart('');setKmArrivee('');setMontant('');qc.invalidateQueries({queryKey:['dashboard']});setTimeout(()=>setMsg(''),1500);},onError:(err:any)=>setMsg('❌ '+(err?.response?.data?.message||'Erreur'))});

  const handleCourse=()=>{
    if(!enService){setMsg('❌ Vous devez être EN SERVICE');return;}
    if(typeCourse==='LOCATION_JOURNALIERE'){createCourse.mutate({chauffeurId:c?.id,motoId:m?.id,type:'LOCATION_JOURNALIERE',prix:params?.tarif_location_journalier||15000});}
    else if(typeCourse==='TOUR'){const nbPassagers=prompt('👥 Nombre de passagers:');if(!nbPassagers||parseInt(nbPassagers)<=0){setMsg('⚠️ Entrez le nombre de passagers');return;}const tarifPassager=prompt('💵 Tarif par passager (Ar):');if(!tarifPassager||parseInt(tarifPassager)<=0){setMsg('⚠️ Entrez le tarif');return;}createCourse.mutate({chauffeurId:c?.id,motoId:m?.id,type:'TOUR',prix:parseInt(nbPassagers)*parseInt(tarifPassager),nbPassagers:parseInt(nbPassagers)});}
    else if(typeCourse==='FORFAIT'){if(!montant){setMsg('⚠️ Entrez un montant');return;}createCourse.mutate({chauffeurId:c?.id,motoId:m?.id,type:'FORFAIT',prix:parseFloat(montant)});}
    else if(typeCourse==='NORMALE'){const d=parseFloat(kmArrivee)-parseFloat(kmDepart);if(d<=0){setMsg('⚠️ Km arrivée > Km départ');return;}createCourse.mutate({chauffeurId:c?.id,motoId:m?.id,type:'NORMALE',distance:d});}
    else{if(!montant){setMsg('⚠️ Entrez un montant');return;}createCourse.mutate({chauffeurId:c?.id,motoId:m?.id,type:'ADY_VAROTRA',prix:parseFloat(montant)});}
  };

  const addDepense = (cat:string,label:string) => {
    const mt=prompt(`${label} (Ar):`);
    if(mt&&parseFloat(mt)>0){
      const extra:any = {};
      if(cat==='CARBURANT'){const l=prompt('Litres (optionnel):');if(l)extra.litres=parseFloat(l);const s=prompt('Station (optionnelle):');if(s)extra.station=s;}
      if(cat==='REPARATION'){const d=prompt('Description:');if(d)extra.description=d;}
      axios.post(`${API}/depenses`,{description:label,montant:parseFloat(mt),categorie:cat,motoId:m?.id,...extra},{headers:{Authorization:`Bearer ${tk()}`}}).then(()=>{alert('✅ Déclaré !');qc.invalidateQueries({queryKey:['dashboard']});}).catch(()=>alert('❌ Erreur'));
    }
  };

  const distance=kmDepart&&kmArrivee?Math.max(0,parseFloat(kmArrivee)-parseFloat(kmDepart)):0;
  const stats={count:0,prix:0,commission:0,gainNet:0,...(dash?.aujourdhui??{})};
  const semaine={count:0,prix:0,commission:0,gainNet:0,...(dash?.semaine??{})};
  const mois={count:0,prix:0,commission:0,gainNet:0,...(dash?.mois??{})};

  return <div>
    {msg&&<div className={`floating-alert ${msg.includes('✅')?'success':'warning'}`}>{msg}</div>}
    <div className="status-buttons">
      <button onClick={()=>{
        const horsService = !c?.statut || c.statut==='HORS_SERVICE';
        if(horsService){const km=prompt('🏍️ KM au compteur au départ:');if(km){setKmDebut(km);localStorage.setItem('kmDebut',km);pointer.mutate('ARRIVEE');}}else{pointer.mutate('ARRIVEE');}
      }} className="status-btn debut">▶️ Début</button>
      <button onClick={()=>pointer.mutate(c?.statut==='EN_PAUSE'?'REPRISE':'PAUSE')} className="status-btn standby">{c?.statut==='EN_PAUSE'?'▶️ Reprendre':'⏸️ Standby'}</button>
      <button onClick={()=>setShowConfirm(true)} className="status-btn fin">⏹️ Fin</button>
    </div>
    {kmDebut && <div style={{background:'#252525',borderRadius:8,padding:8,textAlign:'center',fontSize:12,marginBottom:8}}>🏍️ KM départ: <strong style={{color:'#DAA520'}}>{kmDebut}</strong></div>}
    
    <div className="card"><div className="card-title">📅 Aujourd'hui</div><div className="stats-grid"><div className="stat-item"><div className="stat-value">{stats.count}</div><div className="stat-label">Courses</div></div><div className="stat-item"><div className="stat-value">{(stats.prix||0).toLocaleString()} Ar</div><div className="stat-label">CA</div></div><div className="stat-item"><div className="stat-value">{(stats.commission||0).toLocaleString()} Ar</div><div className="stat-label">Commission</div></div><div className="stat-item"><div className="stat-value" style={{color:(stats.gainNet||0)>=0?'#27ae60':'#e74c3c'}}>{(stats.gainNet||0).toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div></div></div>
    
    <div className="card">
      <div className="card-title">➕ Nouvelle course</div>
      {!enService&&<div style={{background:'rgba(239,68,68,0.1)',borderLeft:'3px solid #ef4444',padding:10,borderRadius:8,marginBottom:12,fontSize:12,color:'#ef4444'}}>🔒 Vous devez être EN SERVICE</div>}
      <div className="form-group"><select value={typeCourse} onChange={e=>setTypeCourse(e.target.value)} disabled={!enService} style={{width:'100%',padding:10,background:'#252525',border:'1px solid #333',borderRadius:10,color:'#fff',fontSize:13,opacity:enService?1:0.5}}>
  {m?.typeVehicule === 'BUS' ? (
    <option value='TOUR'>🚌 Tour (aller-retour)</option>
  ) : m?.typeVehicule === 'TAXI' ? (
    <><option value='NORMALE'>🚗 Course (km)</option><option value='FORFAIT'>🚗 Forfait</option></>
  ) : (
    <><option value='NORMALE'>🏍️ Course (km)</option><option value='ADY_VAROTRA'>🛺 Ady Varotra</option><option value='LOCATION_JOURNALIERE'>📅 Location journée</option></>
  )}
</select></div>
      {typeCourse==='TOUR'&&<div style={{background:'#1a2a1a',borderRadius:10,padding:15,textAlign:'center',marginBottom:8,border:'1px solid #2ecc71'}}><div style={{fontSize:11,color:'#888'}}>🚌 Tour = Aller + Retour</div><div style={{fontSize:14,color:'#2ecc71'}}>Prix = Passagers × Tarif unitaire</div></div>}
      {typeCourse==='NORMALE'&&<div><div style={{display:'flex',gap:6,marginBottom:6}}><input type="number" step="0.1" value={kmDepart} onChange={e=>setKmDepart(e.target.value)} placeholder="Km départ" disabled={!enService} style={{flex:1,padding:10,background:'#252525',border:'1px solid #333',borderRadius:10,color:'#fff',fontSize:13}}/><input type="number" step="0.1" value={kmArrivee} onChange={e=>setKmArrivee(e.target.value)} placeholder="Km arrivée" disabled={!enService} style={{flex:1,padding:10,background:'#252525',border:'1px solid #333',borderRadius:10,color:'#fff',fontSize:13}}/></div>{distance>0&&<div style={{background:'#252525',borderRadius:8,padding:8,textAlign:'center',fontSize:12,marginBottom:8}}>📏 {distance.toFixed(1)} km · 💰 {((params?.prix_base||2000)+distance*(params?.prix_km||500)).toLocaleString()} Ar</div>}</div>}
      {typeCourse==='LOCATION_JOURNALIERE'&&<div style={{background:'#1a2a1a',borderRadius:10,padding:15,textAlign:'center',marginBottom:8,border:'1px solid #2ecc71'}}><div style={{fontSize:11,color:'#888'}}>📅 Tarif location journalière</div><div style={{fontSize:24,fontWeight:'bold',color:'#2ecc71'}}>{(params?.tarif_location_journalier||15000).toLocaleString()} Ar</div></div>}
      {typeCourse==='FORFAIT'&&<div className="form-group"><input type="number" value={montant} onChange={e=>setMontant(e.target.value)} placeholder="Montant du forfait (Ar)" disabled={!enService}/></div>}
      {typeCourse==='ADY_VAROTRA'&&<div className="form-group"><input type="number" value={montant} onChange={e=>setMontant(e.target.value)} placeholder="Montant (Ar)" disabled={!enService}/></div>}
      <button onClick={handleCourse} disabled={!enService||createCourse.isPending} className="btn-primary" style={{opacity:enService?1:0.5}}>{createCourse.isPending?'⏳...':'✅ Enregistrer'}</button>
      {enService&&<div style={{marginTop:10,display:'flex',gap:6,flexWrap:'wrap'}}>
        <button onClick={()=>addDepense('CARBURANT','Carburant')} style={{padding:'8px 12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:20,color:'#f87171',fontSize:11,cursor:'pointer'}}>⛽ Carburant</button>
        <button onClick={()=>addDepense('PNEU','Pneu')} style={{padding:'8px 12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:20,color:'#f87171',fontSize:11,cursor:'pointer'}}>🛞 Pneu</button>
        <button onClick={()=>addDepense('REPARATION','Réparation')} style={{padding:'8px 12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:20,color:'#f87171',fontSize:11,cursor:'pointer'}}>🔨 Réparation</button>
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
    if(kmDebut&&val){const d=parseFloat(val)-parseFloat(kmDebut);setDistanceJour(d>0?d:0);}else{setDistanceJour(0);}
  };
  return <div className="modal-overlay" onClick={()=>setShowConfirm(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}>
    <h3 style={{color:'#DAA520',marginBottom:12}}>🏁 Terminer la journée ?</h3>
    <div className="form-group"><input type="number" value={kmFin} onChange={e=>handleKmChange(e.target.value)} placeholder="🏍️ KM au compteur (arrivée)" style={{width:'100%',padding:10,background:'#252525',border:'1px solid #333',borderRadius:10,color:'#fff',fontSize:14}}/></div>
    {distanceJour>0&&<div style={{textAlign:'center',padding:10,background:'#1a2a1a',borderRadius:10,marginBottom:8}}>📏 Distance totale : <strong style={{color:'#2ecc71'}}>{distanceJour.toFixed(1)} km</strong></div>}
    {kmDebut&&<div style={{textAlign:'center',padding:8,fontSize:11,color:'#888'}}>KM départ: {kmDebut} → KM arrivée: {kmFin||'?'}</div>}
    <div style={{display:'flex',gap:8}}><button onClick={()=>{setShowConfirm(false);setKmFin('');setDistanceJour(0);}} style={{flex:1,padding:12,background:'#333',border:'none',borderRadius:10,color:'#fff',fontWeight:600,cursor:'pointer'}}>Annuler</button><button onClick={()=>{pointer.mutate('FIN_SERVICE');setShowConfirm(false);}} style={{flex:1,padding:12,background:'#e74c3c',border:'none',borderRadius:10,color:'#fff',fontWeight:600,cursor:'pointer'}}>Confirmer</button></div>
  </div></div>;
}

// ==================== COURSES ====================
function CoursesPage(){
  const c=chauffeur();
  const {data}=useQuery({queryKey:['courses',c?.id],queryFn:()=>axios.get(`${API}/courses?chauffeurId=${c?.id}`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data).catch(()=>[]),enabled:!!c?.id});
  const courses=(Array.isArray(data?.items)?data.items:Array.isArray(data)?data:[]).slice(0,50);
  return <div>{courses.length===0?<p style={{color:'#888',textAlign:'center',padding:20}}>Aucune course</p>:courses.map((course:any)=><div key={course.id} className="course-item"><div><div style={{fontWeight:'bold',color:'#DAA520',fontSize:12}}>{course.type==='NORMALE'?'🚖 Course':course.type==='ADY_VAROTRA'?'🛺 Ady Varotra':'📅 Location'}</div><div className="course-date">{new Date(course.createdAt).toLocaleString('fr')}</div></div><div className="course-price">{course.prix?.toLocaleString()} Ar</div></div>)}</div>;
}

// ==================== STATS ====================
function StatsPage(){
  const c=chauffeur();const m=moto();
  const {data:dash}=useQuery({queryKey:["dashboard",c?.id],queryFn:()=>axios.get(`${API}/chauffeurs/${c?.id}/dashboard`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data),enabled:!!c?.id});
  const {data:dep}=useQuery({queryKey:["depenses-stats",m?.id],queryFn:()=>axios.get(`${API}/depenses?motoId=${m?.id}`).then(r=>r.data).catch(()=>({items:[]})),enabled:!!m?.id});
  const s=(p:string)=>({count:0,prix:0,commission:0,gainNet:0,...(dash?.[p]??{})});
  const items=dep?.items||[];
  const now=new Date();const debutJour=new Date(now.getFullYear(),now.getMonth(),now.getDate());const debutSemaine=new Date(now);debutSemaine.setDate(now.getDate()-(now.getDay()===0?6:now.getDay()-1));debutSemaine.setHours(0,0,0,0);const debutMois=new Date(now.getFullYear(),now.getMonth(),1);
  const dp=(depuis:Date)=>items.filter((d:any)=>new Date(d.date)>=depuis).reduce((s:number,d:any)=>s+d.montant,0);
  const periodes=[{k:"aujourdhui",t:"📅 Aujourd'hui",dep:dp(debutJour)},{k:"semaine",t:"📆 Cette semaine",dep:dp(debutSemaine)},{k:"mois",t:"🗓️ Ce mois",dep:dp(debutMois)}];
  return <div>{periodes.map(p=><div className="card" key={p.k}><div className="card-title">{p.t}</div><div className="stats-grid"><div className="stat-item"><div className="stat-value">{s(p.k).count}</div><div className="stat-label">Courses</div></div><div className="stat-item"><div className="stat-value" style={{color:"#10b981"}}>{(s(p.k).prix||0).toLocaleString()} Ar</div><div className="stat-label">CA brut</div></div><div className="stat-item"><div className="stat-value" style={{color:"#ef4444"}}>-{p.dep.toLocaleString()} Ar</div><div className="stat-label">Dépenses</div></div><div className="stat-item"><div className="stat-value" style={{color:"#f59e0b"}}>-{(s(p.k).commission||0).toLocaleString()} Ar</div><div className="stat-label">Commission</div></div></div><div style={{marginTop:10,padding:10,background:"#252525",borderRadius:10,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#888"}}>Gain net</span><span style={{fontSize:18,fontWeight:800,color:(s(p.k).gainNet||0)-p.dep>=0?"#10b981":"#ef4444"}}>{((s(p.k).gainNet||0)-p.dep).toLocaleString()} Ar</span></div></div>)}<div className="card" style={{background:"linear-gradient(135deg, #1a1a1a, #DAA52022)",border:"1px solid #DAA520",textAlign:"center",padding:20}}><div style={{fontSize:11,color:"#DAA520",letterSpacing:2}}>SOLDE ACTUEL</div><div style={{fontSize:30,fontWeight:800,color:"#DAA520"}}>{(dash?.solde||c?.solde||0).toLocaleString()} Ar</div></div></div>;
}

// ==================== PROFIL ====================
function ProfilPage({onLogout}:{onLogout:()=>void}){
  const c=chauffeur(); const m=moto();
  const assistance = () => {
    const msg = prompt('Décrivez votre problème (10 carac min):');
    if(msg&&msg.length>=10){
      axios.post(API+'/assistance',{chauffeurId:c?.id,type:'AUTRE',urgence:'NORMALE',description:msg},{headers:{Authorization:'Bearer '+tk()}}).then(()=>alert('✅ Demande envoyée')).catch(()=>alert('❌ Erreur'));
    }else if(msg){alert('10 caractères minimum');}
  };
  return <div><div className="card"><div className="card-title">👤 Mon profil</div><div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}><div style={{width:60,height:60,borderRadius:'50%',background:'#DAA520',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:'bold',color:'#000'}}>{c?.nom?.charAt(0)||'?'}</div><div><div style={{fontSize:18,fontWeight:700}}>{c?.nom}</div><div style={{fontSize:12,color:'#888'}}>{c?.codeAcces}</div></div></div><div style={{borderTop:'1px solid #333',paddingTop:12}}><div className="profil-item"><span style={{color:'#888'}}>📱 Téléphone</span><span>{c?.telephone||'-'}</span></div><div className="profil-item"><span style={{color:'#888'}}>🏍️ Moto</span><span>{m?.immatriculation||'Aucune'}</span></div><div className="profil-item"><span style={{color:'#888'}}>📊 Statut</span><span>{c?.statut||'HORS_SERVICE'}</span></div><div className="profil-item"><span style={{color:'#888'}}>💰 Solde</span><span style={{color:'#DAA520',fontWeight:700}}>{c?.solde?.toLocaleString()||0} Ar</span></div></div></div><button onClick={assistance} style={{width:'100%',padding:14,background:'rgba(218,165,32,0.15)',border:'1px solid rgba(218,165,32,0.3)',borderRadius:12,color:'#DAA520',fontWeight:600,fontSize:14,cursor:'pointer',marginTop:10,marginBottom:10}}>🆘 Assistance</button><button onClick={onLogout} style={{width:'100%',padding:14,background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:12,color:'#f87171',fontWeight:600,fontSize:14,cursor:'pointer'}}>🚪 Déconnexion</button></div>;
}

// ==================== NOTIFICATIONS ====================
function NotificationsPopup({onClose,onViewAll}:{onClose:()=>void,onViewAll:()=>void}){
  const {data}=useQuery({queryKey:['notifications-popup'],queryFn:()=>axios.get(`${API}/notifications`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data).catch(()=>[]),refetchInterval:15000});
  const notifs=Array.isArray(data)?data.slice(0,5):[];
  return <div className="modal-overlay" onClick={onClose}><div className="modal-content" onClick={e=>e.stopPropagation()} style={{maxWidth:400}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><h3 style={{color:'#DAA520',fontSize:16}}>🔔 Notifications</h3><button onClick={onClose} style={{background:'none',border:'none',color:'#888',fontSize:20,cursor:'pointer'}}>×</button></div>{notifs.length===0?<p style={{color:'#888',textAlign:'center',padding:20}}>Aucune notification</p>:notifs.map((n:any)=><div key={n.id} style={{background:'#252525',borderRadius:10,padding:10,marginBottom:8,borderLeft:'3px solid '+(n.lu?'#DAA520':'#e74c3c')}}><div style={{fontWeight:'bold',color:'#DAA520',fontSize:12,marginBottom:4}}>{n.titre}</div><div style={{fontSize:11,color:'#ccc',marginBottom:4}}>{n.message}</div><div style={{fontSize:10,color:'#666'}}>{new Date(n.createdAt).toLocaleString('fr')}</div></div>)}{notifs.length>0&&<button onClick={onViewAll} className="btn-primary" style={{marginTop:8,background:'#DAA520',color:'#000'}}>Voir toutes les notifications</button>}</div></div>;
}

function NotificationsPage({onBack}:{onBack:()=>void}){
  const {data}=useQuery({queryKey:['notifications-all'],queryFn:()=>axios.get(`${API}/notifications`,{headers:{Authorization:`Bearer ${tk()}`}}).then(r=>r.data).catch(()=>[]),refetchInterval:15000});
  const notifs=Array.isArray(data)?data:[];
  return <div><button className="back-btn" onClick={onBack}>← Retour</button><div className="card"><div className="card-title">🔔 Toutes les notifications</div></div>{notifs.length===0?<p style={{color:'#888',textAlign:'center',padding:20}}>Aucune notification</p>:notifs.map((n:any)=><div key={n.id} style={{background:'#252525',borderRadius:10,padding:10,marginBottom:8,borderLeft:'3px solid '+(n.lu?'#DAA520':'#e74c3c')}}><div style={{fontWeight:'bold',color:'#DAA520',fontSize:12,marginBottom:4}}>{n.titre}</div><div style={{fontSize:11,color:'#ccc',marginBottom:4}}>{n.message}</div><div style={{fontSize:10,color:'#666'}}>{new Date(n.createdAt).toLocaleString('fr')}</div></div>)}</div>;
}

// ==================== BOTTOM NAV ====================
function BottomNav({current,onChange}:{current:string;onChange:(p:any)=>void}){
  const tabs=[{key:'courses',label:'Courses',icon:ClipboardList},{key:'stats',label:'Stats',icon:BarChart3},{key:'accueil',label:'Accueil',icon:Home,main:true},{key:'versements',label:'Versements',icon:DollarSign},{key:'profil',label:'Profil',icon:User}];
  return <nav className="bottom-nav"><div className="nav-items" style={{overflowX:'auto',justifyContent:'center',gap:2,padding:'0 4px'}}>{tabs.map(t=><button key={t.key} onClick={()=>onChange(t.key)} className={`nav-item ${current===t.key?'active':''}`} style={{minWidth:55,flex:'0 0 auto'}}>{t.main ? <t.icon size={24} style={{color:'#DAA520'}} /> : <t.icon size={16} />}<span className="nav-label">{t.label}</span></button>)}</div></nav>;
}
