function getJson(num){var result=!0,path=lib.designFilePath;log.h("Beginning execution of getJson function with the design number: "+num);var theFile=new File(path+"/"+num+".json");if(!theFile.exists){errorList.push("Sorry. That design number was not found.."),log.e("The design number: "+num+" was not found in the script resources folder."),result=!1}else{theFile.open();var contents="("+theFile.read()+")";theFile.close(),contents=eval(contents),lib.json=contents,log.l("json file exists and was successfully evaluated.")}return log.l("End of getJson function, returning "+result),result}