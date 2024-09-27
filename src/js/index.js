let PAGE_ARR = []; //used in: displayPage()
PAGE_ARR.push(document.getElementById('js-landing-page'));
PAGE_ARR.push(document.getElementById('js-step-one-page'));
PAGE_ARR.push(document.getElementById('js-step-two-page'));
PAGE_ARR.push(document.getElementById('js-step-three-page'));

let DB;
loadDatabase('./../src/articulations.json').then(result => {
  DB = result;
});

class Dropdown {
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
    let textNode = this.searchbar.firstChild;
    textNode.textContent = text;
  }

  setDimensions(width, height) {
    this.searchbar.style.width = width;
    this.searchbar.style.height = height;
    this.content.style.width = width;
  }

  setContentTop(space) {
    this.content.style.top = space;
  }

  empty() {
    this.content.innerHTML = '';
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

  toggle(id, text) {
    let targetBtn = this.content.querySelector(`#${id}`);
    if(targetBtn) {
      targetBtn.remove();
    }
    else {
      let div = document.createElement('div');
      div.classList.add('added-elem');
      div.id = id;
      div.innerText = convertToRealName(text);
      this.content.append(div);
    }

    if(this.content.querySelectorAll('div').length != 0) {
      this.addedList.style.height = '450px';
      this.content.style.height = '373px';
    }
    else{
      this.addedList.style.height = '0px';
      this.content.style.height = '0px';
    }
  }

  addConfirmBtnListener(func) {
    this.confirmBtn.addEventListener('click', func);
  }

  getAddedList() {
    const nodeList = Array.from(this.content.querySelectorAll(`div`));
    const arr = [];
    nodeList.forEach(node => {
      arr.push(node.id.replace(/^div#/, ''));
    })
    return arr;
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
  /*
  document.addEventListener('click', testFunc);
  
  function testFunc() {
    document.removeEventListener('click', testFunc);
    let test = [
      {
        uni: "DeAnza_to_UC_Berkeley",
        major: "African American Studies B.A."
      },
      {
        uni: "DeAnza_to_UC_Berkeley",
        major: "Anthropology B.A."
      },
      {
        uni: "DeAnza_to_UC_Davis",
        major: "Art History B.A."
      },
      {
        uni: "DeAnza_to_UC_Davis",
        major: "Applied Physics B.S."
      },
      {
        uni: "DeAnza_to_UC_San_Diego",
        major: "Biology: Human Biology B.S."
      },
      {
        uni: "DeAnza_to_UC_San_Diego",
        major: "Cognitive Science: Machine Learning and Neural Computation"
      },
    ];
    const test2 = calculate(test);
    stepThreePage(test2);
  }
  */
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
    dropdown.addBtn(key + '-btn', convertToRealName(key), btnFunc);
  });
  dropdown.addEndBtn();

  let addedList = new AddedList('js-added-uni-list');
  addedList.changeTitle('Added universities:');

  addedList.addConfirmBtnListener(confirmBtnFunc);

  function btnFunc(btn) {
    btn.classList.toggle('btn-toggled');
    const index = btn.id.lastIndexOf('-');
    addedList.toggle(btn.id, btn.id.slice(0, index));
  }

  function confirmBtnFunc() {
    let btns = addedList.content.querySelectorAll('div');
    let ids = [];
    btns.forEach(btn => {
      const index = btn.id.lastIndexOf('-');
      ids.push(btn.id.slice(0, index));
    });
    stepTwoPage(ids);
  }
}


function stepTwoPage(ids) {
  displayPageHTML('js-step-two-page');

  let dropdown = new Dropdown('js-major-dropdown');
  dropdown.setDimensions('340px', '55px');
  dropdown.setContentTop('53px');

  let addedList = new AddedList('js-added-major-list');
  addedList.changeTitle('Added Majors:');
  let idsIndex = 0;
  
  loadDropdownHTML (ids[0]);

  let prevBtn = document.getElementById('js-previous-btn');
  prevBtn.addEventListener('click', () => {
    if(idsIndex > 0) {
      idsIndex -= 1;
      loadDropdownHTML (ids[idsIndex]);
    }
  });
  let nextBtn = document.getElementById('js-next-btn');
  nextBtn.addEventListener('click', () => {
    if(idsIndex < ids.length - 1) {
      idsIndex += 1;
      loadDropdownHTML (ids[idsIndex]);
    }
  });

  addedList.addConfirmBtnListener(confirmBtnFunc);

  function loadDropdownHTML(id) {
    dropdown.changeSearchBarText(convertToRealName(id));
    dropdown.empty();

    const list = addedList.getAddedList();
    const majors = DB.get(id);
    majors.forEach(major => {
      const btnId = convertToVarName(`${id}-${major.id}`);
      const uniAndMajorName = `${convertToRealName(id)}: ${major.id}`
      dropdown.addBtn(btnId, major.id, btnFunc);

      if(list.includes(btnId)) {
        dropdown.content.querySelector(`#${btnId}`).classList.add('btn-toggled');
      }
    });
  }

  function btnFunc(btn) {
    btn.classList.toggle('btn-toggled');
    addedList.toggle(btn.id, `${dropdown.searchbar.innerText}: ${btn.innerText}`);
  }

  function confirmBtnFunc() {
    let result = [];
    const content = addedList.content.querySelectorAll('div');
    content.forEach(div => {
      const uniAndMajor = {
        uni: div.id.split('-')[0],
        major: div.innerText.split(/:(.+)/)[1].slice(1)
      };
      result.push(uniAndMajor);
    });

    const finalResult = calculate(result);
    stepThreePage(finalResult);
  }
}


function calculate(result) {
  let loading = document.getElementById('js-loading-container');
  loading.classList.remove('hidden');
  loading.classList.add('block');

  targetData = [];
  result.forEach(elem => {
    let uni = DB.get(elem.uni);
    const target = uni.find(e => e.id === elem.major);
    target['uniId'] = elem.uni;
    target['uni'] = convertToRealName(elem.uni);
    targetData.push(target);
  });
  let finalResult = findOptimalCourseSet(targetData);
  console.log(finalResult);
  return finalResult;
}


function stepThreePage(result) {
  displayPageHTML('js-step-three-page');

  const grid = document.getElementById('js-result-content');
  result['coursesAndOverlaps'].forEach(courseOverlap => {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('grid-elem', 'w-[900px]');
    grid.append(rowDiv);
    
    const courseDiv = document.createElement('div');
    courseDiv.innerText = courseOverlap['course'];
    rowDiv.append(courseDiv);

    const overlapDiv = document.createElement('div');
    overlapDiv.classList.add('flex');
    for(let i=0; i<courseOverlap['requiredByCount']; i++) {
      const majorDiv = document.createElement('div');
      majorDiv.innerText = courseOverlap['majors'][i];
      overlapDiv.append(majorDiv);
    }

    rowDiv.append(overlapDiv);
  });
}


function convertToRealName(tableName) {
  index = tableName.indexOf('_', tableName.indexOf('_') + 1);
  uniName = tableName.slice(index + 1);
  uniName = uniName
    .replace(/0/g, ',')
    .replace(/\_/g, ' ')
    .replace(/_*$/, '')
  return uniName;
}


function convertToVarName(text) {
  return text.replace(/\s/g, '_').replace(/[.:&/()]/g, '');
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
      satisfiedMajors: [],
      coursesAndOverlaps: [],
      allMajorsAndNotes: data.map(item => ({major: item.id, notes: item.notes})),
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
    const majorData = parsedData.find(item => item.id === major);
    const fullMajorName = `${majorData.uni}\n${major}`;
    path.forEach(course => {
      if (!courseRequirements[course]) {
        courseRequirements[course] = { count: 0, majors: [] };
      }
      courseRequirements[course].count++;
      if (!courseRequirements[course].majors.includes(fullMajorName)) {
        courseRequirements[course].majors.push(fullMajorName);
      }
    });
  });

  const coursesAndOverlaps = Object.entries(courseRequirements).map(([course, data]) => ({
    course,
    requiredByCount: data.count,
    majors: data.majors
  }));

  const allMajorsAndNotes = data.map(item => ({
    uniId: item.uniId,
    uni: item.uni,
    major: item.id,
    notes: item.notes
  }));

  return {
    optimalPath: Array.from(optimalSet.courses),
    coursesAndOverlaps,
    allMajorsAndNotes
  };
}