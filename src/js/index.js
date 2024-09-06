let PAGE_ARR = []; //used in: displayPage()
PAGE_ARR.push(document.getElementById('js-landing-page'));
PAGE_ARR.push(document.getElementById('js-step-one-page'));
PAGE_ARR.push(document.getElementById('js-major-page'));

let DB;
loadDatabase('./../src/articulations.json').then(result => {
  DB = result;
});
let COLLEGENAME;
let selectedSchools = [];
let selectedMajors = [];

class Dropdown {
  toggledBtns = [];
  constructor(dropdownId) {
    this.dropdown = document.getElementById(dropdownId);

    this.searchbar = document.createElement('div');
    this.searchbar.id = 'searchbar';
    this.searchbar.classList.add('searchbar');
    this.dropdown.append(this.searchbar);

    let triangle = document.createElement('div');
    triangle.classList.add('triangle');

    this.content = document.createElement('div');
    this.content.id = 'content';
    this.content.classList.add('content');
    this.dropdown.append(this.content);

    this.searchbar.append(triangle);
  }

  addBtn(id, text, func) {
    let btn = document.createElement('button');
    btn.id = id;
    btn.textContent = text;
    btn.classList.add('btn');
    this.content.append(btn);
    btn.addEventListener('click', () => func(btn));
  }

  addEndBtn() {
    let btn = document.createElement('button');
    btn.textContent = 'More to come...';
    btn.classList.add('end-btn');
    this.content.append(btn);
  }

  changeSearchBarText(text) {
    this.searchbar.insertAdjacentHTML('afterbegin', text);
  }

  setDimensions(width, height) {
    this.searchbar.style.width = width;
    this.searchbar.style.height = height;
    this.content.style.width = width;
  }

  setContentTop(space) {
    this.content.style.top = space;
  }
}


class AddedList {
  constructor(addedListId) {
    this.addedList = document.getElementById(addedListId);

    this.title = document.createElement('div');
    this.title.classList.add('title');
    this.title.textContent = 'title';
    this.addedList.append(this.title);

    this.content = document.createElement('div');
    this.content.classList.add('content');
    this.addedList.append(this.content);

    this.confirmBtn = document.createElement('button');
    this.confirmBtn.classList.add('confirm-btn');
    this.confirmBtn.textContent = 'Confirm';
    this.addedList.append(this.confirmBtn);
  }

  changeTitle(text) {
    this.title.textContent = text;
  }

  toggle(id) {
    const targetDiv = this.content.querySelector(`#${id}`);
    if(targetDiv) {
      targetDiv.remove();
    }
    else {
      let div = document.createElement('div');
      div.id = id;
      div.innerText = getUniNameFromTable(id);
      this.content.append(div);
    }

    if(this.content.querySelectorAll('div').length != 0) {
      this.addedList.style.height = '400px';
    }
    else{
      this.addedList.style.height = '0px';
    }
  }
}


landingPage();

function displayPageHTML(classNameToShow) {
  PAGE_ARR.forEach(page => {
    if(page.id.includes(classNameToShow)) {
      page.style.display = 'block';
    }
    else if(page.style.display != 'none') {
      page.style.display = 'none';
    }
  });
}

function landingPage() {
  displayPageHTML('js-landing-page');

  let dropdown = new Dropdown('js-college-dropdown');
  dropdown.changeSearchBarText('Select college...');
  //create expandability for more community colleges
  dropdown.setDimensions('360px', '60px');
  dropdown.setContentTop('58px');

  dropdown.addBtn('deanza-college', 'DeAnza College', deAnzaFunc);
  dropdown.addEndBtn();

  function deAnzaFunc(btn) {
    COLLEGENAME = 'DeAnza';
    DB = filterDatabaseToCollege(DB, COLLEGENAME);
    stepOnePage();
  }
}


