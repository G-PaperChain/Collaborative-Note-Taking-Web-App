import './App.css'
import Hero from './Components/Hero'
import React, { useRef, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

function App() {
  const lenis = useRef(null);

  useEffect(() => {

    lenis.current = new Lenis({
      duration: 0.5,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smooth: true,
      smoothWheel : true,
      smoothTouch: true,
    });

    const animate = (time) => {
      lenis.current.raf(time);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    return () => {
      lenis.current.destroy();
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    lenis.current.scrollTo(element);
  };

  return (
    <>
      <Hero />
    </>
  )
}

export default App