(() => {
  
  function MobileSlider(selector, visItemCount = 3) {
    this.SliderRoot = document.querySelector(selector);
    this.Wrapper = this.SliderRoot.querySelector('.slider__wrapper');
    this.List = this.SliderRoot.querySelector('.slider__items');
    this.Items = this.SliderRoot.querySelectorAll('.slider__item');
    this.ItemWidth = this.Items[0].offsetWidth + parseInt(getComputedStyle(this.Items[0]).marginLeft) + parseInt(getComputedStyle(this.Items[0]).marginRight);
    this.MaxWidth = this.ItemWidth * this.Items.length;
    this.ItemIndex = 0; this.PosInit = 0; 
    this.PosX1 = 0; this.PosX2 = 0;
    this.PosFinal = 0;
    this.AllowSwipe = true; this.Transition = true;
    this.visibleItemsCount = visItemCount;
    this.LastTrf = (this.Items.length - this.visibleItemsCount) * this.ItemWidth;
    this.PosThreshold = this.Items[0].offsetWidth * 0.35;
    this.TrfRegExp = /([-0-9.]+(?=px))/;

    MobileSlider.Initialize(this);
  };

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
      return;
    }
    if (currentIndex <= 0) {
      this.List.style.transform = 'translate3d(0px, 0px, 0px)';
      return;
    }
    this.List.style.transform = 'translate3d(-' + (currentIndex * this.ItemWidth).toString() + 'px, 0px, 0px)';
  };

  MobileSlider.prototype.SwipeStart = function() {
    let event = this.getEvent();
    this.AllowSwipe = true;
    this.Transition = true
    this.PosInit = this.PosX1 = event.clientX;
    this.List.style.transition = '';

    document.addEventListener('touchmove', this.SwipeAction.bind(this));
    document.addEventListener('mousemove', this.SwipeAction.bind(this));
    document.addEventListener('touchend', this.SwipeEnd.bind(this));
    document.addEventListener('mouseup', this.SwipeEnd.bind(this));
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

    document.removeEventListener('touchmove', this.SwipeAction);
    document.removeEventListener('mousemove', this.SwipeAction);
    document.removeEventListener('touchend', this.SwipeEnd);
    document.removeEventListener('mouseup', this.SwipeEnd);

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

  new MobileSlider('.slider');
}) ()