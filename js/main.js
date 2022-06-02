(() => {
  function MobileSlider(selector) {
    this.SliderRoot = document.querySelector(selector);
    this.Wrapper = this.SliderRoot.querySelector('.slider__wrapper');
    this.List = this.SliderRoot.querySelector('.slider__items');
    this.Items = this.SliderRoot.querySelectorAll('.slider__item');
    this.Scroll = this.SliderRoot.querySelector('.slider__scroll');
    this.ScrollLine = this.SliderRoot.querySelector('.slider__scroll-line');
    this.MaxWidth = this.ItemWidth * this.Items.length;
    this.ItemIndex = 0; this.PosInit = 0; 
    this.PosX1 = 0; this.PosX2 = 0;
    this.PosFinal = 0;
    this.AllowSwipe = true; this.Transition = true;
    this.PosThreshold = this.Items[0].offsetWidth * 0.35;
    this.ScrollSpeed = Math.round(this.Scroll.offsetWidth / this.Items.length);
    this.TrfRegExp = /([-0-9.]+(?=px))/;
    
    this.PositioningElements();
    this.LastTrf = (this.Items.length - this.visibleItemsCount) * this.ItemWidth;
    this.ItemWidth = this.Items[0].offsetWidth + parseInt(getComputedStyle(this.Items[0]).marginLeft) + parseInt(getComputedStyle(this.Items[0]).marginRight);
    
    MobileSlider.Initialize(this);
  };

  MobileSlider.prototype.PositioningElements = function() {
    this.CurrentScrollPos = this.Scroll.offsetWidth - this.ScrollLine.offsetWidth;
    this.ScrollLine.style.right = this.CurrentScrollPos + 'px';
    
    let itemWoMargin = this.Items[0].offsetWidth;
    this.visibleItemsCount = Math.floor(this.List.offsetWidth / itemWoMargin);
    let margin = Math.round((this.List.offsetWidth - (this.visibleItemsCount * itemWoMargin)) / (this.visibleItemsCount - 1));
    
    if (this.visibleItemsCount <= 2) margin = 19
    if (margin < 19) {
      margin = 19
    } else if (margin > 65) {
      margin = 65
    }
    for (let i = 0; i < this.Items.length; i++) {
      this.Items[i].style.cssText = 'margin-right: ' + margin + 'px';
    }
  }

  MobileSlider.prototype.getEvent = function() {
    return (event.type.search('touch') !== -1) ? event.touches[0] : event;
  }

  MobileSlider.prototype.Slide = function() {
    if (this.Transition) this.List.style.transition = 'transform .5s';
    let style = this.List.style.transform,
        transform = +style.match(this.TrfRegExp)[0];
    let currentIndex = Math.abs(Math.round(transform / this.ItemWidth));
    if (currentIndex + this.visibleItemsCount >= this.Items.length) {
      this.List.style.transform = 'translate3d(-' + ((this.Items.length - this.visibleItemsCount) * this.ItemWidth).toString() + 'px, 0px, 0px)';
      this.CurrentScrollPos = 0;
      this.ScrollLine.style.right = this.CurrentScrollPos + 'px';
      return;
    }
    if (currentIndex <= 0) {
      this.List.style.transform = 'translate3d(0px, 0px, 0px)';
      this.CurrentScrollPos = this.Scroll.offsetWidth - this.ScrollLine.offsetWidth;
      this.ScrollLine.style.right = this.CurrentScrollPos + 'px';
      return;
    }
    this.List.style.transform = 'translate3d(-' + (currentIndex * this.ItemWidth).toString() + 'px, 0px, 0px)';
    this.CurrentScrollPos = this.Scroll.offsetWidth - this.ScrollLine.offsetWidth - (this.ScrollSpeed * currentIndex);
    this.ScrollLine.style.right = this.CurrentScrollPos + 'px';
  };

  MobileSlider.prototype.SwipeStart = function() {
    let event = this.getEvent();
    this.AllowSwipe = true;
    this.Transition = true
    this.PosInit = this.PosX1 = event.clientX;
    this.List.style.transition = '';

    this.SliderRoot.addEventListener('touchmove', this.SwipeAction.bind(this));
    this.SliderRoot.addEventListener('mousemove', this.SwipeAction.bind(this));
    this.SliderRoot.addEventListener('touchend', this.SwipeEnd.bind(this));
    this.SliderRoot.addEventListener('mouseup', this.SwipeEnd.bind(this));
  };

  MobileSlider.prototype.SwipeAction = function() {
    let event = this.getEvent();
    let style = this.List.style.transform,
        transform = +style.match(this.TrfRegExp)[0];
    this.PosX2 = this.PosX1 - event.clientX;
    this.PosX1 = event.clientX;
    // Запрет ухода влево на первом элементе
    if (transform >= 0) { 
      if (this.PosInit < this.PosX1) {
        this.SetTransform(transform, 0);
        return;
      } else {
        this.AllowSwipe = true;
      }
    }
    // Запрет ухода вправо на последнем элементе
    if (Math.abs(transform) >= this.LastTrf) {
      if (this.PosInit > this.PosX1) {
        this.SetTransform(transform, this.LastTrf);
        return;
      } else {
        this.AllowSwipe = true;
      }
    }
    this.List.style.transform = 'translate3d(' + (transform - this.PosX2).toString() + 'px, 0px, 0px)';
  };

  MobileSlider.prototype.SwipeEnd = function() {
    this.PosFinal = this.PosInit - this.PosX1;

    this.SliderRoot.removeEventListener('touchmove', this.SwipeAction);
    this.SliderRoot.removeEventListener('mousemove', this.SwipeAction);
    this.SliderRoot.removeEventListener('touchend', this.SwipeEnd);
    this.SliderRoot.removeEventListener('mouseup', this.SwipeEnd);

    if (this.AllowSwipe) {
      if (this.PosInit !== this.PosX1) {
        this.AllowSwipe = false;
        this.Slide();
      } else {
        this.AllowSwipe = true;
      }
    } else {
      this.AllowSwipe = true;
    }
  };

  MobileSlider.prototype.SetTransform = function(transform, compareTransform) {
    if (transform >= compareTransform) {
      if (transform > compareTransform) {
        this.List.style.transform = 'translate3d(${compareTransform}px, 0px, 0px)';
      }
    }
    this.AllowSwipe = false;
  };

  MobileSlider.Initialize = (sliderRoot) => {
    sliderRoot.List.style.transform = 'translate3d(0px, 0px, 0px)';
    sliderRoot.List.addEventListener('transitionend', () => sliderRoot.AllowSwipe = true);
    sliderRoot.SliderRoot.addEventListener('touchstart', sliderRoot.SwipeStart.bind(sliderRoot));
    sliderRoot.SliderRoot.addEventListener('mousedown', sliderRoot.SwipeStart.bind(sliderRoot));
  };
  
  Slider.prototype.PreviousElement = function (elementNumber) {
    elementNumber = elementNumber || 1;
    this.currentElement -= elementNumber;
    if (!this.loop) {
      this.currentOffset += this.elementWidth * elementNumber;
      this.sliderList.style.marginLeft = this.currentOffset + "px";
      if (this.currentElement == 0) {
        this.sliderLeftArrow.style.display = "none";
      }
      this.sliderRightArrow.style.display = "block";
    } else {
      let element,
        buffer,
        this$ = this;
      for (let i = 0; i < elementNumber; i++) {
        element = this.sliderList.lastElementChild;
        buffer = element.cloneNode(true);
        this.sliderList.insertBefore(buffer, this.sliderList.firstElementChild);
        this.sliderList.removeChild(element);
      }
      this.sliderList.style.marginLeft =
        "-" + this.elementWidth * elementNumber + "px";
      let computedStyle = window.getComputedStyle(this.sliderList).marginLeft;
      this.sliderList.style.cssText =
        "transition: margin " + this.animationSpeed + "ms ease;";
      this.sliderList.style.marginLeft = "0px";
      setTimeout(() => {
        this$.sliderList.style.cssText = "transition: none;";
      }, this.animationSpeed);
    }
  };

  Slider.prototype.NextElement = function (elementNumber) {
    elementNumber = elementNumber || 1;
    this.currentElement += elementNumber;
    if (!this.loop) {
      this.currentOffset -= this.elementWidth * elementNumber;
      this.sliderList.style.marginLeft = this.currentOffset + "px";
      if (this.currentElement == this.visibleElementsCount) {
        this.sliderRightArrow.style.display = "none";
      }
      this.sliderLeftArrow.style.display = "block";
    } else {
      let element,
        buffer,
        this$ = this;
      this.sliderList.style.cssText =
        "transition: margin " + this.animationSpeed + "ms ease;";
      this.sliderList.style.marginLeft =
        "-" + this.elementWidth * elementNumber + "px";
      setTimeout(() => {
        this$.sliderList.style.cssText = "transition: none;";
        for (let i = 0; i < elementNumber; i++) {
          element = this$.sliderList.firstElementChild;
          buffer = element.cloneNode(true);
          this$.sliderList.appendChild(buffer);
          this$.sliderList.removeChild(element);
        }
        this$.sliderList.style.marginLeft = "0px";
      }, this.animationSpeed);
    }
  };

  function Slider(sliderSelector, visElementCount = 6) {
    this.sliderRoot = document.querySelector(sliderSelector);
    this.sliderList = this.sliderRoot.querySelector(".slider__items");
    this.sliderElements = this.sliderRoot.querySelectorAll(".slider__item");
    this.sliderFirstElement = this.sliderRoot.querySelector(".slider__item");
    this.sliderLeftArrow = this.sliderRoot.querySelector(
      ".slider__arrow--left"
    );
    this.sliderRightArrow = this.sliderRoot.querySelector(
      ".slider__arrow--right"
    );
    (this.animationSpeed = 350), (this.visibleElementsCount = visElementCount);
    this.loop = false;
    Slider.Initialize(this);
  }

  Slider.Initialize = (that) => {
    that.elementCount = that.sliderElements.length;
    let elementStyle = window.getComputedStyle(that.sliderFirstElement);
    that.elementWidth =
      that.sliderFirstElement.offsetWidth +
      parseInt(elementStyle.marginLeft) +
      parseInt(elementStyle.marginRight);

    that.currentElement = 0;
    that.currentOffset = 0;

    let stTime, mvTime;
    let bgTime = getTime();
    function getTime() {
      return new Date().getTime();
    }

    if (that.elementCount <= that.visibleElementsCount) {
      that.sliderLeftArrow.style.display = "none";
      that.rightArrow.style.display = "none";
    }

    if (!that.loop) {
      that.sliderLeftArrow.style.display = "none";
      that.sliderList.style.cssText =
        "transition: margin " + that.animationSpeed + "ms ease;";
    }

    that.sliderLeftArrow.addEventListener(
      "click",
      () => {
        let fnTime = getTime();
        if (fnTime - bgTime > that.animationSpeed) {
          bgTime = fnTime;
          that.PreviousElement();
        }
      },
      false
    );
    that.sliderRightArrow.addEventListener(
      "click",
      () => {
        let fnTime = getTime();
        if (fnTime - bgTime > that.animationSpeed) {
          bgTime = fnTime;
          that.NextElement();
        }
      },
      false
    );
  };

  window.onscroll = () => {
    if (window.scrollY >= 100) {
      document.querySelector(".navbar").classList.add("navbar--black");
    } else {
      document.querySelector(".navbar").classList.remove("navbar--black");
    }
  };

  document.querySelector('.navbar__search-ico').addEventListener('click', () => {
    let searchBar = document.querySelector('.navbar__search');
    let searchInput = searchBar.querySelector('.search__input');
    let searchIco = searchBar.querySelector('.search__ico');
    if (!searchBar.classList.contains('navbar__search--active')) {
      searchBar.style.backgroundColor = '#050505';
      searchBar.style.width = '300px';
      searchIco.style.right = '10px';
      searchInput.style.cssText = 'left: 10px'
      searchInput.focus();
      searchBar.classList.add('navbar__search--active');
    } else {
      let searchRequest = searchInput.value.replace(/\s+/g, ' ').trim();
      if (searchRequest !== '') {
        let searchRequestURL = new URLSearchParams(window.location.search);
        searchRequestURL.set('s', searchRequest);
        window.location.search = searchRequestURL;
      }
    }
  });

  document.querySelector('.search__input').addEventListener('focusout', () => {
    setTimeout(() => { 
      if (document.querySelector('.navbar__ico') !== document.activeElement) {
        let searchBar = document.querySelector('.navbar__search');
        let searchInput = searchBar.querySelector('.search__input');
        let searchIco = searchBar.querySelector('.search__ico');
        searchBar.style.width = '20px';
        searchIco.style.right = '0';
        searchBar.style.backgroundColor = 'transparent';
        searchInput.style.cssText = 'right: -260px'
        searchBar.classList.remove('navbar__search--active');
      }
    }, 50);
  });

  document.querySelector('.navbar__burger').addEventListener('click', () => {
    let mobileNavigation = document.querySelector('.navmobile');
    if (!mobileNavigation.classList.contains('navmobile--active')) {
      mobileNavigation.classList.add('navmobile--active');
      mobileNavigation.style.cssText = 'right: 0';
      setTimeout(() => {
        mobileNavigation.querySelector('.navmobile__dimmer').style.cssText = 'opacity: 0.4';
      }, 250);
      mobileNavigation.focus();
    } 
  });

  document.querySelector('.navmobile__dimmer').addEventListener('focusin', () => {
    let mobileNavigation = document.querySelector('.navmobile');
    console.log(document.activeElement);
    if (mobileNavigation.classList.contains('navmobile--active') && document.activeElement !== mobileNavigation.querySelector('.navmobile__menu')
        && !mobileNavigation.querySelector('.navmobile__menu').contains(document.activeElement)) {
      mobileNavigation.classList.remove('navmobile--active');
      mobileNavigation.querySelector('.navmobile__dimmer').style.cssText = 'opacity: 0';
      setTimeout(() => {
        mobileNavigation.style.cssText = 'right: -100vw';
      }, 100)
    }
  });

  document.querySelector('.navmobile__search-link').addEventListener('click', () => {
    let searchRoot = document.querySelector('.navmobile__search');
    let navigationMenu = document.querySelector('.navmobile__menu');
    if (!searchRoot.classList.contains('navmobile__search--active')) {
    searchRoot.style.cssText = 'position: absolute; right: ' + (navigationMenu.offsetWidth - searchRoot.offsetLeft - searchRoot.offsetWidth).toString() + 'px; top: ' + searchRoot.offsetTop + 'px;';
    setTimeout(() => {
      searchRoot.style.cssText = 'position: absolute; right: 0';
      setTimeout(() => {
        searchRoot.classList.add('navmobile__search--active');
      }, 250);
    }, 1);
  } else {
    searchRoot.classList.remove('navmobile__search--active');
    setTimeout(() => {
      searchRoot.style.cssText = 'position: absolute; right: ' + (navigationMenu.offsetWidth - searchRoot.offsetLeft - searchRoot.offsetWidth).toString() + 'px; top: ' + searchRoot.offsetTop + 'px;';
      setTimeout(() => {
        searchRoot.style.cssText = '';
      }, 150)
    }, 250);
  };
  });

  let tvSlider = null,
    moviesSlider = null,
    channelsSlider = null,
    personsSlider = null;

  let ResizeComponents = () => {
      if (window.screen.availWidth >= 1600) {
        channelsSlider = new Slider(".channels", 3);
        personsSlider = new Slider(".persons", 4);
      } else if (window.screen.availWidth >=1350 && window.screen.availWidth < 1600) {
        personsSlider = new Slider(".persons", 5);
      }
      if (window.screen.availWidth >= 1350) {
        tvSlider = new Slider(".tv");
        moviesSlider = new Slider(".movies");
      } else if (window.screen.availWidth < 1350) {
        tvSlider = new MobileSlider('.tv');
        moviesSlider = new MobileSlider('.movies');
        channelsSlider = new MobileSlider('.persons');
      }
  }

  ResizeComponents();
})();
