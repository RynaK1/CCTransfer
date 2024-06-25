let db;
(async function() {
  fetch('databases/articulations.json')
  .then(response => response.json())
  .then(data => {
      db = data; // Store the entire JSON data in the db variable
      db = new Map(Object.entries(db));
      console.log('Database loaded'); // Log the data to the console for verification
  })
  .catch(error => {
      console.error('Error loading data:');
  });
})();


//************************************************************************ */
printBtn = document.querySelector('.js-print-database'); 
printBtn.addEventListener('click', () => {
  console.log(db);
})
//************************************************************************ */


let clickedArtics = JSON.parse(localStorage.getItem('clickedArtics')) || [];
printAddedMajors(clickedArtics);

const collegeBtn = document.querySelector('.js-deanza-btn');
collegeBtn.addEventListener('click', () =>  {
  resultdb = trimDatabaseToCollege('DeAnza');
  uniContents = document.querySelector('.js-dropdown-uni-contents');
  resultdb.forEach((articValue, articKey) => {
    const uniBtn = document.createElement('button');
    uniBtn.className = `btn js-${articKey}-btn`;
    uniBtn.textContent = getUniNameFromTable(articKey);
    uniBtn.addEventListener('click', () => {
      majorContents = document.querySelector('.js-dropdown-major-contents');
      majorContents.innerHTML = '';

      let max = articValue.length;
      for(let i=0; i<max; i++) {
        const majorBtn = document.createElement('button');
        majorBtn.className = 'btn';
        majorBtn.textContent = articValue[i].id;
        majorBtn.addEventListener('click', () => {
          saveToStorage('clickedArtics', getUniNameFromTable(articKey) + ': ' + articValue[i].id);
          saveToStorage('clickedArticsBack', `${articKey}-${articValue[i].id}`);
          let clickedArtics = JSON.parse(localStorage.getItem('clickedArtics')) || [];
          printAddedMajors(clickedArtics);
        })

        majorContents.appendChild(majorBtn);
      }
    });
    
    uniContents.appendChild(uniBtn);
  });

  postPopupTransition();
});


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
    clickedArticsBack.forEach(articBack => {
      const names = articBack.split("-");
      result = getInfoFromTable(names[0], names[1]);
      console.log(names[0] + " " + names[1]);
      //use sql to open table (name[0]) and get row (name[1])
    });
  }
});


function getInfoFromTable(tableName, major) {
  query = `SELECT * FROM ${tableName}`;
  result = queryDatabase(query);
  return result;
}


//*************************************************************************

storagePrint = document.querySelector('.js-storage-print');
storagePrint.addEventListener('click', () => {
  for(let i=0; i< localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(key, localStorage.getItem(key));
  }
});

storageClear = document.querySelector('.js-storage-clear');
storageClear.addEventListener('click', () => {
  localStorage.clear();
});