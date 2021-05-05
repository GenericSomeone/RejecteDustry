//why bother
let scripts = [
  "nukeunits",
  "amogus",
];

scripts.forEach(e => {
  try{
    require(e)
  }catch(c){
    Log.err(c)
  }
});
