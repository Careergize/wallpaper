import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const slides = [
  { image: '/hero.jpg', pattern: 'aranya', name: 'Aranya', category: 'Botanical', eyebrow: 'THE BOTANICAL EDIT', title: <>A little wild.<br/>A lot of wonderful.</>, description: 'Bring the outside in. Discover wallpapers that turn everyday spaces into your favourite places.', button: 'Explore the collection' },
  { image: '/room.jpg', pattern: 'gul', name: 'Gul', category: 'Floral', eyebrow: 'LET YOUR WALLS BLOOM', title: <>A fresh chapter.<br/>In full bloom.</>, description: 'Expressive florals and warm, earthy colours. A little everyday romance, from wall to wall.', button: 'Discover floral wallpapers' },
  { image: '/bedroom.jpg', pattern: 'neer', name: 'Neer', category: 'Textures', eyebrow: 'THE QUIETER SIDE OF BEAUTIFUL', title: <>Slow mornings.<br/>Softer surroundings.</>, description: 'Tactile textures and calming tones. Make a little space for the art of slowing down.', button: 'Explore the texture edit' },
  { image: '/detail.jpg', pattern: 'rekha', name: 'Rekha', category: 'Geometric', eyebrow: 'A NEW PERSPECTIVE', title: <>Beautiful rhythm.<br/>Endless possibility.</>, description: 'Thoughtful lines, timeless forms. Find the pattern that brings your whole room together.', button: 'Find your pattern' },
];
const frames = [slides[slides.length - 1], ...slides, slides[0]];

export default function HeroSlider({ onShop, suspended }) {
  const [position, setPosition] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [moving, setMoving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const hero = useRef(null);
  const touch = useRef(null);
  const lock = useRef(false);
  const current = (position - 1 + slides.length) % slides.length;
  const stopped = paused || hovered || focused || !visible || reduced || suspended;
  const go = (next) => {
    if (lock.current || next === position) return;
    lock.current = !reduced;
    setAnimate(!reduced);
    setMoving(!reduced);
    setPosition(next);
    if (reduced) setPosition(next === 0 ? slides.length : next === slides.length + 1 ? 1 : next);
  };
  const finish = (event) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
    setAnimate(false);
    setPosition(p => p === 0 ? slides.length : p === slides.length + 1 ? 1 : p);
    lock.current = false;
    setMoving(false);
  };
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReduced(media.matches); lock.current = false; setMoving(false); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(hero.current);
    const update = () => setVisible(!document.hidden && hero.current.getBoundingClientRect().bottom > 0);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  useEffect(() => {
    if (stopped || moving) return;
    const timer = setTimeout(() => go(position + 1), 6000);
    return () => clearTimeout(timer);
  }, [position, stopped, moving]);

  return <section ref={hero} className={`hero animated-hero ${stopped ? 'slider-stopped' : ''}`} aria-label="Featured wallpaper collections" aria-roledescription="carousel"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
    onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); go(position + (e.key === 'ArrowRight' ? 1 : -1)); } }}
    onTouchStart={e => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
    onTouchEnd={e => { if (!touch.current) return; const dx = touch.current.x - e.changedTouches[0].clientX; const dy = touch.current.y - e.changedTouches[0].clientY; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(position + (dx > 0 ? 1 : -1)); touch.current = null; }}>
    <div className={`hero-track ${animate ? 'is-animating' : ''}`} style={{ transform: `translate3d(-${position * 100}%,0,0)` }} onTransitionEnd={finish}>
      {frames.map((item, index) => <div key={index} className={`hero-frame ${position === index ? 'is-current' : ''}`} role="group" aria-roledescription="slide" aria-label={`${(index - 1 + slides.length) % slides.length + 1} of ${slides.length}: ${item.name}`} aria-hidden={position !== index} inert={position !== index ? true : undefined}>
        <img className="hero-image" src={item.image} alt={`${item.name} collection inspiration in a naturally styled interior`} fetchPriority={index === 1 ? 'high' : 'auto'}/>
        <div className="hero-shade"/>
        <div className="hero-content"><div className="eyebrow light"><span/>{item.eyebrow}</div><h1>{item.title}</h1><p>{item.description}</p><button className="button cream" onClick={() => onShop(item.category)}>{item.button}<ArrowUpRight size={18}/></button></div>
        <button className="hero-wallpaper" onClick={() => onShop(item.category)} aria-label={`Shop ${item.name} wallpaper`}><span className={`hero-swatch ${item.pattern}`}/><span><small>THE FEATURED WALLPAPER</small><strong>{item.name}</strong><span>Explore the design <ArrowUpRight size={12}/></span></span></button>
      </div>)}
    </div>
    <div className="hero-bottom"><div className="slide-count"><span className="current-count">0{current + 1}</span><span>/ 0{slides.length}</span><div className="slide-lines">{slides.map((item, index) => <button key={item.name} aria-label={`Show ${item.name} collection`} aria-current={current === index ? 'true' : undefined} className={current === index ? 'active' : ''} onClick={() => go(index + 1)}><span key={`${position}-${index}`} className="slide-progress"/></button>)}</div></div><span className="hero-caption">A fresh perspective, from wall to wall.</span><div className="hero-arrows"><button className="icon-button slider-toggle" aria-label={paused ? 'Play slideshow' : 'Pause slideshow'} onClick={() => setPaused(!paused)}>{paused ? <Play size={14}/> : <Pause size={14}/>}</button><button className="icon-button" aria-label="Previous collection" onClick={() => go(position - 1)}><ChevronLeft size={20}/></button><button className="icon-button" aria-label="Next collection" onClick={() => go(position + 1)}><ChevronRight size={20}/></button></div></div>
  </section>;
}
