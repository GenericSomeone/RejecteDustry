//why bother
let scripts = [
  "nukeunits",
  "amogus",
  "snas,"
];

scripts.forEach(e => {
  try{
    require(e)
  }catch(c){
    Log.err(c)
  }
});
