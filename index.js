let db;
(async function() {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `node_modules/sql.js/dist/${file}`
    });
    const fileBuffer = await fetch('databases/articulations.db').then(res => res.arrayBuffer());
    db = new SQL.Database(new Uint8Array(fileBuffer));
    console.log('Database loaded successfully');
  } catch (error) {
    console.error('Error loading database:', error);
  }
})();


let clickedArtics = JSON.parse(localStorage.getItem('clickedArtics')) || [];
printAddedMajors(clickedArtics);

const collegeBtn = document.querySelector('.js-deanza-btn');
collegeBtn.addEventListener('click', () =>  {
  uniContents = document.querySelector('.js-dropdown-uni-contents');

  query = `
    SELECT name
    FROM sqlite_master
    WHERE type='table' AND name LIKE 'deanza%';
  `;
  result = queryDatabase(query);

  const tableNames = result[0].values.flat();
  tableNames.forEach((tableName) => {
    const uniBtn = document.createElement('button');
    uniBtn.className = `btn js-${tableName}-btn`;
    uniBtn.textContent = getUniNameFromTable(tableName);
    uniBtn.addEventListener('click', () => {
      query = `SELECT * FROM ${tableName}`;
      result = queryDatabase(query);
      
      majorContents = document.querySelector('.js-dropdown-major-contents');
      majorContents.innerHTML = '';
      result[0].values.forEach(row => {
        const majorBtn = document.createElement('button');
        majorBtn.className = 'btn';
        majorBtn.textContent = row[0];
        majorBtn.addEventListener('click', () => {
          saveToStorage('clickedArtics', getUniNameFromTable(tableName) + ': ' + row[0]);
          saveToStorage('clickedArticsBack', `${tableName}-${row[0]}`);
          let clickedArtics = JSON.parse(localStorage.getItem('clickedArtics')) || [];
          printAddedMajors(clickedArtics);
        })

        majorContents.appendChild(majorBtn);
      });
    });
    
    uniContents.appendChild(uniBtn);
  });

  postPopupTransition();
});


function postPopupTransition() {
  pageContents = document.querySelector('.js-page-contents');
  pageContents.style.display = "grid";
  
  popup = document.querySelector('.js-popup');
  popup.style.backgroundColor = "rgba(0, 0, 0, 0)";
  popup.style.display = "none";

  collegeTitle = document.querySelector('.js-college-title');
  collegeTitle.style.display = "block";
}


function queryDatabase(query) {
  result = db.exec(query);
  return result;
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