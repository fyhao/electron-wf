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
		var configFile = '../examples/milestone_2/issue_14/http.wf';
		delete require.cache[require.resolve(configFile)]; // delete require cache
		var config = require(configFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestHttp'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
  
  describe('copyFolder.wf', function() {
	it('should able to copy folder', function(done) {
		var configFile = '../examples/milestone_2/issue_4/copyFolder.wf';
		delete require.cache[require.resolve(configFile)]; // delete require cache
		config = require(configFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['PerformWork'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
  
  describe('wait.wf', function() {
	it('should able to wait', function(done) {
		var configFile = '../examples/milestone_2/issue_15/wait.wf';
		delete require.cache[require.resolve(configFile)]; // delete require cache
		config = require(configFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestWait'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
  
  describe('file.wf', function() {
	var path = 'examples/milestone_5/issue_20';
	var wfFile = '../' + path + '/file.wf';
	var testFile = path + '/a.txt';
	it('should able to create and overwrite test file', function(done) {
		
		delete require.cache[require.resolve(wfFile)]; // delete require cache
		config = require(wfFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestFileWrite'], {}, function() {
			var fs = require('fs');
			var con = fs.readFileSync(testFile).toString();
			assert.equal('1st line\r\n2nd linebbbccc\r\n', con);
			done();
		});
    });
	it('should able to create and append test file', function(done) {
		
		delete require.cache[require.resolve(wfFile)]; // delete require cache
		config = require(wfFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestFileAppend'], {}, function() {
			var fs = require('fs');
			var con = fs.readFileSync(testFile).toString();
			assert.equal('init\r\n1st line\r\n2nd linebbbccc\r\n', con);
			done();
		});
    });
	it('should able to read file', function(done) {
		
		delete require.cache[require.resolve(wfFile)]; // delete require cache
		config = require(wfFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestFileRead'], {}, function() {
			done();
		});
    });
	it('should able to copy file', function(done) {
		
		delete require.cache[require.resolve(wfFile)]; // delete require cache
		config = require(wfFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestFileCopy'], {}, function() {
			done();
		});
    });
	it('should able to delete file', function(done) {
		
		delete require.cache[require.resolve(wfFile)]; // delete require cache
		config = require(wfFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['DeleteFile'], {}, function() {
			var fs = require('fs');
			assert.equal(true, !fs.existsSync(testFile));
			done();
		});
    });
  });
  
  
  describe('excel.wf', function() {
	it('should able to open, read, write, save the Excel file', function(done) {
		var configFile = '../examples/milestone_5/issue_21/excel.wf';
		delete require.cache[require.resolve(configFile)]; // delete require cache
		config = require(configFile); // require again
		workflowModule.setConfig(config);
		workflowModule.executeWorkFlow(config.workFlows['TestExcel'], {}, function() {
			console.log('done');
			done();
		});	
    });
  });
  describe('exec.wf', function() {
	it('should able to execute command prompt', function(done) {
		var configFile = '../examples/milestone_5/issue_23/exec.wf';
		var testDir = 'examples/milestone_5/issue_23/target';
		delete require.cache[require.resolve(configFile)]; // delete require cache
		config = require(configFile); // require again
		workflowModule.setConfig(config);
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
		var configFile = '../examples/milestone_5/issue_22/runExcelCase.wf';
		delete require.cache[require.resolve(configFile)]; // delete require cache
		config = require(configFile); // require again
		workflowModule.setConfig(config);
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
});