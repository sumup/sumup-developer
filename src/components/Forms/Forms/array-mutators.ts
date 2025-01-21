import finalFormArrayMutators from "final-form-arrays"; // CommonJS module workaround

const {
  concat,
  insert,
  move,
  pop,
  push,
  remove,
  removeBatch,
  shift,
  swap,
  unshift,
  update,
} = finalFormArrayMutators;

const arrayMutators = {
  concat,
  insert,
  move,
  pop,
  push,
  remove,
  removeBatch,
  shift,
  swap,
  unshift,
  update,
};

export default arrayMutators;
