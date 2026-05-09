import { type ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import './styles/globals.css';
import './styles/animations.css';
import './styles/chatbot.css';
import './styles/components.css';
import './styles/aurora.css';
import './styles/motion.css';

import ParticleBackground from './shared/ParticleBackground';
import GeometricGridBackground from './shared/GeometricGridBackground';
// @ts-ignore
import ScrollProgress from './shared/ScrollProgress';
import Navbar from './shared/Navbar';
import HeroSection from './pages/home/HeroSection';
import ActivitiesSection from './pages/activities/ActivitiesSection';
import EventsSection from './pages/events/EventsSection';
import AboutSection from './pages/about/AboutSection';
import TeamSection from './pages/team/TeamSection';
import Footer from './shared/Footer';
import ActivityDetailPage from './pages/activities/ActivityDetailPage';
import EventDetailPage from './pages/events/EventDetailPage';
import CinematicOpening from './shared/CinematicOpening';
// @ts-ignore
import Chatbot from './shared/Chatbot';

import {
  AmbientOrbs, SectionDivider, PageFlash,
  useScrollProgress, useNsReveal, useHeroParallax,
  useNavScrollTint, useGlobalMouseParallax, useMagneticCards,
} from './shared/MotionLayer';

import ActivitiesPage from './pages/activities/ActivitiesPage';
import EventsPage from './pages/events/EventsPage';
import AboutPage from './pages/about/AboutPage';
import TeamPage from './pages/team/TeamPage';
import ContactPage from './pages/contact/ContactPage';
import RecruitmentPage from './pages/recruitment/RecruitmentPage';
import MembershipPage from './pages/membership/MembershipPage';
import NotFoundPage from './pages/NotFoundPage';
import type { ActivityKey } from './types/activities';
import type { ActivityEvent, Event } from './types/api';

import { activityPages } from './data/activities/index';
import { events as fallbackEvents } from './data/eventsData';
import nexasphereLogo      from './assets/images/logos/nexasphere-logo.png';
import * as LucideIcons from 'lucide-react';

function DynamicIcon({ name, ...props }: { name: string; [key: string]: any }) {
  const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <Icon {...props} />;
}

const MNH = 88, DNH = 64;
const TABS = ['Home','Activities','Events','About','Team','Contact'];
type Theme = 'dark' | 'light';
type SectionPage = 'Activities' | 'Events' | 'About' | 'Team' | 'Contact';
type PageState =
  | { type: 'section'; section: SectionPage }
  | { type: 'activity'; activityKey: ActivityKey }
  | { type: 'event'; activityKey?: ActivityKey; event: Event | ActivityEvent }
  | { type: 'apply' }
  | { type: 'join' }
  | null;

/* ── Page wipe transition ── */
function Wipe({ on, ph }: { on: boolean; ph: 'out' | 'in' }): ReactNode {
  if (!on) return null;
  return (
    <>
      <div style={{position:'fixed',inset:0,zIndex:8000,background:'var(--bg)',animation:`${ph==='out'?'wipeDown .27s':'wipeUp .30s'} cubic-bezier(.77,0,.18,1) forwards`,pointerEvents:'all'}}/>
      <div style={{position:'fixed',inset:0,zIndex:8001,background:'linear-gradient(90deg,var(--c1),var(--c2),var(--c3))',opacity:.07,animation:`${ph==='out'?'wipeDown .20s .04s':'wipeUp .24s .04s'} cubic-bezier(.77,0,.18,1) forwards`,pointerEvents:'none'}}/>
      {/* Enhanced shimmer sweep over wipe */}
      {ph==='out'&&<div className="wipe-shimmer" aria-hidden="true"/>}
      {/* Page flash glow on navigate */}
      {ph==='in'&&<PageFlash/>}
      {ph==='out'&&<div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:8002,pointerEvents:'none',opacity:0,animation:'splashIn .16s .1s ease forwards'}}>
        <img src={nexasphereLogo} style={{height:'46px',mixBlendMode:'screen',filter:'drop-shadow(0 0 12px var(--c1))',opacity:.6}} alt=""/>
      </div>}
    </>
  );
}

