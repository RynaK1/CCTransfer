let PAGE_ARR = []; //used in: displayPage()
PAGE_ARR.push(document.getElementById('js-landing-page'));
PAGE_ARR.push(document.getElementById('js-step-one-page'));
PAGE_ARR.push(document.getElementById('js-step-two-page'));

let DB;
loadDatabase('./../src/articulations.json').then(result => {
  DB = result;
});
let selectedSchools = [];
let selectedMajors = [];

class Dropdown {
  toggledBtns = [];
  constructor(dropdownId) {
    this.dropdown = document.getElementById(dropdownId);
    this.searchbar = this.dropdown.querySelector('.searchbar');
    this.triangle = this.searchbar.querySelector('.triangle');
    this.content = this.dropdown.querySelector('.content');
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

  addConfirmBtnListener(func) {
    this.confirmBtn.addEventListener('click', func);
  }
}


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

document.addEventListener('DOMContentLoaded', function() {
  displayPageHTML('js-landing-page');

  let dropdown = new Dropdown('js-college-dropdown');
  dropdown.changeSearchBarText('Select college...');
  //create expandability for more community colleges
  dropdown.setDimensions('360px', '60px');
  dropdown.setContentTop('58px');

  dropdown.addBtn('deanza-college', 'DeAnza College', deAnzaFunc);
  dropdown.addEndBtn();

  function deAnzaFunc(btn) {
    DB = filterDatabaseToCollege(DB, 'DeAnza');
    stepOnePage();
  }
});


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

  addedList.addConfirmBtnListener(confirmBtnFunc);

  function btnFunc(btn) {
    btn.classList.toggle('btn-toggled');
    addedList.toggle(btn.id);
  }

  function confirmBtnFunc() {
    let btns = addedList.content.querySelectorAll('div');
    let ids = [];
    btns.forEach(btn => {
     ids.push(btn.id);
    });
    stepTwoPage(ids);
  }
}


function stepTwoPage(ids) {
  displayPageHTML('js-step-two-page');

  
}


function getUniNameFromTable(tableName) {
  index = tableName.indexOf('_', tableName.indexOf('_') + 1);
  uniName = tableName.slice(index + 1);
  uniName = uniName.replace(/0/g, ',').replace(/\_/g, ' ');
  uniName = uniName.replace(/_*$/, '');
  return uniName;
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