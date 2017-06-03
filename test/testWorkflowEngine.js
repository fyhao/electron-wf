var path = require('path');
var assert = require('assert');
global.ProjRequire = function(module) {
	return require(path.join(__dirname, '/../' + module)); 
}
var workflowModule = ProjRequire('./workflow_engine.js');
// initializing
workflowModule.setWindow({webContents:{send:function(a,b) {}}});

// BOOTSTRAPPING STEP MODULE
var stepModule = ProjRequire('./step.js');
describe('workflow_engine.js', function() {
  this.timeout(15000);
  describe('bootstrap', function() {
    it('set Step module', function() {
		workflowModule.setStepModule(stepModule);
    });
  });
  
  describe('http.wf', function() {
	it('should able to perform http operation', function(done) {
		var configFile = './examples/milestone_2/issue_14/http.wf';
		var config = workflowModule.importConfig(configFile);
		workflowModule.executeWorkFlow(config.workFlows['TestHttp'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
  
  describe('copyFolder.wf', function() {
	it('should able to copy folder', function(done) {
		var path = './examples/milestone_2/issue_4/';
		var configFile = path + 'copyFolder.wf';
		var config = workflowModule.importConfig(configFile);
		workflowModule.executeWorkFlow(config.workFlows['PerformWork'], {}, function() {
			var fs = require('fs');
			assert.equal(true, fs.existsSync(path + 'b'));
			assert.equal(true, fs.existsSync(path + 'b/test.txt'));
			assert.equal(true, fs.existsSync(path + 'b/d'));
			assert.equal(true, fs.existsSync(path + 'b/e/test1.txt'));
			assert.equal(true, fs.existsSync(path + 'b/1/2/3/4/5/6/7/8/9/10/11/12/13/14/15/files.txt'));
			assert.equal(true, fs.existsSync(path + 'b/dog/goes into a/bar/ask for join table.txt'));
			done();
		});	
    });
  });
  
  describe('wait.wf', function() {
	it('should able to wait', function(done) {
		var configFile = './examples/milestone_2/issue_15/wait.wf';
		var config = workflowModule.importConfig(configFile);
		workflowModule.executeWorkFlow(config.workFlows['TestWait'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
  
  describe('file.wf', function() {
	var path = './examples/milestone_5/issue_20';
	var wfFile = path + '/file.wf';
	var testFile = path + '/a.txt';
	it('should able to create and overwrite test file', function(done) {
		
		var config = workflowModule.importConfig(wfFile);
		workflowModule.executeWorkFlow(config.workFlows['TestFileWrite'], {}, function() {
			var fs = require('fs');
			var con = fs.readFileSync(testFile).toString();
			assert.equal('1st line\r\n2nd linebbbccc\r\n', con);
			done();
		});
    });
	it('should able to create and append test file', function(done) {
		
		var config = workflowModule.importConfig(wfFile);
		workflowModule.executeWorkFlow(config.workFlows['TestFileAppend'], {}, function() {
			var fs = require('fs');
			var con = fs.readFileSync(testFile).toString();
			assert.equal('init\r\n1st line\r\n2nd linebbbccc\r\n', con);
			done();
		});
    });
	it('should able to read file', function(done) {
		
		var config = workflowModule.importConfig(wfFile);
		workflowModule.executeWorkFlow(config.workFlows['TestFileRead'], {}, function() {
			done();
		});
    });
	it('should able to copy file', function(done) {
		
		var config = workflowModule.importConfig(wfFile);
		workflowModule.executeWorkFlow(config.workFlows['TestFileCopy'], {}, function() {
			done();
		});
    });
	it('should able to delete file', function(done) {
		
		var config = workflowModule.importConfig(wfFile);
		workflowModule.executeWorkFlow(config.workFlows['DeleteFile'], {}, function() {
			var fs = require('fs');
			assert.equal(true, !fs.existsSync(testFile));
			done();
		});
    });
  });
  
  
  describe('excel.wf', function() {
	it('should able to open, read, write, save the Excel file', function(done) {
		var configFile = './examples/milestone_5/issue_21/excel.wf';
		var config = workflowModule.importConfig(configFile);
		workflowModule.executeWorkFlow(config.workFlows['TestExcel'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
  describe('exec.wf', function() {
	it('should able to execute command prompt', function(done) {
		var configFile = './examples/milestone_5/issue_23/exec.wf';
		var testDir = 'examples/milestone_5/issue_23/target';
		var config = workflowModule.importConfig(configFile);
		workflowModule.executeWorkFlow(config.workFlows['TestExec'], {}, function() {
			console.log('done');
			var fs = require('fs');
			assert.equal(true, fs.existsSync(testDir));
			done();
		});	
    });
  });
  
  describe('runExcelCase.wf', function() {
	it('should able to run Excel Test Case', function(done) {
		var Mitm = require("mitm")
		var mitm = Mitm()
		mitm.on("request", function(req, res) {
		  res.statusCode = 200
		  res.end('<xml>Sample Slide Show ' + req.headers.somekey + '</xml>');
		})
		var configFile = './examples/milestone_5/issue_22/runExcelCase.wf';
		var config = workflowModule.importConfig(configFile);
		workflowModule.executeWorkFlow(config.workFlows['TestExcelCase'], {assert:assert}, function() {
			console.log('done');
			mitm.disable()
			done();
		});	
    });
  });
  
  describe('alert and confirm', function() {
	it('should able to pass alert and confirm', function(done) {
		
		var config = {
			workFlows : {
				TestCase:{
					
					steps : [
					{type:'log',log:'to alert'},
					{type:'alert',message:'test'},
					{type:'log',log:'to confirm'},
					{type:'confirm',message:'test',buttons:['A','B']},
					
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
  
  describe('incrementVar', function() {
	it('should able to pass when the var is an integer', function(done) {
		
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'setVar',name:'a',value:1},
						{type:'log',log:'value ##a##'},
						{type:'incrementVar',name:'a'},
						{type:'log',log:'value ##a##'},
						{type:'assert',expected:2,actual:'##a##'},
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    });
	
	it('should able to pass when the var is a string', function(done) {
		
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'setVar',name:'a',value:"TEST"},
						{type:'log',log:'value ##a##'},
						{type:'incrementVar',name:'a'},
						{type:'log',log:'value ##a##'},
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {}, function() {
			console.log('done');
			done();
		});	
    });
	
	it('should able to fail when the var is not defined', function(done) {
		
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'log',log:'value ##a##'},
						{type:'incrementVar',name:'a'},
						{type:'log',log:'value ##a##'},
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
  
  describe('nonExist', function() {
	it('should able to pass when it is nonExist case', function(done) {
		
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'nonExist'},
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {}, function() {
			console.log('done');
			done();
		});	
    });
	
  });
  
  describe('runLoop', function() {
	it('should able to runLoop an array with one level', function(done) {
		
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'log',log:'Looping an array'},
						{type:'setVar',name:'someArray',value:['1','2','3']},
						{type:'runLoop',array:'someArray',wf:'eachItem',item:'theItem'},
						{type:'log',log:'afterLoop'}
					]
				}
				,
				eachItem:{
					steps : [
						{type:'log',log:'for each item ##theItem##'},
						
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    }); // end of it
	
	it('should able to runLoop an array with two level', function(done) {
		
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'log',log:'Looping an array'},
						{type:'setVar',name:'someArray',value:['1','2','3']},
						{type:'runLoop',array:'someArray',wf:'eachItem',item:'theItem'},
						{type:'log',log:'afterLoop'}
					]
				}
				,
				eachItem:{
					steps : [
						{type:'log',log:'for each item ##theItem## start'},
						{type:'setVar',name:'innerArray',value:['4','5']},
						{type:'runLoop',array:'innerArray',wf:'innerItem',item:'theInner'},
						{type:'log',log:'for each item ##theItem## end ** ##innerItemApple##'},
					]
				}
				,
				innerItem:{
					steps : [
						{type:'log',log:'for inner item ##theInner##'},
						{type:'setVar',name:'innerItemApple',value:'apple ##theInner##'}
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    }); // end of it
	
	it('should able to runLoop without an array', function(done) {
		
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'log',log:'Looping an array'},
						{type:'runLoop',array:'someArray',wf:'eachItem',item:'theItem'},
						{type:'log',log:'afterLoop'}
					]
				}
				,
				eachItem:{
					steps : [
						{type:'log',log:'for each item ##theItem## start'},
						{type:'setVar',name:'innerArray',value:['4','5']},
						{type:'runLoop',array:'innerArray',wf:'innerItem',item:'theInner'},
						{type:'log',log:'for each item ##theItem## end ** ##innerItemApple##'},
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    }); // end of it
	
	it('should able to runLoop an array with default item name', function(done) {
		
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'log',log:'Looping an array'},
						{type:'setVar',name:'someArray',value:['1','2','3']},
						{type:'runLoop',array:'someArray',wf:'eachItem'},
						{type:'assert',expected:3,actual:'##item##'},
					]
				}
				,
				eachItem:{
					steps : [
						{type:'log',log:'for each item ##item##'},
						
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    }); // end of it
	
	it('should able to runLoop an array with outputVars defined', function(done) {
		
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'log',log:'Looping an array'},
						{type:'setVar',name:'someArray',value:['1','2','3']},
						{type:'runLoop',array:'someArray',wf:'eachItem',outputVars:['someResult']},
						{type:'log',log:'afterLoop ##someResult##'},
						{type:'assert',expected:2,actual:'##someResult##'},
					]
				}
				,
				eachItem:{
					steps : [
						{type:'log',log:'for each item ##item##'},
						{type:'setVar',name:'someResult',value:'2'},
						{type:'assert',expected:2,actual:'##someResult##'},
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    }); // end of it
  });
  
  describe('assert', function() {
	it('should able to run without assert inject into executeWorkflow', function(done) {
		
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'log',log:'Testing on assert'},
						{type:'setVar',name:'apple',value:'e'},
						{type:'assert',expected:'e',actual:'##apple##'},
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {}, function() {
			console.log('done');
			done();
		});	
    });
	it('should able to run with assert inject into executeWorkflow', function(done) {
		
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'log',log:'Testing on assert'},
						{type:'setVar',name:'apple',value:'e'},
						{type:'assert',expected:'e',actual:'##apple##'},
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    });
  });
  
  
  
  describe('getStringBetween', function() {
    it('should able to getStringBetween with different start, end', function(done) {
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'setVar',name:'source',value:'abcdefgh'},
						{type:'getStringBetween',var:'source',start:'abc',end:'fgh',result:'output'},
						{type:'assert',expected:'de',actual:'##output##'},
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    });
	it('should able to getStringBetween with same start, end', function(done) {
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'setVar',name:'source',value:'abcdefabc'},
						{type:'getStringBetween',var:'source',start:'abc',end:'abc',result:'output'},
						{type:'assert',expected:'def',actual:'##output##'},
						{type:'setVar',name:'source',value:'abcdefabcghiabc'},
						{type:'getStringBetween',var:'source',start:'abc',end:'abc',result:'output'},
						{type:'assert',expected:'def',actual:'##output##'},
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    });
	it('should able to getStringBetween with blank start and valid end', function(done) {
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'setVar',name:'source',value:'abcdefabc'},
						{type:'getStringBetween',var:'source',start:'',end:'def',result:'output'},
						{type:'assert',expected:'abc',actual:'##output##'},
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    });
  });
  describe('testDataPrep', function() {
    
	it('should able to run testDataPrep', function(done) {
		var config = {
			"db" : {
				"cbpdb" : {
					user:'test',
					password:'test',
					server : 'localhost\\sqlserver2012',
					database : 'cbp'
					,
					type:'nothing'
				}
			},
			workFlows : {
				TestCase:{
					steps : [
						{type:'testDataPrep', info: {
							db : 'cbpdb',
							testDataExcelFile : path.join(__dirname, '../examples/milestone_6/issue_32/testdata.xlsx'),
							sheet : 'Sheet1',
							startRow : 2,
							cells : ['A','B','C','D'],
							dateCells : ['E'],
							sql_templates : [
								"insert into sometable (a,b) values ('##A##','##B##')",
								
								
							]
						}}
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    });
  });
  describe('sql', function() {
    
	it('should able to run sql', function(done) {
		var config = {
			"db" : {
				"cbpdb" : {
					user:'test',
					password:'test',
					server : 'localhost\\sqlserver2012',
					database : 'cbp'
					,
					type:'nothing'
				}
			},
			workFlows : {
				TestCase:{
					steps : [
						{type:'sql',ds:'cbpdb',sql:'delete from sometable'},
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    });
  });
  
  describe('listFiles', function() {
	it('should able to list files', function(done) {
		var config = {
			
			workFlows : {
				TestCase:{
					steps : [
						{type:'listFiles',folder:'examples/milestone_6/issue_27/first',var:'result',filter:'b'},
						{type:'evaljs',var:'len',code:'vars["result"].length'},
						{type:'assert',expected:2, actual:'##len##'},
						{type:'listFiles',folder:'examples/milestone_6/issue_27/first',var:'result',filter:'1.txt',if:'endsWith'},
						{type:'evaljs',var:'len',code:'vars["result"].length'},
						{type:'assert',expected:2, actual:'##len##'},
						{type:'listFiles',folder:'examples/milestone_6/issue_27/first',var:'result'},
						{type:'evaljs',var:'len',code:'vars["result"].length'},
						{type:'assert',expected:5, actual:'##len##'},
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    });
	it('should able to iterate the files in runLoop', function(done) {
		var config = {
			workFlows : {
				TestCase:{
					steps : [
						{type:'listFiles',folder:'examples/milestone_6/issue_27/first',var:'result'},
						{type:'evaljs',var:'len',code:'vars["result"].length'},
						{type:'assert',expected:5, actual:'##len##'},
						{type:'runLoop',array:'result',item:'item',wf:'eachItem'}
					]
				}
				,eachItem:{
					steps : [
						{type:'evaljs',var:'verified',code:'vars["item"].indexOf("first") > -1'},
						{type:'assert',expected:'1', actual:'##verified##'}
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
	});
  });
  
  
  
  describe('zip', function() {
	it('should able to zip files', function(done) {
		var config = {
			
			workFlows : {
				TestCase:{
					steps : [
						{type:'deleteFolder',folder:'examples/milestone_6/issue_26/target/'},
						{type:'createFolder',folder:'examples/milestone_6/issue_26/target/'},
						{type:'zip',include:'examples/milestone_6/issue_27/first',file:'examples/milestone_6/issue_26/target/test.zip'},
						{type:'listFiles',var:'result',folder:'examples/milestone_6/issue_26/target/'},
						{type:'evaljs',var:'len',code:'vars["result"].length'},
						{type:'assert',expected:1,actual:'##len##'}
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    });
	
	it('should able to unzip files', function(done) {
		var config = {
			
			workFlows : {
				TestCase:{
					steps : [
						{type:'unzip',location:'examples/milestone_6/issue_26/target/',file:'examples/milestone_6/issue_26/target/test.zip'},
						{type:'listFiles',var:'result',folder:'examples/milestone_6/issue_26/target/'},
						{type:'evaljs',var:'res',code:'vars["result"].length > 1 ? "true": "false"'},
						{type:'assert',expected:'true',actual:'##res##'},
						{type:'deleteFolder',folder:'examples/milestone_6/issue_26/target/'}
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    });
	
	
  });
  describe('__dirname variable', function() {
	it('should able to show __dirname variable', function(done) {
		var configFile = './examples/milestone_6/issue_92/testDirname.wf';
		var config = workflowModule.importConfig(configFile);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			done();
		});	
    });
  });
  
  describe('if expr', function() {
	it('should able to perform if using expr attribute (yes)', function(done) {
		var config = {
			
			workFlows : {
				TestCase:{
					steps : [
						{type:'setVar',name:'apple',value:'1'}
					]
				},
				yes_flow:{
					steps : [
						{type:'log',log:'yes'},
						{type:'setVar',name:'result',value:'yes'}
					]
				},
				no_flow:{
					steps : [
						{type:'log',log:'no'},
						{type:'setVar',name:'result',value:'no'}
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    });
	it('should able to perform if using expr attribute (no)', function(done) {
		var config = {
			
			workFlows : {
				TestCase:{
					steps : [
						{type:'setVar',name:'apple',value:'1'}
					]
				},
				yes_flow:{
					steps : [
						{type:'log',log:'yes'},
						{type:'setVar',name:'result',value:'yes'}
					]
				},
				no_flow:{
					steps : [
						{type:'log',log:'no'},
						{type:'setVar',name:'result',value:'no'}
					]
				}
			}
		};
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestCase'], {assert:assert}, function() {
			console.log('done');
			done();
		});	
    });
  });
});