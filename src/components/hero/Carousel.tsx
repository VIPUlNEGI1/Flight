
"use client";

import React, { useEffect, useRef, useState } from 'react';
import './Carousel.css'; // Import the CSS file

const initialImages = [ // Renamed from 'images' to 'initialImages' to avoid conflict
  { name: 'Australia', image: 'https://media.kensingtontours.com/image/upload/g_auto,f_auto,q_auto,w_1366,h_768,c_fill/kt/live/pictures/asia/india-area/maldives/baa-atoll/hotel/the-nautilus/the-retreat-the-nautilus-baa-atoll-maldives-tour', hint: 'australia maldives resort' },
  { name: 'Malaysia', image: 'https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2024/10/07091202/cobia-island-fiji-1-1600x900.jpeg', hint: 'malaysia fiji island' },
  { name: 'England', image: 'https://www.nordicvisitor.com/images/switzerland/view-of-the-matterhorn-with-hikers-switzerland.jpg', hint: 'england switzerland mountains' },
  { name: 'FIJI', image: 'https://cdn.britannica.com/49/102749-050-B4874C95/Kuala-Lumpur-Malaysia.jpg', hint: 'fiji kuala lumpur' },
  { name: 'Scotland', image: 'https://www.zicasso.com/static/cf66998700d616f477da92679d4b6a93/304cc/cf66998700d616f477da92679d4b6a93.jpg', hint: 'scotland castle' },
];


const Carousel = () => {
  const [items, setItems] = useState(initialImages);
  const [transition, setTransition] = useState('');
  const timerRef = useRef<NodeJS.Timeout | undefined>();
  const animationRef = useRef<HTMLDivElement | null>(null);
  
  const timeRunning = 2000; // Animation duration
  const timeAutoNext = 5000; // Auto slide interval

  const resetAnimation = () => {
    if (animationRef.current) {
      animationRef.current.classList.remove('animate');
      void animationRef.current.offsetWidth; // Trigger reflow to restart animation
      animationRef.current.classList.add('animate');
    }
  };

  const showSlider = (type: 'next' | 'prev') => {
    setItems(currentItems => {
      let updatedItems = [...currentItems];
      if (type === 'next') {
        updatedItems.push(updatedItems.shift()!);
      } else {
        updatedItems.unshift(updatedItems.pop()!);
      }
      return updatedItems;
    });
    setTransition(type); // This class helps with item specific animations

    if (timerRef.current) {
        clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setTransition('');
    }, timeRunning);

    resetAnimation();
  };

  useEffect(() => {
    const auto = setInterval(() => {
      showSlider('next');
    }, timeAutoNext);
    
    // Initial animation reset
    resetAnimation();

    return () => {
        clearInterval(auto);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed 'items' to prevent interval recreation on items change. Initial resetAnimation is fine here.

  return (
    <>
    {/* This div wraps the carousel. Its background is handled by HeroSection.tsx */}
    <div className='carouselContainer' > 
        <div className={`carousel ${transition}`}>
        <div className="list">
            {items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="item" style={{ backgroundImage: `url(${item.image})` }} data-ai-hint={item.hint || "carousel image"}>
                <div className="content">
                {/* <div className="title">Your Title Here</div>  User's CSS has .title but not used in JSX */}
                <div className="name">{item.name}</div>
                <div className="des">
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officiis culpa similique
                    consequuntur, reprehenderit dicta repudiandae.
                </div>
                <div className="btn">
                    <button>See More</button>
                </div>
                </div>
            </div>
            ))}
        </div>

        <div className="arrows">
            <button className="prev" onClick={() => showSlider('prev')}>
            {'<'}
            </button>
            <button className="next" onClick={() => showSlider('next')}>
            {'>'}
            </button>
        </div>

        {/* The 'animate' class will be toggled by JS to trigger 'runningTime' keyframes defined in Carousel.css */}
        <div className="timeRunning" ref={animationRef}></div> 
        </div>
    </div>
    </>
  );
};

export default Carousel;

    