function stepOnePage() {
  displayPageHTML('js-step-one-page');

  let dropdown = new Dropdown('js-uni-dropdown');
  dropdown.changeSearchBarText('Select universities...');
  dropdown.setDimensions('340px', '55px');
  dropdown.setContentTop('53px');

  DB.forEach((value, key) => {
    dropdown.addBtn(key, getUniNameFromTable(key), btnFunc);
  });
  dropdown.addEndBtn();

  let addedList = new AddedList('js-added-uni-list');
  addedList.changeTitle('Added universities:');

  function btnFunc(btn) {
    btn.classList.toggle('btn-toggled');
    addedList.toggle(btn.id);
  }
  /*
  function updateSelectUniBtn() {
    const addedUniContainer = document.getElementById('js-added-uni-container');
    const addedUniContent = document.getElementById('js-added-uni-content');
    const schools = dropdown.querySelectorAll('*');
    schools.forEach(school => {
      school.addEventListener('click', () => {
        school.classList.toggle('btn-toggled');
        
        if (selectedSchools.includes(school)) {
          selectedSchools = selectedSchools.filter(selectedSchool => selectedSchool !== school);
        } 
        else {
          selectedSchools.push(school);
        }
        updateAddedUniText(selectedSchools);
      });
    });
  
    function updateAddedUniText(selectedSchools) {
      if (selectedSchools.length == 0) {
        addedUniContainer.style.height = '0px';
      } 
      else {
        addedUniContainer.style.height = '400px';
      }
      
      addedUniContent.innerHTML = '';
      selectedSchools.forEach(school => {
        newAddedSchool = document.createElement('li');
        newAddedSchool.classList.add('added-uni');
        newAddedSchool.textContent = school.textContent;
        addedUniContent.appendChild(newAddedSchool);
      })
    }
    */
}


function stepTwoPage() {
  let currUniNum = 0;
  displayMajorDropdown(currUniNum);

  function displayMajorDropdown(num) {
    if(num > selectedSchools.size) {
      num = selectedSchools.size;
    }
  
    majorDropdown = document.getElementById('js-major-dropdown');
    const currUniName = selectedSchools[num].textContent;
    majorDropdown.children[0].children[0].textContent = currUniName;
    let majors = DB.get(getTableNameFromUni(currUniName));
    majorDropdown.children[1].innerHTML = '';
    majors.forEach(major => {
      majorBtn = document.createElement('div');
      majorBtn.classList.add('btn');
      majorBtn.textContent = major.id;
      majorDropdown.children[1].appendChild(majorBtn);
    });
  
    updateSelectedMajor();
  }
  
  previousUniBtn = document.getElementById('js-previous-uni-btn');
  previousUniBtn.addEventListener('click', () => {
    if(currUniNum != 0) {
      currUniNum -= 1;
    }
    displayMajorDropdown(currUniNum);
  });
  
  nextUniBtn = document.getElementById('js-next-uni-btn');
  nextUniBtn.addEventListener('click', () => {
    if(currUniNum != selectedSchools.length - 1) {
      currUniNum += 1;
    }
    displayMajorDropdown(currUniNum);
  });
  
  function updateSelectedMajor() {
    const majors = document.getElementById('js-major-dropdown-content').querySelectorAll('*');
    const addedMajorList = document.getElementById('js-added-major-list');
    const addedMajorContent = document.getElementById('js-added-major-content');
  
    majors.forEach(major => {
      major.addEventListener('click', () => {
        major.classList.toggle('btn-toggled');
        
        if (selectedMajors.includes(major)) {
          selectedMajors = selectedMajors.filter(selectedMajor => selectedMajor !== major);
        } 
        else {
          selectedMajors.push(major);
        }
        
        updateAddedMajorText(selectedMajors);
      });
    });
  
    function updateAddedMajorText(selectedMajors) {
      if (selectedMajors.length == 0) {
        addedMajorList.style.height = '0px';
      } 
      else {
        addedMajorList.style.height = '400px';
      }
      
      addedMajorContent.innerHTML = '';
      selectedMajors.forEach(major => {
        newAddedMajor = document.createElement('li');
        newAddedMajor.classList.add('added-uni');
        newAddedMajor.textContent = major.textContent;
        addedMajorContent.appendChild(newAddedMajor);
      })
    }
  }
}


function getUniNameFromTable(tableName) {
  index = tableName.indexOf('_', tableName.indexOf('_') + 1);
  uniName = tableName.slice(index + 1);
  uniName = uniName.replace(/0/g, ',').replace(/\_/g, ' ');
  uniName = uniName.replace(/_*$/, '');
  return uniName;
}


function getTableNameFromUni(uniName) {
  let tableName = `${COLLEGENAME}_to_`;
  uniName = uniName.replace(/ /g, '_').replace(/,/g, '0');
  tableName += uniName;
  return tableName;
}


function findDivByText(list, text) {
  return Array.from(document.querySelectorAll(`${list} div`))
    .find(div => div.textContent.trim() === text.trim());
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
    displayPageHTML('js-result-page');
    console.log(findOptimalCourseSet(result));
  }
});
*/


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