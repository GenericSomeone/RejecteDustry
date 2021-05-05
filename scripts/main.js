//why bother
let scripts = [
  "nukeunits",
];

scripts.forEach(e => {
  try{
    require(e)
  }catch(c){
    Log.err(c)
  }
});