/* ── Page enter animation ── */
function PageIn({ children, k }: { children: ReactNode; k: string }): ReactNode {
  const [r, setR] = useState(false);
  useEffect(()=>{ const raf=requestAnimationFrame(()=>setR(true)); return()=>cancelAnimationFrame(raf); },[k]);
  return (
    <div style={{opacity:r?1:0,transform:r?'none':'translateY(16px) scale(.99)',transition:'opacity .42s cubic-bezier(.22,1,.36,1),transform .42s cubic-bezier(.22,1,.36,1)',willChange:'opacity,transform'}}>
      {children}
    </div>
  );
}

/* ── Anti-gravity orb cursor ── */
function Cursor(): ReactNode {
  const orbRef  = useRef<HTMLDivElement | null>(null);
  const trailRef= useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const stateRef= useRef({
    // real mouse position
    mx:0, my:0,
    // orb position (lags behind)
    ox:0, oy:0,
    // anti-gravity float offset
    floatY:0, floatPhase:0,
    // hover state
    hovering:false,
    clicking:false,
    raf: 0,
  });

  useEffect(()=>{
    if(window.matchMedia('(hover:none)').matches) return;
    document.body.style.cursor='none';

    const s = stateRef.current;

    const onMove = (e: MouseEvent): void => { s.mx = e.clientX; s.my = e.clientY; };
    const onDown = (): void => { s.clicking = true; };
    const onUp   = (): void => { s.clicking = false; };

    // Detect hoverable elements
    const onOver = (e: MouseEvent): void => {
      s.hovering = e.target instanceof Element && !!e.target.closest('button,a,[role="button"],[tabindex]');
    };

    const tick = (): void => {
      // Smooth follow — increased sensitivity (was 0.11)
      s.ox += (s.mx - s.ox) * 0.18;
      s.oy += (s.my - s.oy) * 0.18;

      // Anti-gravity float: continuous gentle bob
      s.floatPhase += 0.022;
      s.floatY = Math.sin(s.floatPhase) * 6
               + Math.sin(s.floatPhase * 1.7) * 3
               + Math.sin(s.floatPhase * 0.5) * 4;

      const fy = s.oy + s.floatY;

      const scale = s.clicking ? 0.7 : s.hovering ? 1.55 : 1;
      const opacity = s.hovering ? 0.95 : 0.82;

      if (orbRef.current) {
        orbRef.current.style.left    = s.ox + 'px';
        orbRef.current.style.top     = fy  + 'px';
        orbRef.current.style.transform = `translate(-50%,-50%) scale(${scale})`;
        orbRef.current.style.opacity = String(opacity);
      }
      if (trailRef.current) {
        trailRef.current.style.left  = s.ox + 'px';
        trailRef.current.style.top   = s.oy + s.floatY * 0.4 + 'px';
        trailRef.current.style.opacity = s.hovering ? '0' : '0.35';
      }
      if (glowRef.current) {
        glowRef.current.style.left = s.mx + 'px';
        glowRef.current.style.top  = s.my + 'px';
      }

      s.raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove,  { passive:true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('mouseover', onOver,  { passive:true });
    s.raf = requestAnimationFrame(tick);

    return () => {
      document.body.style.cursor = '';
      cancelAnimationFrame(s.raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  return (
    <>
      {/* Big ambient glow — follows mouse directly */}
      <div ref={glowRef} style={{
        position:'fixed', pointerEvents:'none', zIndex:10000,
        width:'320px', height:'320px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(0,212,255,.055) 0%, rgba(123,111,255,.03) 40%, transparent 70%)',
        transform:'translate(-50%,-50%)',
        transition:'opacity .3s',
      }}/>

      {/* Trail dot — slower, creates depth */}
      <div ref={trailRef} style={{
        position:'fixed', pointerEvents:'none', zIndex:10002,
        width:'28px', height:'28px', borderRadius:'50%',
        background:'radial-gradient(circle, var(--c2) 0%, transparent 70%)',
        transform:'translate(-50%,-50%)',
        filter:'blur(6px)',
        transition:'opacity .25s',
      }}/>

      {/* Main anti-gravity orb */}
      <div ref={orbRef} style={{
        position:'fixed', pointerEvents:'none', zIndex:10005,
        width:'18px', height:'18px', borderRadius:'50%',
        background:'radial-gradient(circle at 35% 35%, #fff 0%, var(--c1) 40%, var(--c2) 100%)',
        boxShadow:'0 0 10px var(--c1), 0 0 24px rgba(0,212,255,.5), 0 0 50px rgba(123,111,255,.2)',
        transition:'transform .18s cubic-bezier(.34,1.56,.64,1), opacity .2s',
      }}>
        {/* Inner sparkle */}
        <div style={{
          position:'absolute', top:'20%', left:'22%',
          width:'5px', height:'5px', borderRadius:'50%',
          background:'rgba(255,255,255,.9)',
          filter:'blur(1px)',
        }}/>
      </div>
    </>
  );
}

export default function App(): ReactNode {
  const [cinDone,  setCinDone]  = useState(() => sessionStorage.getItem('ns-intro-seen') === 'true');
  const [activeTab,setActiveTab]= useState('Home');
  const [mobile,   setMobile]   = useState(window.innerWidth<=768);
  const [wipeOn,   setWipeOn]   = useState(false);
  const [wipePh,   setWipePh]   = useState('out');
  const [page,     setPage]     = useState<PageState>(null);
  const [theme,    setTheme]    = useState(()=>localStorage.getItem('ns-theme')||'dark');
  const [eventsData,setEventsData]=useState<any[]>([]);
  const [teamData,  setTeamData]  = useState<any[]>([]);
  const [loading,  setLoading]   = useState(true);
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname === '/admin';
  // Apply theme to html element
  useEffect(()=>{
    document.documentElement.setAttribute('data-theme',theme);
    localStorage.setItem('ns-theme',theme);
  },[theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);


  useEffect(() => {
    let alive = true;
    setLoading(true);
    const base = (import.meta?.env?.VITE_API_BASE || '').replace(/\/+$/, '');
    
    const fetchEvents = fetch(base ? `${base}/api/content/events` : '/api/content/events')
      .then(r => r.ok ? r.json() : { events: [] })
      .catch(() => ({ events: [] }));
      
    const fetchTeam = fetch(base ? `${base}/api/content/core-team` : '/api/content/core-team')
      .then(r => r.ok ? r.json() : { members: [] })
      .catch(() => ({ members: [] }));

    Promise.all([fetchEvents, fetchTeam]).then(([eData, tData]) => {
      if (!alive) return;
      
      if (Array.isArray(eData?.events) && eData.events.length > 0) {
        setEventsData(eData.events);
      } else {
        setEventsData(fallbackEvents);
      }

      if (Array.isArray(tData?.members) && tData.members.length > 0) {
        setTeamData(tData.members);
      } else {
        import('./data/teamData').then(m => setTeamData(m.teamMembers)).catch(() => {});
      }
    }).finally(() => {
      if (alive) setLoading(false);
    });

    return () => { alive = false; };
  }, []);

  // Active tab highlight from scroll
  useEffect(()=>{
    if(page)return;
    const nh=mobile?MNH:DNH;
    const fn=()=>{
      const sy=window.scrollY+nh+30;
      for(let i=TABS.length-1;i>=0;i--){
        const el=document.getElementById(`section-${TABS[i].toLowerCase()}`);
        if(el&&el.offsetTop<=sy){setActiveTab(TABS[i]);break;}
      }
    };
    window.addEventListener('scroll',fn,{passive:true});
    return()=>window.removeEventListener('scroll',fn);
  },[mobile,page]);

  // Resize
  useEffect(()=>{
    const fn=()=>setMobile(window.innerWidth<=768);
    window.addEventListener('resize',fn,{passive:true});
    return()=>window.removeEventListener('resize',fn);
  },[]);

  // Scroll reveal + cinematic pop + magnetic buttons + 3D card tilt
  useEffect(()=>{
    if(!cinDone)return;
    // Pop observer
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){e.target.classList.add('fired');obs.unobserve(e.target);}
      });
    },{threshold:.09,rootMargin:'0px 0px -36px 0px'});
    document.querySelectorAll('.pop-in,.pop-left,.pop-right,.pop-scale,.pop-flip,.pop-word,.pop-num').forEach(el=>obs.observe(el));

    // Magnetic buttons
    const btns=document.querySelectorAll('.mag-btn');
    const onMove=(e: MouseEvent): void=>{
      btns.forEach(btn=>{
        const rect=btn.getBoundingClientRect();
        const dx=e.clientX-(rect.left+rect.width/2);
        const dy=e.clientY-(rect.top+rect.height/2);
        const d=Math.sqrt(dx*dx+dy*dy);
        if (btn instanceof HTMLElement) {
          btn.style.transform=d<88?`translate(${dx*(88-d)/88*.32}px,${dy*(88-d)/88*.32}px)`:'';			
        }
      });

      // 3D card tilt for activity cards
      document.querySelectorAll('.activity-card').forEach(card=>{
        const rect=card.getBoundingClientRect();
        const cx=rect.left+rect.width/2;
        const cy=rect.top+rect.height/2;
        const dx=e.clientX-cx;
        const dy=e.clientY-cy;
        const dist=Math.sqrt(dx*dx+dy*dy);
        const maxDist=Math.max(rect.width,rect.height)*0.9;
        if (!(card instanceof HTMLElement)) return;
        if(dist<maxDist){
          const intensity=(1-dist/maxDist)*6;
          card.style.setProperty('--rx',(dx/rect.width*intensity).toFixed(2));
          card.style.setProperty('--ry',(-dy/rect.height*intensity).toFixed(2));
        } else {
          card.style.setProperty('--rx','0');
          card.style.setProperty('--ry','0');
        }
      });
    };
    window.addEventListener('mousemove',onMove,{passive:true});
    return()=>{obs.disconnect();window.removeEventListener('mousemove',onMove);};
  },[cinDone,page]);

  // ── NEW: Motion layer hooks (non-destructive extensions) ──
  useScrollProgress();
  useNsReveal([cinDone, page]);
  useHeroParallax();
  useNavScrollTint();
  useGlobalMouseParallax();
  useMagneticCards();

  // Navigation with wipe transition
  const nav=useCallback((fn: () => void): void=>{
    setWipeOn(true);setWipePh('out');
    setTimeout(()=>{
      fn();window.scrollTo({top:0});
      requestAnimationFrame(()=>{
        setWipePh('in');
        setTimeout(()=>setWipeOn(false),340);
      });
    },275);
  },[]);

  const onTab=useCallback((tab: string): void=>{
    // These tabs get their own dedicated page
    if(['Activities','Events','About','Team','Contact'].includes(tab)){
      nav(()=>{setPage({type:'section',section:tab as SectionPage});setActiveTab(tab);});
      return;
    }
    nav(()=>{
      setPage(null);setActiveTab(tab);
      setTimeout(()=>{
        const el=document.getElementById(`section-${tab.toLowerCase()}`);
        if(!el)return;
        window.scrollTo({top:el.offsetTop-(mobile?MNH:DNH),behavior:'smooth'});
      },50);
    });
  },[nav,mobile]);

  const onNavigate=useCallback((type: 'activity', title: ActivityKey): void=>{
    if(type==='activity') nav(()=>setPage({type:'activity',activityKey:title}));
  },[nav]);

  const onEvent=useCallback((ev: ActivityEvent): void=>{
    nav(()=>setPage((p: any)=>({...(p && 'activityKey' in p ? { activityKey: p.activityKey } : {}),type:'event',event:ev})));
  },[nav]);

  const onKSSClick=useCallback((ev: any): void=>{
    // Show KSS event detail page with Insight Session as activity context
    nav(()=>setPage({type:'event',activityKey:'Insight Session',event:ev}));
  },[nav]);

  const onBackAct=useCallback((): void=>{
    nav(()=>setPage((p: any)=>({type:'activity',activityKey:(p && 'activityKey' in p && p.activityKey ? p.activityKey : 'Insight Session')})));
  },[nav]);

  const onBackMain=useCallback(()=>{
    nav(()=>{
      setPage(null);
      setTimeout(()=>{
        const el=document.getElementById('section-activities');
        if(!el)return;
        window.scrollTo({top:el.offsetTop-(mobile?MNH:DNH),behavior:'smooth'});
      },50);
    });
  },[nav,mobile]);

  const onBackToSection=useCallback((section: SectionPage): void=>{
    nav(()=>setPage({type:'section',section}));
  },[nav]);

  const openApply = useCallback(()=>{
    nav(()=>setPage({type:'apply'}));
  },[nav]);

  const openJoin = useCallback(()=>{
    nav(()=>setPage({type:'join'}));
  },[nav]);

  const onBackHome=useCallback(()=>{
    nav(()=>{setPage(null);setActiveTab('Home');window.scrollTo({top:0});});
  },[nav]);

  const nh=mobile?MNH:DNH;
  const pg = page as any;
  const cur=pg && 'activityKey' in pg && pg.activityKey ? (activityPages as any)[pg.activityKey] : null;

  return (
    <>
      <Chatbot />
      {!cinDone && <CinematicOpening theme={theme} onDone={() => { setCinDone(true); sessionStorage.setItem('ns-intro-seen', 'true'); }} />}
      
      {cinDone && (
        <>
          <ScrollProgress />
          <Cursor />
          <Wipe on={wipeOn} ph={wipePh as any} />
          <AmbientOrbs theme={theme} />
          <GeometricGridBackground theme={theme} />
          <ParticleBackground theme={theme} />
          <Navbar activeTab={activeTab} onTabChange={onTab} onToggleTheme={toggleTheme} theme={theme} />
        </>
      )}

      <main style={{paddingTop:nh,position:'relative',zIndex:1}}>
        {pg?.type==='section'&&pg.section==='Activities'&&(
          <PageIn k="pg-activities">
            <ActivitiesPage onNavigate={onNavigate} onBack={onBackHome}/>
          </PageIn>
        )}
        {pg?.type==='section'&&pg.section==='Events'&&(
          <PageIn k="pg-events">
            <EventsPage onBack={onBackHome} onEventClick={onKSSClick} events={eventsData} loading={loading}/>
          </PageIn>
        )}
        {pg?.type==='section'&&pg.section==='About'&&(
          <PageIn k="pg-about">
            <AboutPage onBack={onBackHome}/>
          </PageIn>
        )}
        {pg?.type==='section'&&pg.section==='Team'&&(
          <PageIn k="pg-team">
            <TeamPage onBack={onBackHome} onApply={openApply} team={teamData} loading={loading}/>
          </PageIn>
        )}
        
        {pg?.type==='activity'&&cur&&(
          <PageIn k={`a-${pg.activityKey}`}>
            <ActivityDetailPage 
              activity={cur} 
              onBack={() => setPage({ type: 'section', section: 'Activities' })} 
              onSelectEvent={onEvent} 
            />
          </PageIn>
        )}
        {pg?.type==='event'&&pg.event&&cur&&(
          <PageIn k={`e-${pg.event?.id}`}>
            {(() => {
              let displayEvent = pg.event;
              const isKssEvent = pg.event.id === 1 || pg.event.id === 'kss-153' || String(pg.event.shortName || '').toLowerCase().includes('kss');
              if (pg.activityKey === 'Insight Session' && isKssEvent) {
                displayEvent = cur.conductedEvents?.find((e: any) => e.id === 'kss-153') || pg.event;
              }
              return <EventDetailPage event={displayEvent} activityColor={cur.color} activityIcon={cur.icon} onBack={onBackAct}/>;
            })()}
          </PageIn>
        )}

        {pg?.type === 'apply' && (
          <PageIn k="pg-apply">
            <RecruitmentPage onBack={onBackHome} />
          </PageIn>
        )}

        {pg?.type === 'join' && (
          <PageIn k="pg-join">
            <MembershipPage onBack={onBackHome} />
          </PageIn>
        )}

        {!page && cinDone && (
          <PageIn k="main">
            <HeroSection onTabChange={onTab} onApply={openApply} onJoin={openJoin} theme={theme} />
            <SectionDivider />
            <ActivitiesSection onNavigate={onNavigate} />
            <SectionDivider />
            <EventsSection onEventClick={onKSSClick as any} events={eventsData} />
            <SectionDivider />
            <AboutSection />
            <SectionDivider />
            <TeamSection onApply={openApply} />
            <Footer />
          </PageIn>
        )}

        {pg && pg.type !== 'section' && pg.type !== 'activity' && pg.type !== 'event' && pg.type !== 'apply' && pg.type !== 'join' && (
          <PageIn k="404">
            <NotFoundPage onBackHome={onBackHome} />
          </PageIn>
        )}
      </main>

      {cinDone&&<button id="back-to-top" aria-label="Back to top"><DynamicIcon name="ArrowUp" size={20} /></button>}
    </>
  );
}
