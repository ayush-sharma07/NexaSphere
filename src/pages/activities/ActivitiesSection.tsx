import { type MouseEvent, type ReactNode, useEffect, useRef } from 'react';
import { activities } from '../../data/activitiesData';
import type { ActivityKey, ActivitySummary } from '../../types/activities';
import * as LucideIcons from 'lucide-react';

function DynamicIcon({ name, ...props }: { name: string; [key: string]: any }) {
  const Icon = (LucideIcons as any)[name];
  return Icon ? <Icon {...props} /> : null;
}

const ANTI_GRAVITY_DELAYS = [0, -2.1, -4.2, -1.0, -3.3, -5.5, -0.7, -6.1];
const TILT_ANGLE = 16;
const TILT_SCALE = 1.04;
const CLICK_SCALE_DELAY = 130;
const NAVIGATION_DELAY = 160;

function ActivityCard({
  a,
  idx,
  onNav,
}: {
  a: ActivitySummary;
  idx: number;
  onNav: (type: 'activity', title: ActivityKey) => void;
}): ReactNode {
  const ref      = useRef<HTMLDivElement | null>(null);
  const agDelay  = ANTI_GRAVITY_DELAYS[idx % ANTI_GRAVITY_DELAYS.length];

  const onMove = (e: MouseEvent<HTMLDivElement>): void => {
    const c = ref.current; if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - .5;
    const y = (e.clientY - rect.top)  / rect.height - .5;
    /* pause float while tilting */
    c.style.animationPlayState = 'paused';
    c.style.transform = `translateY(-4px) scale(1.02)`;
  };

  const onLeave = (): void => {
    const c = ref.current; if (!c) return;
    c.style.transform = '';
    c.style.animationPlayState = '';
  };

  const click = (): void => {
    if (a.comingSoon) return;
    const c = ref.current;
    if (c) { c.style.transform = 'scale(.92)'; setTimeout(() => { c.style.transform = ''; }, 130); }
    setTimeout(() => onNav('activity', a.title as ActivityKey), 160);
  };

  return (
    <div
      ref={ref}
      className="activity-card shimmer mag-card"
      style={{
        animationDelay: `${ANTI_GRAVITY_DELAYS[idx % ANTI_GRAVITY_DELAYS.length]}s`,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={click}
    >
      <div className="card-accent-line" />
      <div className="card-num">{String(idx + 1).padStart(2, '0')}</div>
      <div className="activity-icon pop-in fired" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}><DynamicIcon name={a.icon} size={32} /></div>
      <div className="activity-title">{a.title}</div>
      <p className="activity-desc">{a.description}</p>
      {a.comingSoon ? (
        <div className="activity-cta" style={{ color: 'var(--t3)', cursor: 'default' }}><span>Coming Soon</span></div>
      ) : (
        <div className="activity-cta"><span>Explore</span><span><DynamicIcon name="ArrowRight" size={14} /></span></div>
      )}
      <div className="corner-tl"/><div className="corner-br"/>
    </div>
  );
}

interface ActivitiesSectionProps {
  onNavigate: (type: 'activity', title: ActivityKey) => void;
}

export default function ActivitiesSection({ onNavigate }: ActivitiesSectionProps): ReactNode {
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('fired'); obs.unobserve(e.target); }
      });
    }, { threshold: .08 });
    document.querySelectorAll('#section-activities .pop-word, #section-activities .pop-in')
      .forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className="section" id="section-activities">
      <div className="container">
        <div className="reveal-stagger">
          <h2 className="section-title pop-word">Our Activities</h2>
          <p className="section-subtitle pop-in" style={{ animationDelay: '.1s' }}>
            Click an activity to explore sessions &amp; events
          </p>
        </div>
        <div className="activity-grid cin-container">
          {activities.map((a, i) => (
            <ActivityCard key={a.id} a={a} idx={i} onNav={onNavigate} />
          ))}
        </div>
      </div>
    </section>
  );
}
