//I have no idea why this is better than putting a line of require()s but I'll do it anyway
let scripts = [
  "nukeunits",
  "amogus",
  "snas",
  "dartvader",
];

scripts.forEach(e => {
  try{
    require(e)
  }catch(c){
    Log.err(c)
  }
});
