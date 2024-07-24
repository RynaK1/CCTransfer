let db;
(async function() {
  fetch('backend/databases/articulations.json')
  .then(response => response.json())
  .then(data => {
      db = new Map(Object.entries(data)); // Store the entire JSON data in the db variable
      console.log('Database loaded'); // Log the data to the console for verification
  })
  .catch(error => {
      console.error('Error loading data:');
  });
})();


let clickedArtics = JSON.parse(localStorage.getItem('clickedArtics')) || [];
let clickedArticsBack = JSON.parse(localStorage.getItem('clickedArticsBack')) || [];
printAddedMajors(clickedArtics, clickedArticsBack);


const collegeBtn = document.querySelector('.js-deanza-btn');
collegeBtn.addEventListener('click', () =>  {
  resultdb = trimDatabaseToCollege('DeAnza');
  createUniList(resultdb);
  transitionPage('js-search-page');
});


function createUniList(db) {
  let uniList = document.querySelector('.js-dropdown-uni-list');
  db.forEach((majorArtics, uniName) => {
    const uniBtn = document.createElement('button');
    uniBtn.className = `btn js-${uniName}-btn`;
    uniBtn.textContent = getUniNameFromTable(uniName);
    uniList.appendChild(uniBtn);
    createMajorList(uniBtn, majorArtics, uniName);
  });
  let endBtn = document.createElement('button');
  endBtn.className = 'end-btn end-btn-r';
  endBtn.textContent = 'More to come...';
  uniList.appendChild(endBtn);
}


function createMajorList(uniBtn, majorArtics, uniName) {
  majorList = document.querySelector('.js-dropdown-major-list');
  uniBtn.addEventListener('click', () => {
    let titleMajors = document.querySelector('.js-title-majors');
    titleMajors.innerHTML = `Articulated majors: ${getUniNameFromTable(uniName)}`;
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
    let clickedArtics = JSON.parse(localStorage.getItem('clickedArtics')) || [];
    uniAndMajor = getUniNameFromTable(uniName) + ': ' + majorBtn.textContent;
    if(clickedArtics.includes(uniAndMajor)) {
      console.log("Major already added");
    }
    else if(clickedArtics.length >= 15) {
      console.log("Maximum length met");
    }
    else {
      saveToStorage('clickedArtics', uniAndMajor);
      saveToStorage('clickedArticsBack', `${uniName}-${majorBtn.textContent}`);
      clickedArtics = JSON.parse(localStorage.getItem('clickedArtics')) || [];
      createDeleteMajorBtn(uniAndMajor, `${uniName}-${majorBtn.textContent}`);
    }
  });
}


function createDeleteMajorBtn(uniAndMajor, className) {
  addedMajorsList = document.querySelector('.js-added-majors');
  const addedMajorBtn = document.createElement('button');
  addedMajorBtn.className = `del-btn ${className}`;
  addedMajorBtn.textContent = uniAndMajor;
  addedMajorBtn.addEventListener('click', function() {
    delFromStorage('clickedArtics', uniAndMajor);
    delFromStorage('clickedArticsBack', className);
    this.remove();
  });

  addedMajorsList.append(addedMajorBtn);
}


function printAddedMajors(clickedArtics, clickedArticsBack) {
  clickedArtics.forEach((artic, index) => {
    const articBack = clickedArticsBack[index];
    createDeleteMajorBtn(getUniNameFromTable(artic), articBack);
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


function getUniNameFromTable(tableName) {
  index = tableName.indexOf('_', tableName.indexOf('_') + 1);
  schoolName = tableName.slice(index + 1);
  schoolName = schoolName.replace(/0/g, ',').replace(/\_/g, ' ');
  schoolName = schoolName.replace(/_*$/, '');
  return schoolName;
}


function saveToStorage(key, word) {
  let arr = JSON.parse(localStorage.getItem(key)) || [];
  if (arr.includes(word)) {
    arr = arr.filter(elem => {
      return elem !== word;
    });
  } else {
    arr.push(word);
  }
  localStorage.setItem(key, JSON.stringify(arr));
}


function delFromStorage(key, elem) {
  let arr = JSON.parse(localStorage.getItem(key)) || '[]';
  const index = arr.indexOf(elem);

  if (index > -1) {
      arr.splice(index, 1);
      localStorage.setItem(key, JSON.stringify(arr));
      console.log(`Deleted ${elem} from ${key}`);
  } 
  else {
      console.log(`${elem} not found in ${key}`);
  }
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
    transitionPage('js-result-page');
    console.log(findOptimalCourseSet(result));
  }
});


function parseCustomArray(str) {
  str = str.replace(/^"|"$/g, '');
  try {
    return JSON.parse(str.replace(/'/g, '"'));
  } catch (e) {
    console.error("Error parsing path:", str);
    return [];
  }
}

function findOptimalCourseSet(data) {
  const parsedData = data.map(item => ({
    ...item,
    paths: parseCustomArray(item.paths)
  })).filter(item => item.paths.length > 0);

  if (parsedData.length === 0) {
    console.error("No valid majors with non-empty paths found");
    return {
      optimalPath: [],
      satisfiedMajors: [],
      courseOverlapList: [],
      allMajorsAndNotes: data.map(item => ({ major: item.id, notes: item.notes })),
      skippedMajors: data.map(item => item.id)
    };
  }

  let optimalSet = {
    courses: new Set(),
    majors: [],
    pathCombination: []
  };

  function backtrack(index, currentSet) {
    if (index === parsedData.length) {
      if (currentSet.courses.size < optimalSet.courses.size || optimalSet.courses.size === 0) {
        optimalSet = JSON.parse(JSON.stringify(currentSet));
        optimalSet.courses = new Set(currentSet.courses);
      }
      return;
    }

    const major = parsedData[index];
    for (const path of major.paths) {
      const newCourses = new Set(currentSet.courses);
      path.forEach(course => newCourses.add(course));

      if (newCourses.size < optimalSet.courses.size || optimalSet.courses.size === 0) {
        const newSet = {
          courses: newCourses,
          majors: [...currentSet.majors, major.id],
          pathCombination: [...currentSet.pathCombination, { major: major.id, path }]
        };
        backtrack(index + 1, newSet);
      }
    }
  }

  backtrack(0, { courses: new Set(), majors: [], pathCombination: [] });
  // Count course requirements for the optimal path
  const courseRequirements = {};
  optimalSet.pathCombination.forEach(({ major, path }) => {
    path.forEach(course => {
      if (!courseRequirements[course]) {
        courseRequirements[course] = { count: 0, majors: [] };
      }
      courseRequirements[course].count++;
      if (!courseRequirements[course].majors.includes(major)) {
        courseRequirements[course].majors.push(major);
      }
    });
  });

  const courseOverlapList = Object.entries(courseRequirements).map(([course, data]) => ({
    course,
    requiredByCount: data.count,
    majors: data.majors
  }));

  const allMajorsAndNotes = data.map(item => ({
    major: item.id,
    notes: item.notes
  }));

  return {
    optimalPath: Array.from(optimalSet.courses),
    satisfiedMajors: optimalSet.majors,
    courseOverlapList,
    allMajorsAndNotes,
    skippedMajors: data.filter(item => parseCustomArray(item.paths).length === 0).map(item => item.id)
  };
}