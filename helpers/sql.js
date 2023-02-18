const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

// This function is called on the company and user models for updating data. 

function sqlForPartialUpdate(dataToUpdate, jsToSql) { // dataToUpdate & jsToSql are both obj
  const keys = Object.keys(dataToUpdate); // looping over the keys in the dataToObj obj and returning an array of those keys 
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
   // we are changing the format to fit in our SQL query
  const cols = keys.map((colName, idx) => // mapping over each key and getting the index of each (colName is each key) and creating a new array 
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,  // either assigning the a new '$1/2/3' value to the colName or the jsToSql[colName]
  );

  return {
    setCols: cols.join(", "), // joining all the strings in the cols array and assginign the to the setCols key 
    values: Object.values(dataToUpdate),  // the value will be the values of dataToUpdate obj
  };
}

module.exports = { sqlForPartialUpdate };
