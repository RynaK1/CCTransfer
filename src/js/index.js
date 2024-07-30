let PAGE_ARR = []; //used in: transitionPage()
PAGE_ARR.push(document.getElementById('js-landing-page'));
PAGE_ARR.push(document.getElementById('js-school-page'));
PAGE_ARR.push(document.getElementById('js-result-page'));

let DATABASE;
loadDatabase('./../src/articulations.json').then(result => {
  DATABASE = result;
});

function transitionPage(classNameToShow) {
  PAGE_ARR.forEach(page => {
    if(page.id.includes(classNameToShow)) {
      page.style.display = 'block';
    }
    else if(page.style.display != 'none') {
      page.style.display = 'none';
    }
  });
}

 //create expandability for more community colleges
deAnzaBtn = document.getElementById('js-deanza-btn');
deAnzaBtn.addEventListener('click', () => {
  DATABASE = reduceDataToCollege(DATABASE, 'DeAnza');
  
  dropdownSchool = document.getElementById('dropdown-school');
  DATABASE.forEach((value, key) => {
    const school = document.createElement('div');
    school.textContent = (getUniNameFromTable(key));
    school.className = 'btn';
    dropdownSchool.appendChild(school);
  });
  
  transitionPage('js-school-page');
  updateSchoolDropdown();
});

function updateSchoolDropdown() {
  const button = document.getElementById('searchbar-school');
  const schools = document.getElementById('dropdown-school').querySelectorAll('*');
  const selectedOptions = new Set();

  schools.forEach(school => {
    console.log(school);
    school.addEventListener('click', () => {
      school.classList.toggle('btn-toggled');
      
      if (selectedOptions.has(school.textContent)) {
          selectedOptions.delete(school.textContent);
      } 
      else {
          selectedOptions.add(school.textContent);
      }
      
      updateButtonText();
    });
  });

  function updateButtonText() {
    if (selectedOptions.size > 0) {
      button.classList.remove('text-gray-400');
      button.classList.add('text-black');
      button.textContent = Array.from(selectedOptions).join(', ');
    } 
    else {
      button.classList.remove('text-black');
      button.classList.add('text-gray-400');
      button.textContent = 'Select universities';
    }
  }
}

//********************************* keep beyond here ******************************************/

/*
optimizedCourses = document.getElementById('js-optimized-courses-btn');
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
*/

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