function loadDatabase(path) {
  return fetch(path)
    .then(response => response.json())
    .then(data => {
      const tempdb = new Map(Object.entries(data));
      console.log('Database loaded');
      return tempdb;
    })
    .catch(error => {
      console.error('Error loading data:', error);
      throw error; // Re-throw the error so it can be caught by the caller
    });
}

function reduceDataToCollege(db, college) {
  const filteredDb = new Map();

  for(const [key, value] of db) {
    if(key.includes(college)) {
      filteredDb.set(key, value);
    }
  }
  return filteredDb;
}