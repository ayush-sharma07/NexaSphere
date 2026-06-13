import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BannerOrbs } from '../../shared/MotionLayer';
import Footer from '../../shared/Footer';
import { DynamicIcon } from '../../shared/Icons';

const WHATSAPP = 'https://chat.whatsapp.com/Jjc5cuUKENu0RC1vWSEs20';
const LINKEDIN = 'https://www.linkedin.com/showcase/glbajaj-nexasphere/';
const NEXASPHERE_EMAIL = 'nexasphere@glbajajgroup.org';

export default function AboutPage({ onBack }) {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('fired'); obs.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -10px 0px' });
    document.querySelectorAll('#about-page .pop-in, #about-page .pop-left, #about-page .pop-right, #about-page .pop-word').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const values = [
    { label: t('about.values_list.innovation'), icon: 'Lightbulb', desc: t('about.values_list.innovation_desc') },
    { label: t('about.values_list.collaboration'), icon: 'Handshake', desc: t('about.values_list.collaboration_desc') },
    { label: t('about.values_list.learning'), icon: 'BookOpen', desc: t('about.values_list.learning_desc') },
    { label: t('about.values_list.growth'), icon: 'Sprout', desc: t('about.values_list.growth_desc') },
    { label: t('about.values_list.community'), icon: 'Globe', desc: t('about.values_list.community_desc') },
    { label: t('about.values_list.technology'), icon: 'Zap', desc: t('about.values_list.technology_desc') },
  ];

  const milestones = [
    { year: '2026', label: t('about.journey_list.founded'), desc: t('about.journey_list.founded_desc'), icon: 'Rocket' },
    { year: 'Mar 2026', label: t('about.journey_list.kss_153'), desc: t('about.journey_list.kss_153_desc'), icon: 'Brain' },
    { year: t('about.journey_list.coming_soon'), label: t('about.journey_list.expanding'), desc: t('about.journey_list.expanding_desc'), icon: 'Telescope' },
  ];

  const stats = [
    { label: t('about.numbers_list.team_members'), value: '12', icon: 'Users' },
    { label: t('about.numbers_list.activity_tracks'), value: '7', icon: 'Zap' },
    { label: t('about.numbers_list.events_conducted'), value: '1', icon: 'Target' },
    { label: t('about.numbers_list.ideas_pipeline'), value: '∞', icon: 'Lightbulb' },
  ];

  const valuesTitle = t('about.our_values');
  const journeyTitle = t('about.our_journey');

  return (
    <div id="about-page" style={{ minHeight: '100vh', padding: '0 0 100px' }}>
      
      <div className="page-banner" style={{
        background: 'linear-gradient(135deg, rgba(0,212,255,.06), rgba(123,111,255,.04))',
        borderBottom: '1px solid var(--bdr)',
        padding: '70px 0 50px',
        textAlign: 'center',
        marginBottom: '60px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div className="page-banner-line" style={{ position:'absolute',top:0,left:0,right:0,height:'3px',background:'linear-gradient(90deg,var(--c1),var(--c2),var(--c3))' }}/>
        <BannerOrbs color="rgba(0,212,255,.06)"/>
        <button onClick={onBack} className="ns-back-btn" style={{
          position: 'absolute', top: '24px', left: '28px',
          background: 'var(--card)', border: '1px solid var(--bdr)',
          borderRadius: '50px', padding: '7px 16px',
          color: 'var(--t2)', fontSize: '.8rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: "'Rajdhani', sans-serif", fontWeight: 600,
        }}>← {t('about.actions.back')}</button>

        <span className="cin-section-label pop-in" style={{position:'relative',zIndex:1}}>{t('about.institutions_label')}</span>
        <h1 className="section-title pop-word" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', position:'relative',zIndex:1 }}>{t('about.title')}</h1>
        <p className="section-subtitle pop-in" style={{ animationDelay: '.1s', maxWidth: '540px', margin: '0 auto', position:'relative',zIndex:1 }}>
          {t('about.subtitle')}
        </p>
      </div>

      <div className="container">
        
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px', marginBottom: '70px', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '.7rem', color: 'var(--c1)', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '14px' }}>
              {t('about.who_we_are')}
            </div>
            <p className="about-text pop-in" style={{ animationDelay: '.08s' }}>
              <strong style={{ color: 'var(--c1)' }}>NexaSphere</strong> {t('about.desc_1').split('NexaSphere').slice(1).join('NexaSphere') || t('about.desc_1')}
            </p>
            <p className="about-text pop-in" style={{ marginTop: '12px', animationDelay: '.16s' }}>
              {t('about.desc_3')}
            </p>

            <div className="pop-in" style={{ marginTop: '14px', animationDelay: '.22s' }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '.68rem', color: 'var(--c1)', fontWeight: 700, letterSpacing: '.1em', marginBottom: '4px', textTransform: 'uppercase' }}>{t('about.contact_us')}</div>
              <a href={`mailto:${NEXASPHERE_EMAIL}`} style={{ color: 'var(--c1)', fontSize: '.88rem', fontWeight: 600, cursor: 'none' }}>{NEXASPHERE_EMAIL}</a>
            </div>
          </div>

          
          <div className="pop-right ag" style={{ animationDelay: '.14s' }}>
            <div className="about-card-inner" style={{ padding: '32px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--c1), var(--c2), var(--c3))', borderRadius: 'var(--r3) var(--r3) 0 0' }} />
              <div className="corner-tl" /><div className="corner-br" />
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '.7rem', color: 'var(--c1)', fontWeight: 700, letterSpacing: '.1em', marginBottom: '20px', textTransform: 'uppercase' }}>{t('about.by_the_numbers')}</div>
              {stats.map(s => (
                <div key={s.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: '1px solid var(--bdr)',
                  }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--t2)', fontSize: '.88rem' }}>
                    <DynamicIcon name={s.icon} size={16} /> {s.label}
                  </span>
                  <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, color: 'var(--c1)', fontSize: '1.1rem' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        
        <div style={{ marginBottom: '70px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '1.2rem', fontWeight: 700, color: 'var(--t1)', textAlign: 'center', marginBottom: '32px' }}>
            {valuesTitle.split(' ')[0]} <span style={{ color: 'var(--c1)' }}>{valuesTitle.split(' ').slice(1).join(' ')}</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {values.map((v, i) => (
              <div key={v.label}
                className="ns-value-card"
                style={{
                  animationDelay: `${i * .07}s`,
                  background: 'var(--card)', border: '1px solid var(--bdr)',
                  borderRadius: 'var(--r2)', padding: '22px', opacity: 1,
                  animation: `ag 7s ease-in-out ${-i * 1.4}s infinite`,
                }}
              >
                <div className="ns-value-icon" style={{ marginBottom: '10px', display:'inline-flex', color: 'var(--c1)' }}>
                  <DynamicIcon name={v.icon} size={30} />
                </div>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '.72rem', fontWeight: 700, color: 'var(--c1)', marginBottom: '6px', letterSpacing: '.06em', textTransform: 'uppercase' }}>{v.label}</div>
                <p style={{ fontSize: '.82rem', color: 'var(--t2)', lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        
        <div className="ns-reveal" style={{ marginBottom: '60px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '1.2rem', fontWeight: 700, color: 'var(--t1)', textAlign: 'center', marginBottom: '32px' }}>
            {journeyTitle.split(' ')[0]} <span style={{ color: 'var(--c2)' }}>{journeyTitle.split(' ').slice(1).join(' ')}</span>
          </h2>
          <div className="events-timeline">
            {milestones.map((m, i) => (
              <div className="timeline-item" key={i}>
                <div className="timeline-dot" style={i === 2 ? { background: 'transparent', border: '2px solid var(--c1)', animation: 'pulse 2s infinite' } : {}} />
                <div className={`timeline-card ${i % 2 === 0 ? 'pop-left' : 'pop-right'}`} style={{ animationDelay: `${i * .12}s` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ display: 'flex', color: 'var(--c1)' }}><DynamicIcon name={m.icon} size={22} /></span>
                    <div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '.62rem', color: 'var(--t3)', letterSpacing: '.15em' }}>{m.year}</div>
                      <div className="timeline-event-name">{m.label}</div>
                    </div>
                  </div>
                  <p className="timeline-event-desc">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="ns-reveal-scale" style={{ textAlign: 'center', paddingTop: '20px' }}>
          <div style={{ marginBottom: '20px', fontFamily: "'Orbitron', monospace", fontSize: '.72rem', color: 'var(--t3)', letterSpacing: '.2em', textTransform: 'uppercase' }}>
            Connect With Us
          </div>
          <div className="about-actions">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp"><DynamicIcon name="MessageSquare" size={16} style={{ marginRight: '8px' }} /> {t('about.actions.join_whatsapp')}</a>
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="btn btn-linkedin"><DynamicIcon name="ExternalLink" size={16} style={{ marginRight: '8px' }} /> {t('about.actions.linkedin')}</a>
            <a href={`mailto:${NEXASPHERE_EMAIL}`} className="btn btn-outline"><DynamicIcon name="Mail" size={16} style={{ marginRight: '8px' }} /> {t('about.actions.email_us')}</a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
