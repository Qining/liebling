import $ from 'jquery';
import mediumZoom from 'medium-zoom';
import fitvids from 'fitvids';
import shave from 'shave';
import Swiper, { Navigation, A11y } from 'swiper';
import {
  isMobile,
  adjustImageGallery,
  managePostImages,
  makeImagesZoomable
} from './helpers';

import tocbot from 'tocbot';

let $aosWrapper = null;
let $progressCircle = null;
let lastScrollingY = window.pageYOffset;
let lastWindowHeight = 0;
let lastDocumentHeight = 0;
let circumference = 0;
let isTicking = false;

const onScrolling = () => {
  lastScrollingY = window.pageYOffset;
  requestTicking();
};

const adjustShare = timeout => {
  if (!isMobile('1023px')) {
    $('body').removeClass('share-menu-displayed');
  } else {
    $('body').addClass('share-menu-displayed');
    setTimeout(() => {
      $aosWrapper.removeAttr('data-aos');
    }, timeout);
  }
};

const onResizing = () => {
  setHeights();
  adjustShare(100);

  setTimeout(() => {
    setCircleStyles();
    requestTicking();
  }, 200);
};

const requestTicking = () => {
  if (!isTicking) {
    requestAnimationFrame(updating);
  }

  isTicking = true;
};

const updating = () => {
  const progressMax = lastDocumentHeight - lastWindowHeight;
  const percent = Math.ceil((lastScrollingY / progressMax) * 100);

  if (percent <= 100) {
    setProgress(percent);
  }

  isTicking = false;
};

const setHeights = () => {
  lastWindowHeight = window.innerHeight;
  lastDocumentHeight = $(document).height();
};

const setCircleStyles = () => {
  const svgWidth = $progressCircle.parent().width();
  const radiusCircle = svgWidth / 2;
  const borderWidth = isMobile() ? 2 : 3;

  $progressCircle.parent().attr('viewBox', `0 0 ${svgWidth} ${svgWidth}`);
  $progressCircle.attr('stroke-width', borderWidth);
  $progressCircle.attr('r', radiusCircle - (borderWidth - 1));
  $progressCircle.attr('cx', radiusCircle);
  $progressCircle.attr('cy', radiusCircle);

  circumference = radiusCircle * 2 * Math.PI;

  $progressCircle[0].style.strokeDasharray = `${circumference} ${circumference}`;
  $progressCircle[0].style.strokeDashoffset = circumference;
};

const setProgress = percent => {
  if (percent <= 100) {
    const offset = circumference - (percent / 100) * circumference;
    $progressCircle[0].style.strokeDashoffset = offset;
  }
};

const prepareProgressCircle = () => {
  $progressCircle = $('.js-progress');

  setHeights();
  setCircleStyles();
  updating();

  setTimeout(() => {
    $progressCircle.parent().css('opacity', 1);
  }, 300);
};

$(() => {
  $aosWrapper = $('.js-aos-wrapper');
  const $scrollButton = $('.js-scrolltop');
  const $recommendedSlider = $('.js-recommended-slider');

  fitvids('.js-post-content');

  adjustImageGallery();
  adjustShare(1000);

  if ($recommendedSlider.length > 0) {
    const recommendedSwiper = new Swiper('.js-recommended-slider', {
      modules: [Navigation, A11y],
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      slidesPerView: 1,
      allowTouchMove: true,
      loop: true,
      a11y: true,
      breakpoints: {
        720: {
          slidesPerView: 2,
          allowTouchMove: true,
          loop: true
        },
        1024: {
          slidesPerView: 3,
          allowTouchMove: false,
          loop: false
        }
      },
      on: {
        init: function() {
          shave('.js-article-card-title', 100);
          shave('.js-article-card-title-no-image', 250);
        }
      }
    });
  }

  shave('.js-article-card-title', 100);
  shave('.js-article-card-title-no-image', 250);

  $scrollButton.on('click', () => {
    $('html, body').animate(
      {
        scrollTop: 0
      },
      500
    );
  });

  managePostImages($);
  makeImagesZoomable($, mediumZoom);

  window.addEventListener('scroll', onScrolling, { passive: true })
  window.addEventListener('resize', onResizing, { passive: true })

  // generate toc
  var contentSel = '.post-content-main'
  var headingSelector = 'h1, h2, h3, h4'
  var headings = document.querySelector(contentSel).querySelectorAll(headingSelector)

  if(headings.length){
    // todo: to avoid ghost bug: can't generate heading id if heading is other than English
    for (var idx = 0 ; idx< headings.length; idx++){
      var newId = headings[idx].innerHTML + '-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
      console.debug(headings[idx])
      headings[idx].setAttribute('id', newId)
    }

    tocbot.init({
      // Where to render the table of contents.
      tocSelector: '.js-toc',
      // Where to grab the headings to build the table of contents.
      contentSelector: contentSel,
      // Which headings to grab inside of the contentSelector element.
      headingSelector: headingSelector,
      // For headings inside relative or absolute positioned containers within content.
      hasInnerContainers: true,
    });
  
    tocbot.refresh()

    document.querySelector('.toc-wrapper').style.display = 'block'
  }
})

$(window).on('load', () => {
  prepareProgressCircle();
});
