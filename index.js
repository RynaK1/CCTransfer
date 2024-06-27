let db;
(async function() {
  fetch('databases/articulations.json')
  .then(response => response.json())
  .then(data => {
      db = new Map(Object.entries(data)); // Store the entire JSON data in the db variable
      console.log(typeof db);
      console.log('Database loaded'); // Log the data to the console for verification
  })
  .catch(error => {
      console.error('Error loading data:');
  });
})();


let clickedArtics = JSON.parse(localStorage.getItem('clickedArtics')) || [];
printAddedMajors(clickedArtics);


const collegeBtn = document.querySelector('.js-deanza-btn');
collegeBtn.addEventListener('click', () =>  {
  resultdb = trimDatabaseToCollege('DeAnza');
  createUniList(resultdb);
  postPopupTransition();
});


function createUniList(db) {
  uniList = document.querySelector('.js-dropdown-uni-list');
  db.forEach((majorArtics, uniName) => {
    const uniBtn = document.createElement('button');
    uniBtn.className = `btn js-${uniName}-btn`;
    uniBtn.textContent = getUniNameFromTable(uniName);
    uniList.appendChild(uniBtn);
    createMajorList(uniBtn, majorArtics, uniName);
  });
}


function createMajorList(uniBtn, majorArtics, uniName) {
  majorList = document.querySelector('.js-dropdown-major-list');
  uniBtn.addEventListener('click', () => {
    majorList.innerHTML = '';
    majorArtics.forEach(majorArtic => {
      const majorBtn = document.createElement('button');
      majorBtn.className = 'btn';
      majorBtn.textContent = majorArtic.id;
      majorList.append(majorBtn);
      addToAddedMajors(majorBtn, uniName);
    });
  });
}


function addToAddedMajors(majorBtn, uniName) {
  majorBtn.addEventListener('click', () => {
    saveToStorage('clickedArtics', getUniNameFromTable(uniName) + ': ' + majorBtn.textContent);
      saveToStorage('clickedArticsBack', `${uniName}-${majorBtn.textContent}`);
      let clickedArtics = JSON.parse(localStorage.getItem('clickedArtics')) || [];
      printAddedMajors(clickedArtics);
  });
}


function trimDatabaseToCollege(college) {
  let filtereddb = new Map();
  db.forEach((value, key) => {
    if(key.includes(college)) {
      filtereddb.set(key, value);
    }
  })

  return filtereddb;
}


function postPopupTransition() {
  pageContents = document.querySelector('.js-page-contents');
  pageContents.style.display = "grid";
  
  popup = document.querySelector('.js-popup');
  popup.style.backgroundColor = "rgba(0, 0, 0, 0)";
  popup.style.display = "none";

  collegeTitle = document.querySelector('.js-college-title');
  collegeTitle.style.display = "block";
}


function getUniNameFromTable(tableName) {
  index = tableName.indexOf('_', tableName.indexOf('_') + 1);
  schoolName = tableName.slice(index + 1);
  schoolName = schoolName.replace(/0/g, ',').replace(/\_/g, ' ');
  schoolName = schoolName.replace(/_*$/, '');
  return schoolName;
}


function saveToStorage(key, word) {
  let clickedArtics = JSON.parse(localStorage.getItem(key)) || [];
  if (clickedArtics.includes(word)) {
    clickedArtics = clickedArtics.filter((artic) => {
      return artic !== word;
    });
  } else {
    clickedArtics.push(word);
  }
  localStorage.setItem(key, JSON.stringify(clickedArtics));
}


function printAddedMajors(majors) {
  addedMajors = document.querySelector('.js-added-majors');
  html = '';
  majors.forEach(major => {
    html += `<div>${major}</div>`;
  });
  addedMajors.innerHTML = html;
}


optimizedCourses = document.querySelector('.js-optimized-courses-btn');
optimizedCourses.addEventListener('click', () => {
  let clickedArticsBack = JSON.parse(localStorage.getItem('clickedArticsBack')) || [];
  if(clickedArticsBack.length != 0) {
    let result = [];
    clickedArticsBack.forEach(articBack => {
      const names = articBack.split("-");
      result.push(db.get(names[0]).find(major => major.id === names[1]));
    });

    console.log(result);
    //CALCULATE HERE
  }
});


storageClear = document.querySelector('.js-storage-clear');
storageClear.addEventListener('click', () => {
  localStorage.clear();
  printAddedMajors([]);
});


function deleteAddedMajor() {

}