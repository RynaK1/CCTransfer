function transitionPage(classNameToShow) {
  let arr = [];
  arr.push(document.querySelector('.js-landing-page'));
  arr.push(document.querySelector('.js-search-page'));
  arr.push(document.querySelector('.js-result-page'));

  arr.forEach(page => {
    if(page.className.includes(classNameToShow)) {
      page.style.display = 'block';
    }
    else if(page.style.display != 'none') {
      page.style.display = 'none';
    }
  });
}