let slider = document.querySelector('.slider'),
  sliderList = slider.querySelector('.slider-list'),
  sliderTrack = slider.querySelector('.slider-track'),
  slides = slider.querySelectorAll('.slide'),
  slideWidth = slides[0].offsetWidth + parseInt(getComputedStyle(slides[0]).marginLeft) + parseInt(getComputedStyle(slides[0]).marginRight),
  maxWidth = slideWidth * slides.length,
  slideIndex = 0,
  posInit = 0,
  posX1 = 0,
  posX2 = 0,
  posY1 = 0,
  posY2 = 0,
  posFinal = 0,
  allowSwipe = true,
  transition = true,
  nextTrf = 0,
  prevTrf = 0,
  visibleItemsCount = 3,
  lastTrf = (slides.length - visibleItemsCount) * slideWidth,
  posThreshold = slides[0].offsetWidth * 0.35,
  trfRegExp = /([-0-9.]+(?=px))/,
  
  getEvent = function() {
    return (event.type.search('touch') !== -1) ? event.touches[0] : event;
  },

  slide = function() {
    if (transition) {
      sliderTrack.style.transition = 'transform .5s';
    }
    let style = sliderTrack.style.transform,
      transform = +style.match(trfRegExp)[0];
    let currentIndex = Math.abs(Math.round(transform / slideWidth));
    if (currentIndex + visibleItemsCount >= slides.length) {
      sliderTrack.style.transform = `translate3d(-${(slides.length - visibleItemsCount) * slideWidth}px, 0px, 0px)`; 
      return;
    }

    if (currentIndex <= 0) {
      sliderTrack.style.transform = `translate3d(0px, 0px, 0px)`; 
      return;
    }

    sliderTrack.style.transform = `translate3d(-${currentIndex * slideWidth}px, 0px, 0px)`; 
  },

  swipeStart = function() {
    let evt = getEvent();
    console.log(allowSwipe);
    allowSwipe = true
    if (allowSwipe) {

      transition = true;

      nextTrf = (slideIndex + 1) * -slideWidth;
      prevTrf = (slideIndex - 1) * -slideWidth;

      posInit = posX1 = evt.clientX;
      posY1 = evt.clientY;

      sliderTrack.style.transition = '';

      document.addEventListener('touchmove', swipeAction);
      document.addEventListener('mousemove', swipeAction);
      document.addEventListener('touchend', swipeEnd);
      document.addEventListener('mouseup', swipeEnd);

      sliderList.classList.remove('grab');
      sliderList.classList.add('grabbing');
    }
  },

  swipeAction = function() {

    let evt = getEvent(),
      style = sliderTrack.style.transform,
      transform = +style.match(trfRegExp)[0];

    posX2 = posX1 - evt.clientX;
    posX1 = evt.clientX;

    posY2 = posY1 - evt.clientY;
    posY1 = evt.clientY;

    // запрет ухода влево на первом слайде
    if (transform >= 0) {
      if (posInit < posX1) {
        setTransform(transform, 0);
        return;
      } else {
        allowSwipe = true;
      }
    }

      // запрет ухода вправо на последнем слайде
      if (Math.abs(transform) >= lastTrf) {
      if (posInit > posX1) {
          setTransform(transform, lastTrf);
          return;
        } else {
          allowSwipe = true;
        }
      }
      sliderTrack.style.transform = `translate3d(${transform - posX2}px, 0px, 0px)`;
      console.log(sliderTrack.style.transform);
    },

  swipeEnd = function() {
    posFinal = posInit - posX1;

    document.removeEventListener('touchmove', swipeAction);
    document.removeEventListener('mousemove', swipeAction);
    document.removeEventListener('touchend', swipeEnd);
    document.removeEventListener('mouseup', swipeEnd);

    sliderList.classList.add('grab');
    sliderList.classList.remove('grabbing');

    if (allowSwipe) {
      if (Math.abs(posFinal) > posThreshold) {
        if (posInit < posX1) {
          slideIndex--;
        } else if (posInit > posX1) {
          slideIndex++;
        }
      }

      if (posInit !== posX1) {
        allowSwipe = false;
        slide();
      } else {
        allowSwipe = true;
      }

    } else {
      allowSwipe = true;
    }

  },

  setTransform = function(transform, comapreTransform) {
    if (transform >= comapreTransform) {
      if (transform > comapreTransform) {
        sliderTrack.style.transform = `translate3d(${comapreTransform}px, 0px, 0px)`;
      }
    }
    allowSwipe = false;
  };

sliderTrack.style.transform = 'translate3d(0px, 0px, 0px)';
sliderList.classList.add('grab');

sliderTrack.addEventListener('transitionend', () => allowSwipe = true);
slider.addEventListener('touchstart', swipeStart);
slider.addEventListener('mousedown', swipeStart);

console.log(maxWidth);