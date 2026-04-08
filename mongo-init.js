db = db.getSiblingDB('lab6db');

db.tasks.insertMany([
  { id: 1, name: 'Milk',         status: 'done' },
  { id: 2, name: 'Eggs',         status: 'done' },
  { id: 3, name: 'Bread',        status: 'pending' },
  { id: 4, name: 'Butter',       status: 'pending' },
  { id: 5, name: 'Orange juice', status: 'pending' }
]);
