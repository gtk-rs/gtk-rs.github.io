---
---
$(document).ready(() => {
  let elem = $('.featured-apps');
  if (elem) {
    elem.slick({
      autoplay: true,
      autoplaySpeed: 5000,
      speed: 1000,
      initialSlide:
        Math.floor(
          Math.random() *
          {{ site.data.projects | where: "featured",true | size }}
        )
    });
  }
});
