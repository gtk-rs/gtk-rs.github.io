let start;
let timeoutId = null;
let isDragging = false;
let disableNextLink = false;
let carousel = document.getElementsByClassName("featured-apps")[0];
let container = carousel.children[1];
let slideWidth = container.children[0].offsetWidth;
let currentInView = Math.floor(Math.random(0) * (container.children.length - 1));

container.classList.remove("transition");
showCurrentInView();
container.classList.add("transition");

function cancelTimeout() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

function startMove(e) {
  start = (e.clientX || e.changedTouches[0].clientX) + currentInView * slideWidth;
  isDragging = true;
  container.classList.remove("transition");
  e.preventDefault();
  disableNextLink = false;
  cancelTimeout();
}

function moveInProgress(e) {
  if (isDragging === true) {
    disableNextLink = true;
    e.preventDefault();
    const x = e.clientX || e.changedTouches[0].clientX;
    container.style.transform = `translateX(${x - start}px)`;
  }
}

function endMove(e) {
  if (isDragging) {
    e.preventDefault();
    container.classList.add("transition");
    const x = e.clientX || e.changedTouches[0].clientX;
    currentInView = Math.round((x - start) * -1 / slideWidth);
    if (currentInView < 0) {
      currentInView = 0;
    } else if (currentInView >= container.children.length) {
      currentInView = container.children.length - 1;
    }
    showCurrentInView();
  }
  isDragging = false;
}

carousel.addEventListener('mousedown', startMove);
carousel.addEventListener('touchstart', startMove);

window.addEventListener('mousemove', moveInProgress);
window.addEventListener('touchmove', moveInProgress);

window.addEventListener('mouseup', endMove);
window.addEventListener('touchend', endMove);

window.ondragstart = () => {
  return false;
};
window.addEventListener('resize', () => {
  slideWidth = container.children[0].offsetWidth;
});

/* This function is used to prevent the link click when we're dragging the images. */
function checkClick() {
  if (disableNextLink === true) {
    return false;
  }
  disableNextLink = false;
}

function showCurrentInView() {
  container.style.transform = `translateX(-${currentInView * slideWidth}px)`;
}

function goTo(add, shouldCancelTimeout = true) {
  currentInView += add;
  if (currentInView < 0) {
    currentInView = container.children.length - 1;
  } else if (currentInView >= container.children.length) {
    currentInView = 0;
  }
  showCurrentInView();
  if (shouldCancelTimeout === true) {
    cancelTimeout();
  }
}

timeoutId = setTimeout(() => {
  goTo(1, false);
}, 5000);
