import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';

const WHATSAPP = 'https://chat.whatsapp.com/Jjc5cuUKENu0RC1vWSEs20';
const LINKEDIN = 'https://www.linkedin.com/showcase/glbajaj-nexasphere/';
const NEXASPHERE_EMAIL = 'nexasphere@glbajajgroup.org';

const VALUES = ['Innovation', 'Collaboration', 'Learning', 'Growth', 'Community', 'Technology', 'Career', 'Mentorship'];

function DynamicIcon({ name, ...props }: { name: string; [key: string]: any }) {
  const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <Icon {...props} />;
}

export default function AboutSection() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(()=>{
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('fired');obs.unobserve(e.target);}});
    },{threshold:.09});
    document.querySelectorAll('#section-about .pop-in,#section-about .pop-left,#section-about .pop-right,#section-about .pop-word').forEach(el=>obs.observe(el));
    return()=>obs.disconnect();
  },[]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <section className="section about-section" id="section-about">
      <div className="about-glow" />
      <div className="container about-container">
        <div className="ns-reveal">
          <h2 className="section-title pop-word">About NexaSphere</h2>
          <p className="section-subtitle pop-in" style={{ animationDelay: '0.1s' }}>
            Building Tomorrow&apos;s Tech Leaders Today
          </p>
        </div>

        <div className="about-grid">
          <div className="ns-reveal-left">
            <p className="about-text pop-left" style={{ animationDelay: '0.08s' }}>
              <strong className="about-strong-red">NexaSphere</strong> is a student-driven tech ecosystem at{' '}
              <strong className="about-strong-dark-red">GL Bajaj Group of Institutions, Mathura</strong>.
              Founded to bridge the gap between academic learning and real-world technology, we run hackathons, workshops, knowledge-sharing sessions, and career guidance events.
            </p>
            <p className="about-text pop-left" style={{ marginTop: '12px', animationDelay: '0.16s' }}>
              We&apos;ve hosted diverse events like the KSS #153 on the Impact of AI, the Industry Insider career guidance session, and hands-on workshops like Git &amp; GitHub. NexaSphere is where curiosity meets real opportunity.
            </p>
            
            <div className="contact-mini pop-left" style={{ animationDelay: '0.22s' }}>
              <div className="contact-label">Contact Us</div>
              <a href={`mailto:${NEXASPHERE_EMAIL}`} className="contact-email">{NEXASPHERE_EMAIL}</a>
            </div>
          </div>

          <div className="pop-right ag" style={{animationDelay:'.14s'}}>
            <div className="about-card-inner"
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--c1b)';e.currentTarget.style.boxShadow='var(--sh1)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='';e.currentTarget.style.boxShadow='';}}
            >
              <div style={{position:'absolute',top:'-14px',right:'-14px',width:'90px',height:'90px',background:'radial-gradient(circle,rgba(0,212,255,.07),transparent)',borderRadius:'50%',pointerEvents:'none'}}/>
              <div className="corner-tl"/><div className="corner-br"/>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:'.7rem',color:'var(--c1)',fontWeight:700,letterSpacing:'.1em',marginBottom:'13px',textTransform:'uppercase'}}>Our Values</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                {VALUES.map(v=>(
                  <span key={v} style={{
                    display:'inline-flex',alignItems:'center',
                    padding:'4px 12px',borderRadius:'50px',
                    background:'var(--c1a)',border:'1px solid var(--c1b)',
                    color:'var(--c1)',fontSize:'.74rem',fontWeight:700,
                    letterSpacing:'.06em',textTransform:'uppercase',cursor:'default',
                    transition:'all .18s',
                  }}
                    onMouseEnter={e=>{e.currentTarget.style.background='var(--c1b)';e.currentTarget.style.transform='translateY(-2px)';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='var(--c1a)';e.currentTarget.style.transform='';}}
                  >{v}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="about-actions pop-in" style={{animationDelay:'.28s'}}>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <DynamicIcon name="MessageSquare" size={16} /> Join WhatsApp
          </a>
          <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="btn btn-linkedin" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <DynamicIcon name="Linkedin" size={16} /> LinkedIn
          </a>
          <a href={`mailto:${NEXASPHERE_EMAIL}`} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <DynamicIcon name="Mail" size={16} /> Email Us
          </a>
        </div>
      </div>
    </section>
  );
}
