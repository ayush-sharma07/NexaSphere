import { useEffect } from 'react';

/**
 * Custom React hook to manage IntersectionObserver animations or actions on DOM elements.
 * 
 * @param {string} selector - CSS selector to match target elements.
 * @param {string} classNameToAdd - CSS class name to append upon intersection.
 * @param {Object} options - IntersectionObserver configuration options.
 */
export default function useIntersectionObserver(selector, classNameToAdd = 'fired', options = { threshold: 0, rootMargin: '0px 0px -15px 0px' }) {
  useEffect(() => {
    const targets = document.querySelectorAll(selector);
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(classNameToAdd);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [selector, classNameToAdd, JSON.stringify(options)]);
}
