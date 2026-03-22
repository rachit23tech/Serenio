/**
 * animations.ts - Smooth animation utilities and constants
 */

import { useState, useCallback } from 'react';

// Animation duration constants
export const ANIMATION_DURATION = {
  fast: '150ms',
  normal: '250ms',
  slow: '400ms',
  page: '300ms',
  modal: '200ms',
} as const;

// Easing functions
export const EASING = {
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  bounceOut: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  slideOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// Common animation styles
export const fadeIn = {
  animation: `fadeIn ${ANIMATION_DURATION.normal} ${EASING.easeOut} forwards`,
};

export const slideUp = {
  animation: `slideUp ${ANIMATION_DURATION.normal} ${EASING.slideOut} forwards`,
};

export const slideDown = {
  animation: `slideDown ${ANIMATION_DURATION.normal} ${EASING.slideOut} forwards`,
};

export const slideLeft = {
  animation: `slideLeft ${ANIMATION_DURATION.normal} ${EASING.slideOut} forwards`,
};

export const slideRight = {
  animation: `slideRight ${ANIMATION_DURATION.normal} ${EASING.slideOut} forwards`,
};

export const scaleIn = {
  animation: `scaleIn ${ANIMATION_DURATION.normal} ${EASING.bounceOut} forwards`,
};

export const pulse = {
  animation: `pulse 2s ${EASING.easeInOut} infinite`,
};

// Hover and interaction transitions
export const hoverTransition = {
  transition: `all ${ANIMATION_DURATION.fast} ${EASING.easeOut}`,
};

export const smoothTransition = {
  transition: `all ${ANIMATION_DURATION.normal} ${EASING.easeOut}`,
};

export const springTransition = {
  transition: `all ${ANIMATION_DURATION.normal} ${EASING.spring}`,
};

// Loading and skeleton animations
export const shimmer = {
  animation: `shimmer 1.5s ${EASING.easeInOut} infinite`,
};

export const spin = {
  animation: `spin 1s linear infinite`,
};

// Page transition styles
export const pageEnter = {
  animation: `pageEnter ${ANIMATION_DURATION.page} ${EASING.easeOut} forwards`,
};

export const pageExit = {
  animation: `pageExit ${ANIMATION_DURATION.page} ${EASING.easeIn} forwards`,
};

// Modal and overlay animations
export const modalEnter = {
  animation: `modalEnter ${ANIMATION_DURATION.modal} ${EASING.easeOut} forwards`,
};

export const modalExit = {
  animation: `modalExit ${ANIMATION_DURATION.modal} ${EASING.easeIn} forwards`,
};

export const overlayEnter = {
  animation: `overlayEnter ${ANIMATION_DURATION.modal} ${EASING.easeOut} forwards`,
};

export const overlayExit = {
  animation: `overlayExit ${ANIMATION_DURATION.modal} ${EASING.easeIn} forwards`,
};

// Notification animations
export const notificationSlideIn = {
  animation: `notificationSlideIn ${ANIMATION_DURATION.normal} ${EASING.bounceOut} forwards`,
};

export const notificationSlideOut = {
  animation: `notificationSlideOut ${ANIMATION_DURATION.normal} ${EASING.easeIn} forwards`,
};

// CSS keyframes (to be added to global styles)
export const keyframes = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from { 
      opacity: 0;
      transform: translateY(-20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideLeft {
    from { 
      opacity: 0;
      transform: translateX(20px);
    }
    to { 
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideRight {
    from { 
      opacity: 0;
      transform: translateX(-20px);
    }
    to { 
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from { 
      opacity: 0;
      transform: scale(0.9);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% { 
      transform: scale(1);
      opacity: 1;
    }
    50% { 
      transform: scale(1.05);
      opacity: 0.8;
    }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes pageEnter {
    from { 
      opacity: 0;
      transform: translateY(10px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pageExit {
    from { 
      opacity: 1;
      transform: translateY(0);
    }
    to { 
      opacity: 0;
      transform: translateY(-10px);
    }
  }

  @keyframes modalEnter {
    from { 
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to { 
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes modalExit {
    from { 
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    to { 
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
  }

  @keyframes overlayEnter {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes overlayExit {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes notificationSlideIn {
    from { 
      opacity: 0;
      transform: translateX(100%);
    }
    to { 
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes notificationSlideOut {
    from { 
      opacity: 1;
      transform: translateX(0);
    }
    to { 
      opacity: 0;
      transform: translateX(100%);
    }
  }

  /* Hover effects */
  .hover-lift {
    transition: all 0.2s ease-out;
  }
  
  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .hover-scale {
    transition: all 0.15s ease-out;
  }
  
  .hover-scale:hover {
    transform: scale(1.02);
  }

  .hover-glow {
    transition: all 0.2s ease-out;
    position: relative;
  }
  
  .hover-glow:hover {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }

  /* Focus states */
  .focus-ring {
    transition: all 0.15s ease-out;
  }
  
  .focus-ring:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Loading states */
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  .dark .skeleton {
    background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
    background-size: 200% 100%;
  }

  /* Stagger animations */
  .stagger-children > * {
    opacity: 0;
    animation: slideUp 0.4s ease-out forwards;
  }

  .stagger-children > *:nth-child(1) { animation-delay: 0ms; }
  .stagger-children > *:nth-child(2) { animation-delay: 50ms; }
  .stagger-children > *:nth-child(3) { animation-delay: 100ms; }
  .stagger-children > *:nth-child(4) { animation-delay: 150ms; }
  .stagger-children > *:nth-child(5) { animation-delay: 200ms; }
  .stagger-children > *:nth-child(6) { animation-delay: 250ms; }
  .stagger-children > *:nth-child(7) { animation-delay: 300ms; }
  .stagger-children > *:nth-child(8) { animation-delay: 350ms; }
  .stagger-children > *:nth-child(9) { animation-delay: 400ms; }
  .stagger-children > *:nth-child(10) { animation-delay: 450ms; }
`;

// Hook for managing animation states
export function useAnimation(initialState = false) {
  const [isAnimating, setIsAnimating] = useState(initialState);
  const [isVisible, setIsVisible] = useState(initialState);

  const show = useCallback(() => {
    setIsVisible(true);
    setTimeout(() => setIsAnimating(true), 10);
  }, []);

  const hide = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 250);
  }, []);

  const toggle = useCallback(() => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }, [isVisible, hide, show]);

  return { isAnimating, isVisible, show, hide, toggle };
}

// Helper for stagger animations
export function getStaggerDelay(index: number, baseDelay = 50) {
  return `${index * baseDelay}ms`;
}