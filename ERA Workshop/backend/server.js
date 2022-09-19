const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');
const formidable = require('formidable');
const fs = require('fs');
const extract = require('extract-zip');
const truncate = require('@turf/truncate');
const Papa = require('papaparse');
const app = express();
const config = require('./config');
const helpers = require('./helpers');
const dataUtilities = require('./data');

const ogr2ogr = require('ogr2ogr').default;

var sqlite = require('spatialite');

app.use(serveStatic(path.join(__dirname, 'public')));
app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.options('*', (req, res) => {
  res.writeHead(200, '', {
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
  }).end();
});

app.get('/listProjects', function(req, res) {
  let dbConnection = dataUtilities.dbObject;
  dbConnection.serialize(function(){
    let data = [];
    let sqlQuery = `SELECT * FROM projects WHERE status = 1 ORDER BY id, project_name`;
    dbConnection.all(sqlQuery, (errQuery, rowsQuery) => {
      if (errQuery){
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
      if(rowsQuery){
        rowsQuery.forEach(rowData => {
          data.push({"id":rowData.id,"codex":rowData.codex,"project_name":rowData.project_name,"mainfile":rowData.workspace,"status":rowData.status});
        });
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        let payloadString = JSON.stringify({"code": 200, "message": "success", "data": data});
        return res.end(payloadString);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        let payloadString = JSON.stringify({"code": 200, "message": "success", "data": []});
        return res.end(payloadString);
      }
    });
  });
});

app.post('/listProjectsByUser', function(req, res) {
  let dbConnection = dataUtilities.dbObject;
  let userid = req.body.userid;
  dbConnection.serialize(function(){
    let data = [];
    let sqlQuery = `SELECT id,codex,project_name,status,workspace,userid FROM projects WHERE id = 1 UNION ALL SELECT id,codex,project_name,status,workspace,userid FROM projects WHERE userid = ? ORDER BY id, project_name`;
    dbConnection.all(sqlQuery, [userid], (errQuery, rowsQuery) => {
      if (errQuery){
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
      if(rowsQuery){
        rowsQuery.forEach(rowData => {
          data.push({"id":rowData.id,"codex":rowData.codex,"project_name":rowData.project_name,"mainfile":rowData.workspace,"status":rowData.status});
        });
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        let payloadString = JSON.stringify({"code": 200, "message": "success", "data": data});
        return res.end(payloadString);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        let payloadString = JSON.stringify({"code": 200, "message": "success", "data": []});
        return res.end(payloadString);
      }
    });
  });
});

app.post('/createProject', function(req, res) {
  let dbConnection = dataUtilities.dbObject;
  let project_name = req.body.project_name;
  let cDT = Date.now();
  let hashedDatetime = helpers.hash(cDT.toString());
  let codex = hashedDatetime.substring(0, 12);
  dbConnection.serialize(function(){
    let data = [];
    let sqlInsertQuery = `INSERT INTO projects(codex,project_name,workspace,status) VALUES(?,?,'-',1)`;
    let sqlListQuery = `SELECT * FROM projects WHERE status = 1 ORDER BY id, project_name`;
    dbConnection.run(sqlInsertQuery, [codex, project_name], (errInsertQuery) => {
      if (errInsertQuery){
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
      dbConnection.all(sqlListQuery, (errListQuery, rowsListQuery) => {
        if (errListQuery){
          res.writeHead(500, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          return res.end();
        }
        if(rowsListQuery){
          rowsListQuery.forEach(rowData => {
            data.push({"id":rowData.id,"codex":rowData.codex,"project_name":rowData.project_name,"mainfile":rowData.workspace,"status":rowData.status});
          });
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": codex, "data": data});
          return res.end(payloadString);
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": codex, "data": []});
          return res.end(payloadString);
        }
      });
    });
  });
});

app.post('/createProjectByUser', function(req, res) {
  let dbConnection = dataUtilities.dbObject;
  let project_name = req.body.project_name;
  let userid = req.body.userid;
  let cDT = Date.now();
  let hashedDatetime = helpers.hash(cDT.toString());
  let codex = hashedDatetime.substring(0, 12);
  dbConnection.serialize(function(){
    let data = [];
    let sqlInsertQuery = `INSERT INTO projects(codex,project_name,workspace,status,userid) VALUES(?,?,'-',1,?)`;
    let sqlListQuery = `SELECT id,codex,project_name,status,workspace,userid FROM projects WHERE id = 1 UNION ALL SELECT id,codex,project_name,status,workspace,userid FROM projects WHERE userid = ? ORDER BY id, project_name`;
    dbConnection.run(sqlInsertQuery, [codex, project_name, userid], (errInsertQuery) => {
      if (errInsertQuery){
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
      dbConnection.all(sqlListQuery, [userid], (errListQuery, rowsListQuery) => {
        if (errListQuery){
          res.writeHead(500, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          return res.end();
        }
        if(rowsListQuery){
          rowsListQuery.forEach(rowData => {
            data.push({"id":rowData.id,"codex":rowData.codex,"project_name":rowData.project_name,"mainfile":rowData.workspace,"status":rowData.status});
          });
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": codex, "data": data});
          return res.end(payloadString);
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": codex, "data": []});
          return res.end(payloadString);
        }
      });
    });
  });
});

app.post('/updateProject', function(req, res) {
  let dbConnection = dataUtilities.dbObject;
  let project_id = req.body.project_id;
  let project_name = req.body.project_name;
  dbConnection.serialize(function(){
    let data = [];
    let sqlQuery = `UPDATE projects SET project_name = ? WHERE id = ?`;
    dbConnection.run(sqlQuery, [project_name, project_id], (errQuery) => {
      if (errQuery){
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200, '', {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
      });
      let payloadString = JSON.stringify({"code": 200, "message": "success", "data": {"project_name": project_name}});
      return res.end(payloadString);
    });
  });
});

app.post('/removeProject', function(req, res) {
  let dbConnection = dataUtilities.dbObject;
  let project_codex = req.body.codex;
  let project_mainfile = req.body.mainfile;
  dbConnection.serialize(function(){
    let data = [];
    let sqlQuery = `DELETE FROM projects WHERE codex = ?`;
    dbConnection.run(sqlQuery, [project_codex], (errQuery) => {
      if (errQuery){
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      } else {
        fs.unlinkSync(path.join(__dirname, config.baseGeoJSONDir + project_mainfile +'.json'));
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        let payloadString = JSON.stringify({"code": 200, "message": "success", "data": {}});
        return res.end(payloadString);
      }
    });
  });
});

app.post('/resetProjects', function(req, res) {
  let dbConnection = dataUtilities.dbObject;
  dbConnection.serialize(function(){
    let data = [];
    let sqlQueryClearFiles = `SELECT * FROM workspaces ORDER BY id`;
    let sqlQueryDelete = `DELETE FROM projects WHERE id > 1`;
    let sqlQueryResetDefaultProject = `UPDATE projects SET workspace = '-' WHERE id = 1`;
    let sqlQueryUpdateSeq = `UPDATE sqlite_sequence SET seq = 1 WHERE name = 'projects'`;
    let sqlQueryDeleteW = `DELETE FROM workspaces`;
    let sqlQueryUpdateSeqW = `DELETE FROM sqlite_sequence WHERE name = 'workspaces'`;
    
    dbConnection.all(sqlQueryClearFiles, (errQueryClearFiles, rowsQueryClearFiles) => {
      if (errQueryClearFiles){
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
      if(rowsQueryClearFiles){
        /* always sync to workspace table fields! */
        rowsQueryClearFiles.forEach(rowData => {
          fs.unlinkSync(path.join(__dirname, config.baseGeoJSONDir + rowData.codex +'.json'));
        });
        return true;
      } else {
        return false;
      }
    });
    
    dbConnection.run(sqlQueryDelete, (errQueryDelete) => {
      if (errQueryDelete){
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
      dbConnection.run(sqlQueryUpdateSeq, (errQueryUpdateSeq) => {
        if (errQueryUpdateSeq){
          res.writeHead(500, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          return res.end();
        }
        dbConnection.run(sqlQueryDeleteW, (errQueryDeleteW) => {
          if (errQueryDeleteW){
            res.writeHead(500, '', {
              'Access-Control-Allow-Origin': '*', 
              'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
            });
            return res.end();
          }
          dbConnection.run(sqlQueryUpdateSeqW, (errQueryUpdateSeqW) => {
            if (errQueryUpdateSeqW){
              res.writeHead(500, '', {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
              });
              return res.end();
            }
            dbConnection.run(sqlQueryResetDefaultProject, (errQueryResetDefaultProject) => {
              if (errQueryResetDefaultProject){
                res.writeHead(500, '', {
                  'Access-Control-Allow-Origin': '*', 
                  'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                });
                return res.end();
              }
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(200, '', {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
              });
              let payloadString = JSON.stringify({"code": 200, "message": "success", "data": {}});
              return res.end(payloadString);
            });
          });
        });
      });
    });
  });
});

app.post('/workspaceCodex', function(req, res) {
  let project_codex = req.body.project_codex;
  let randStr = helpers.createRandomString(12);
  let hStr = helpers.hash(project_codex + randStr);
  let hashedStr = hStr.substring(0, 12);
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200, '', {
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
  });
  let payloadString = JSON.stringify({"code": 200, "message": "success", "data": {"codex":hashedStr}});
  return res.end(payloadString);
});

app.post('/listWorkspaces', function(req, res) {
  let project_codex = req.body.project_codex;
  let dbConnection = dataUtilities.dbObject;
  dbConnection.serialize(function(){
    let data = [];
    let sqlQuery = `SELECT * FROM workspaces WHERE project_codex = ? ORDER BY workspace_name`;
    dbConnection.all(sqlQuery, [project_codex], (errQuery, rowsQuery) => {
      if (errQuery){
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
      if(rowsQuery){
        /* always sync to workspace table fields! */
        rowsQuery.forEach(rowData => {
          data.push({
            "id": rowData.id,
            "project_codex": rowData.project_codex,
            "codex": rowData.codex,
            "workspace_name": rowData.workspace_name,
            "osm_status": rowData.osm_status,
            "status": rowData.status
          });
        });
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        let payloadString = JSON.stringify({"code": 200, "message": "success", "data": data});
        return res.end(payloadString);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        let payloadString = JSON.stringify({"code": 200, "message": "success", "data": []});
        return res.end(payloadString);
      }
    });
  });
});

app.post('/updateData', function(req, res) {
  let wxFileName = req.body.wxid;
  let newData = req.body.wxdata;
  dataUtilities.update('files', wxFileName, newData, function(errFileUpdate){
    if(!errFileUpdate){
      dataUtilities.read('files', wxFileName, function(errFileRead, data){
        if(!errFileRead){
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          let payloadString = JSON.stringify(data);
          return res.end(payloadString);
        } else {
          res.writeHead(500, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          return res.end();
        }
      });
    } else {
      res.writeHead(500, '', {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
      });
      return res.end();
    }
  });
});

app.route('/upload').post(function(req, res) {
  let form = new formidable.IncomingForm({
    uploadDir: path.join(__dirname, config.uploadedFileDir), 
    maxFileSize: 500 * 1024 * 1024
  });
  form.parse(req, function(err, fields, files){
    let project_codex = fields.project_codex;
    let workspace_name = fields.workspace_name;
    let fileExt = helpers.fileExtensionType(files.filetoupload.type);
    let hashedFilename = helpers.hash(files.filetoupload.name +''+ files.filetoupload.mtime +''+ files.filetoupload.path);
    let cFilename = hashedFilename.substring(0, 12);
    let uFilename = cFilename + fileExt;
    let jFilename = cFilename + '.json';
    let tmppath = files.filetoupload.path;
    let newpath = config.fileUploadDir + uFilename;
    let newTempPath = config.fileUploadTempDir + uFilename;
    let newExtractTargetDir = config.fileUploadDir + cFilename;
    if(!fs.existsSync(path.join(__dirname, newExtractTargetDir))){
      fs.mkdirSync(path.join(__dirname, newExtractTargetDir), { recursive: true, mode: 0o777});
    }
    fs.rename(tmppath, path.join(__dirname, newTempPath), async function(errRename){
      if (errRename){
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
      await extract(path.join(__dirname, newTempPath), { dir: path.resolve(path.join(__dirname, newExtractTargetDir))});
      let extractedFiles = fs.readdirSync(path.join(__dirname, config.extractFileTargetDir + cFilename));
      let trimmedFileName = [];
      let regexpPattern = /\..+$/;
      extractedFiles.forEach(function(eachFile){
        trimmedFileName.push(eachFile.replace(regexpPattern,''));
      });
      ogr2ogr(path.join(__dirname, config.extractFileTargetDir + cFilename +'/'+ trimmedFileName[0] +'.shp')).exec((err, {data}) => {
        let postProcessedData = dataUtilities.wrangleData(cFilename, data);
        //let featureObj = truncate(postProcessedData, {precision: 6, coordinates: 2, mutate: true});
        dataUtilities.create('files', cFilename, postProcessedData, function(errFileCreate){
          if(!errFileCreate){
            /* deleting extracted shapefiles directory */
            //fs.rmSync(path.join(__dirname, config.extractFileTargetDir + cFilename), { recursive: true, force: true });
            var tmpshapefiles = fs.readdirSync(path.join(__dirname, config.extractFileTargetDir + cFilename));
            tmpshapefiles.forEach(function(element){
              fs.unlinkSync(path.join(__dirname, config.extractFileTargetDir + cFilename + "/" + element));
            });
            /* deleting uploaded (+compressed) shapefile */
            fs.unlinkSync(path.join(__dirname, config.uploadedFileDir + uFilename));
            /* database access */
            let dbConnection = dataUtilities.dbObject;
            dbConnection.serialize(function(){
              let data = [];
              //let sqlQuery = `INSERT INTO workspaces(project_codex,codex,workspace_name,dir_name,status) VALUES(?,?,?,?,1)`;
              let sqlQueryUpdateProject = `UPDATE projects SET workspace = ? WHERE codex = ?`;
              //let sqlQueryListWks = `SELECT * FROM workspaces WHERE project_codex = ? ORDER BY workspace_name`;
              dbConnection.run(sqlQueryUpdateProject, [cFilename, project_codex], (errQueryUpdateProject) => {
                if (errQueryUpdateProject){
                  res.writeHead(500, '', {
                    'Access-Control-Allow-Origin': '*', 
                    'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                  });
                  return res.end();
                }
                /* ================ */
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200, '', {
                  'Access-Control-Allow-Origin': '*', 
                  'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                });
                let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": cFilename, "data": postProcessedData});
                return res.end(payloadString);
                /* ===================== */
              });
            });
          } else {
            res.writeHead(500, '', {
              'Access-Control-Allow-Origin': '*', 
              'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
            });
            return res.end();
          }
        });
      });
    });
  });
});

app.route('/uploadOverlay').post(function(req, res) {
  let form = new formidable.IncomingForm({
    uploadDir: path.join(__dirname, config.uploadedFileDir), 
    maxFileSize: 500 * 1024 * 1024
  });
  form.parse(req, function(err, fields, files){
    let project_codex = fields.project_codex;
    let overlay_title = fields.overlay_title;
    let fileExt = helpers.fileExtensionType(files.filetoupload.type);
    let hashedFilename = helpers.hash(files.filetoupload.name +''+ files.filetoupload.mtime +''+ files.filetoupload.path);
    let cFilename = hashedFilename.substring(0, 12);
    let uFilename = cFilename + fileExt;
    let jFilename = cFilename + '.json';
    let tmppath = files.filetoupload.path;
    let newpath = config.fileUploadDir + uFilename;
    let newTempPath = config.fileUploadTempDir + uFilename;
    let newExtractTargetDir = config.fileUploadDir + cFilename;
    if(!fs.existsSync(path.join(__dirname, newExtractTargetDir))){
      fs.mkdirSync(path.join(__dirname, newExtractTargetDir), { recursive: true, mode: 0o777});
    }
    fs.rename(tmppath, path.join(__dirname, newTempPath), async function(errRename){
      if (errRename){
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
      await extract(path.join(__dirname, newTempPath), { dir: path.resolve(path.join(__dirname, newExtractTargetDir))});
      let extractedFiles = fs.readdirSync(path.join(__dirname, config.extractFileTargetDir + cFilename));
      let trimmedFileName = [];
      let regexpPattern = /\..+$/;
      extractedFiles.forEach(function(eachFile){
        trimmedFileName.push(eachFile.replace(regexpPattern,''));
      });
      ogr2ogr(path.join(__dirname, config.extractFileTargetDir + cFilename +'/'+ trimmedFileName[0] +'.shp')).exec((err, {data}) => {
        let postProcessedData = dataUtilities.wrangleOverlayData(cFilename, project_codex, overlay_title, data);
        //let featureObj = truncate(postProcessedData, {precision: 6, coordinates: 2, mutate: true});
        dataUtilities.create('overlays', cFilename, postProcessedData, function(errFileCreate){
          if(!errFileCreate){
            /* deleting extracted shapefiles directory */
            //fs.rmSync(path.join(__dirname, config.extractFileTargetDir + cFilename), { recursive: true, force: true });
            var tmpshapefiles = fs.readdirSync(path.join(__dirname, config.extractFileTargetDir + cFilename));
            tmpshapefiles.forEach(function(element){
              fs.unlinkSync(path.join(__dirname, config.extractFileTargetDir + cFilename + "/" + element));
            });
            /* deleting uploaded (+compressed) shapefile */
            fs.unlinkSync(path.join(__dirname, config.uploadedFileDir + uFilename));
            /* mainfile modification */
            /* ================ */
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200, '', {
              'Access-Control-Allow-Origin': '*', 
              'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
            });
            let payloadString = JSON.stringify({"code": 200, "message": "success", "mainfile": project_codex, "overlay_title": overlay_title, "codex": cFilename, "data": postProcessedData});
            return res.end(payloadString);
            /* ===================== */
          } else {
            res.writeHead(500, '', {
              'Access-Control-Allow-Origin': '*', 
              'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
            });
            return res.end();
          }
        });
      });
    });
  });
});

app.post('/mergePopulationData', function(req, res) {
  let form = new formidable.IncomingForm();
  form.parse(req, function(err, fields){
    let mainFilename = fields.mainfile;
    let populationData = fields.populationdata;
    dataUtilities.read('files', mainFilename, function(err, fileData){
      if(!err && fileData){
        let processedData = dataUtilities.wrangleMergePopulationData(fileData, populationData);
        dataUtilities.update('files', mainFilename, processedData, function(errFileUpdate){
          if(!errFileUpdate){
            dataUtilities.readFast('files', mainFilename, function(errReadFast, postProcessedFileData){
              if(!errReadFast && postProcessedFileData){
                /* ================ */
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200, '', {
                  'Access-Control-Allow-Origin': '*', 
                  'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                });
                let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": mainFilename, "data": postProcessedFileData});
                return res.end(payloadString);
                /* ===================== */
              } else {
                console.log(errReadFast);
                res.writeHead(500, '', {
                  'Access-Control-Allow-Origin': '*', 
                  'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                });
                return res.end();
              }
            });
          } else {
            console.log(errFileUpdate);
            res.writeHead(500, '', {
              'Access-Control-Allow-Origin': '*', 
              'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
            });
            return res.end();
          }
        });
      } else {
        console.log(err);
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
    });
  });
});

app.post('/setOverlayLabelAttribute', function(req, res) {
  let form = new formidable.IncomingForm();
  form.parse(req, function(err, fields){
    let mainFilename = fields.mainfile;
    let overlayFilename = fields.overlayfile;
    let overlayTitle = fields.overlaytitle;
    let keySelected = fields.labelkey;
    dataUtilities.read('overlays', overlayFilename, function(errReadOverlayFile, overlayFileData){
      if(!errReadOverlayFile && overlayFileData){
        let overlayFileProcessedData = dataUtilities.wrangleOverlayLabelFile(overlayFileData, keySelected);
        dataUtilities.update('overlays', overlayFilename, overlayFileProcessedData, function(errOverlayFileUpdate){
          if(!errOverlayFileUpdate){
            dataUtilities.read('files', mainFilename, function(errReadMainFile, mainFileData){
              if(!errReadMainFile && mainFileData){
                let ovProcessedData = dataUtilities.wrangleAddOverlayData(mainFileData, overlayFilename, overlayTitle);
                dataUtilities.update('files', mainFilename, ovProcessedData, function(errOverlayAddUpdate){
                  if(!errOverlayAddUpdate){
                    dataUtilities.readFast('files', mainFilename, function(errFastReadMainFile, fastReadMainFileData){
                      if(!errFastReadMainFile && fastReadMainFileData){
                        /* ================ */
                        res.setHeader('Content-Type', 'application/json');
                        res.writeHead(200, '', {
                          'Access-Control-Allow-Origin': '*', 
                          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                        });
                        let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": mainFilename, "data": fastReadMainFileData});
                        return res.end(payloadString);
                        /* ===================== */
                      } else {
                        res.writeHead(500, '', {
                          'Access-Control-Allow-Origin': '*', 
                          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                        });
                        return res.end();
                      }
                    });
                  } else {
                    res.writeHead(500, '', {
                      'Access-Control-Allow-Origin': '*', 
                      'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                    });
                    return res.end();
                  }
                });
              } else {
                res.writeHead(500, '', {
                  'Access-Control-Allow-Origin': '*', 
                  'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                });
                return res.end();
              }
            });
          } else {
            res.writeHead(500, '', {
              'Access-Control-Allow-Origin': '*', 
              'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
            });
            return res.end();
          }
        });
      } else {
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
    });
  });
});

app.post('/setAreaAttribute', function(req, res) {
  let form = new formidable.IncomingForm();
  form.parse(req, function(err, fields){
    let mainFilename = fields.filecodex;
    let keySelected = fields.areakey;
    dataUtilities.read('files', mainFilename, function(err, fileData){
      if(!err && fileData){
        let processedData = dataUtilities.wrangleAreaData(fileData, keySelected);
        dataUtilities.update('files', mainFilename, processedData, function(errFileUpdate){
          if(!errFileUpdate){
            dataUtilities.read('files', mainFilename, function(err, fileData){
              if(!err && fileData){
                /* ================ */
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200, '', {
                  'Access-Control-Allow-Origin': '*', 
                  'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                });
                let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": mainFilename, "data": fileData});
                return res.end(payloadString);
                /* ===================== */
              } else {
                res.writeHead(500, '', {
                  'Access-Control-Allow-Origin': '*', 
                  'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                });
                return res.end();
              }
            });
          } else {
            res.writeHead(500, '', {
              'Access-Control-Allow-Origin': '*', 
              'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
            });
            return res.end();
          }
        });
      } else {
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
    });
  });
});

app.post('/setDelayedPopulationAttribute', function(req, res) {
  let form = new formidable.IncomingForm();
  form.parse(req, function(err, fields){
    let mainFilename = fields.filecodex;
    dataUtilities.read('files', mainFilename, function(err, fileData){
      if(!err && fileData){
        let processedData = dataUtilities.wrangleDelayedPopulationData(fileData);
        dataUtilities.update('files', mainFilename, processedData, function(errFileUpdate){
          if(!errFileUpdate){
            dataUtilities.read('files', mainFilename, function(err, fileData){
              if(!err && fileData){
                /* ================ */
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200, '', {
                  'Access-Control-Allow-Origin': '*', 
                  'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                });
                let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": mainFilename, "data": fileData});
                return res.end(payloadString);
                /* ===================== */
              } else {
                res.writeHead(500, '', {
                  'Access-Control-Allow-Origin': '*', 
                  'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                });
                return res.end();
              }
            });
          } else {
            res.writeHead(500, '', {
              'Access-Control-Allow-Origin': '*', 
              'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
            });
            return res.end();
          }
        });
      } else {
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
    });
  });
});

app.post('/setPopulationAttributeFinalise', function(req, res) {
  let form = new formidable.IncomingForm();
  form.parse(req, function(err, fields){
    let mainFilename = fields.filecodex;
    let keySelected = fields.populationkey;
    dataUtilities.read('files', mainFilename, function(err, fileData){
      if(!err && fileData){
        let processedData = dataUtilities.wranglePopulationDataFinalise(fileData, keySelected);
        dataUtilities.update('files', mainFilename, processedData, function(errFileUpdate){
          if(!errFileUpdate){
            dataUtilities.read('files', mainFilename, function(err, fileData){
              if(!err && fileData){
                /* ================ */
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200, '', {
                  'Access-Control-Allow-Origin': '*', 
                  'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                });
                let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": mainFilename, "data": fileData});
                return res.end(payloadString);
                /* ===================== */
              } else {
                res.writeHead(500, '', {
                  'Access-Control-Allow-Origin': '*', 
                  'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                });
                return res.end();
              }
            });
          } else {
            res.writeHead(500, '', {
              'Access-Control-Allow-Origin': '*', 
              'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
            });
            return res.end();
          }
        });
      } else {
        res.writeHead(500, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        return res.end();
      }
    });
  });
});

app.post('/readMainFile', function(req, res) {
  let mainFilename = req.body.mainfile;
  dataUtilities.read('files', mainFilename, function(err, fileData){
    if(!err && fileData){
      /* ================ */
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200, '', {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
      });
      let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": mainFilename, "data": fileData});
      return res.end(payloadString);
      /* ===================== */
    } else {
      res.writeHead(500, '', {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
      });
      return res.end();
    }
  });
});

app.post('/fastReadMainFile', function(req, res) {
  let mainFilename = req.body.mainfile;
  dataUtilities.readFast('files', mainFilename, function(errReadFast, fileContents){
    if(!errReadFast && fileContents){
      /* ================ */
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200, '', {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
      });
      let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": mainFilename, "data": fileContents});
      return res.end(payloadString);
      /* ===================== */
    } else {
      res.writeHead(500, '', {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
      });
      return res.end();
    }
  });
});

app.post('/saveElectoralDistrict', function(req, res) {
  let mainFilename = req.body.mainfile;
  let districtdata = req.body.areas;
  dataUtilities.read('files', mainFilename, function(err, fileData){
    if(!err && fileData){
      /* ================ */
      let updatedData = dataUtilities.wrangleElectoralDistrict(fileData, districtdata);
      dataUtilities.update('files', mainFilename, updatedData, function(errFileUpdate){
        if(!errFileUpdate){
          dataUtilities.readFast('files', mainFilename, function(errReadFast, newFileContent){
            if(!errReadFast && newFileContent){
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(200, '', {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
              });
              let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": mainFilename, "data": newFileContent});
              return res.end(payloadString);
            } else {
              res.writeHead(500, '', {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
              });
              return res.end();
            }
          });
        } else {
          res.writeHead(500, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          return res.end();
        }
      });
      /* ===================== */
    } else {
      res.writeHead(500, '', {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
      });
      return res.end();
    }
  });
});

app.post('/resetElectoralDistrict', function(req, res) {
  let mainFilename = req.body.mainfile;
  let districtName = req.body.district;
  dataUtilities.read('files', mainFilename, function(err, fileData){
    if(!err && fileData){
      /* ================ */
      let updatedData = dataUtilities.wrangleResetRedistrictedData(fileData, districtName);
      dataUtilities.update('files', mainFilename, updatedData, function(errFileUpdate){
        if(!errFileUpdate){
          dataUtilities.readFast('files', mainFilename, function(errReadFast, newFileContent){
            if(!errReadFast && newFileContent){
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(200, '', {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
              });
              let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": mainFilename, "data": newFileContent});
              return res.end(payloadString);
            } else {
              res.writeHead(500, '', {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
              });
              return res.end();
            }
          });
        } else {
          res.writeHead(500, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          return res.end();
        }
      });
      /* ===================== */
    } else {
      res.writeHead(500, '', {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
      });
      return res.end();
    }
  });
});

app.post('/updateParliamentSeats', function(req, res) {
  let mainFilename = req.body.mainfile;
  let parliamentSeats = req.body.parliamentseats;
  let minSeats = req.body.minimumseats;
  let maxSeats = req.body.maximumseats;
  dataUtilities.read('files', mainFilename, function(err, fileData){
    if(!err && fileData){
      let processedData = dataUtilities.wrangleParliamentSeatData(fileData, parliamentSeats, minSeats, maxSeats);
      dataUtilities.update('files', mainFilename, processedData, function(errFileUpdate){
        if(!errFileUpdate){
          dataUtilities.read('files', mainFilename, function(err, fileData){
            if(!err && fileData){
              /* ================ */
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(200, '', {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
              });
              let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": mainFilename, "data": fileData});
              return res.end(payloadString);
              /* ===================== */
            } else {
              res.writeHead(500, '', {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
              });
              return res.end();
            }
          });
        } else {
          res.writeHead(500, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          return res.end();
        }
      });
    } else {
      res.writeHead(500, '', {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
      });
      return res.end();
    }
  });
});

app.post('/updateStandardDeviation', function(req, res) {
  let mainFilename = req.body.mainfile;
  let stdDev = req.body.stddev;
  let ignoreFlag = req.body.ignoreflag;
  dataUtilities.read('files', mainFilename, function(err, fileData){
    if(!err && fileData){
      let processedData = dataUtilities.wrangleStandardDeviationData(fileData, stdDev, ignoreFlag);
      dataUtilities.update('files', mainFilename, processedData, function(errFileUpdate){
        if(!errFileUpdate){
          dataUtilities.read('files', mainFilename, function(err, fileData){
            if(!err && fileData){
              /* ================ */
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(200, '', {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
              });
              let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": mainFilename, "data": fileData});
              return res.end(payloadString);
              /* ===================== */
            } else {
              res.writeHead(500, '', {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
              });
              return res.end();
            }
          });
        } else {
          res.writeHead(500, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          return res.end();
        }
      });
    } else {
      res.writeHead(500, '', {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
      });
      return res.end();
    }
  });
});

app.post('/purgeCurrentProject', function(req, res) {
  let mainFilename = req.body.mainfile;
  dataUtilities.read('files', mainFilename, function(err, fileData){
    if(!err && fileData){
      /* ================ */
      let updatedData = dataUtilities.wranglePurgeData(fileData);
      dataUtilities.update('files', mainFilename, updatedData, function(errFileUpdate){
        if(!errFileUpdate){
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": mainFilename});
          return res.end(payloadString);
        } else {
          res.writeHead(500, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          return res.end();
        }
      });
      /* ===================== */
    } else {
      res.writeHead(500, '', {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
      });
      return res.end();
    }
  });
});

app.post('/deselectSingleArea', function(req, res) {
  let mainFilename = req.body.mainfile;
  let districtName = req.body.district;
  let areaId = req.body.xfid;
  let deselectedCalc = req.body.sqcalc;
  let roundedCalc = req.body.roundedcalc;
  let remainedCalc = req.body.remainedcalc;
  dataUtilities.read('files', mainFilename, function(err, fileData){
    if(!err && fileData){
      let processedData = dataUtilities.wrangleDeselectSingleArea(fileData, districtName, areaId, deselectedCalc, roundedCalc, remainedCalc);
      dataUtilities.update('files', mainFilename, processedData, function(errFileUpdate){
        if(!errFileUpdate){
          dataUtilities.read('files', mainFilename, function(err, fileData){
            if(!err && fileData){
              /* ================ */
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(200, '', {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
              });
              let payloadString = JSON.stringify({"code": 200, "message": "success", "codex": mainFilename, "data": fileData});
              return res.end(payloadString);
              /* ===================== */
            } else {
              res.writeHead(500, '', {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
              });
              return res.end();
            }
          });
        } else {
          res.writeHead(500, '', {
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
          });
          return res.end();
        }
      });
    } else {
      res.writeHead(500, '', {
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
      });
      return res.end();
    }
  });
});

app.post('/isContiguous', function(req, res) {
  let firstGeometry = req.body.geomcollection.wktgeom;
  let secondGeometry = req.body.geomcompared;

  let instantDB = new sqlite.Database(':memory:');
  let spatialQueryGeometryType = `SELECT GeometryType(ST_GeomFromText('${firstGeometry}')) AS firstfeaturegeometrytype, GeometryType(ST_GeomFromText('${secondGeometry}')) AS secondfeaturegeometrytype;`;
  let spatialQueryTouch = `SELECT ST_Touches(ST_GeomFromText('${firstGeometry}'), ST_GeomFromText('${secondGeometry}')) AS iscontiguous;`;
  let spatialQueryIntersect = `SELECT ST_Intersects(ST_GeomFromText('${firstGeometry}'), ST_GeomFromText('${secondGeometry}')) AS isintersecting;`;
  let spatialQueryDisjoint = `SELECT ST_Disjoint(ST_GeomFromText('${firstGeometry}'), ST_GeomFromText('${secondGeometry}')) AS isdisjoint;`;
  let spatialQueryUnion = `SELECT ST_AsText(SanitizeGeometry(ST_UnaryUnion(ST_GeomFromText(ST_AsText(Gunion(ST_GeomFromText('${firstGeometry}'), ST_GeomFromText('${secondGeometry}'))))))) AS unionarea;`;
  let spatialQueryUnionGeometryType = `SELECT GeometryType(ST_GeomFromText(ST_AsText(ST_UnaryUnion(ST_GeomFromText(ST_AsText(Gunion(ST_GeomFromText('${firstGeometry}'), ST_GeomFromText('${secondGeometry}')))))))) AS unionareageometrytype;`;
  let spatialQueryCentroid = `SELECT AsGeoJSON(Centroid(ST_GeomFromText(ST_AsText(ST_UnaryUnion(ST_GeomFromText(ST_AsText(Gunion(ST_GeomFromText('${firstGeometry}'), ST_GeomFromText('${secondGeometry}')))))))), 5) AS unionareacentroid;`;
  
  instantDB.spatialite(function(err) {
    instantDB.each(spatialQueryGeometryType, function(errGeomType, rowGeomType) {
      if(errGeomType){
        console.log('Geometry type check: not passed.');
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        let payloadString = JSON.stringify({"code": 200, "message": "error", "data": {"error_at":"Features geometry type check","error_message":errGeomType.stack}});
        return res.end(payloadString);
      }
      console.log('Geometry type check: passed.');
      let firstFeatureGeometryType = rowGeomType.firstfeaturegeometrytype;
      let secondFeatureGeometryType = rowGeomType.secondfeaturegeometrytype;
      if(firstFeatureGeometryType == 'POLYGON' && secondFeatureGeometryType == 'POLYGON'){
        /* -- IF POLYGON -- */
        instantDB.each(spatialQueryDisjoint, function(errDisjoint, rowDisjoint) {
          if(errDisjoint){
            console.log('Features disjoint check: not passed.');
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200, '', {
              'Access-Control-Allow-Origin': '*', 
              'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
            });
            let payloadString = JSON.stringify({"code": 200, "message": "exception", "data": {"ispolygon":1,"iscontiguous":0,"firstfeaturegeomtype":firstFeatureGeometryType,"secondfeaturegeomtype":secondFeatureGeometryType,"error_at":"Features disjoint check","error_message":errDisjoint.stack}});
            return res.end(payloadString);
          }
          console.log('Features disjoint check: passed.');
          let isdisjoint = rowDisjoint.isdisjoint;
          if(isdisjoint == 0){
            instantDB.each(spatialQueryUnion, function(errGUnion, rowGUnion) {
              if(errGUnion){
                console.log('Features GUnion and sanitising process: not passed.');
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200, '', {
                  'Access-Control-Allow-Origin': '*', 
                  'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                });
                let payloadString = JSON.stringify({"code": 200, "message": "exception", "data": {"ispolygon":1,"isdisjoint":isdisjoint,"iscontiguous":1,"firstfeaturegeomtype":firstFeatureGeometryType,"secondfeaturegeomtype":secondFeatureGeometryType,"error_at":"Features GUnion and sanitising process","error_message":errGUnion.stack}});
                return res.end(payloadString);
              }
              console.log('Features GUnion and sanitising process: passed.');
              let gunionFeatureWKT = rowGUnion.unionarea;
              instantDB.each(`SELECT AsGeoJSON(Centroid(ST_GeomFromText('${gunionFeatureWKT}')), 5) AS unionareacentroid;`, function(errFindCentroid, foundCentroid) {
                if(errFindCentroid){
                  console.log('Combined-Feature centroid: not passed.');
                  res.setHeader('Content-Type', 'application/json');
                  res.writeHead(200, '', {
                    'Access-Control-Allow-Origin': '*', 
                    'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                  });
                  let payloadString = JSON.stringify({"code": 200, "message": "exception", "data": {"ispolygon":1,"isdisjoint":isdisjoint,"iscontiguous":1,"firstfeaturegeomtype":firstFeatureGeometryType,"secondfeaturegeomtype":secondFeatureGeometryType,"unionarea":gunionFeatureWKT,"error_at":"Combined-Feature centroid","error_message":errFindCentroid.stack}});
                  return res.end(payloadString);
                }
                console.log('Combined-Feature centroid: passed.');
                let centroidObj = JSON.parse(foundCentroid.unionareacentroid);
                let unioncentroid = centroidObj;
                  res.setHeader('Content-Type', 'application/json');
                  res.writeHead(200, '', {
                    'Access-Control-Allow-Origin': '*', 
                    'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
                  });
                  let payloadString = JSON.stringify({"code": 200, "message": "success", "data": {"ispolygon":1,"isdisjoint":isdisjoint,"iscontiguous":1,"centroid":unioncentroid,"firstfeaturegeomtype":firstFeatureGeometryType,"secondfeaturegeomtype":secondFeatureGeometryType,"unionarea":gunionFeatureWKT}});
                  return res.end(payloadString);
              });
            });
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200, '', {
              'Access-Control-Allow-Origin': '*', 
              'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
              'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
            });
            let payloadString = JSON.stringify({"code": 200, "message": "success", "data": {"ispolygon":0,"isdisjoint":isdisjoint,"iscontiguous":0,"firstfeaturegeomtype":firstFeatureGeometryType,"secondfeaturegeomtype":secondFeatureGeometryType}});
            return res.end(payloadString);
          }
        });
      } else {
        /* -- IF A OR B MULTIPOLYGON -- */
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        let payloadString = JSON.stringify({"code": 200, "message": "exception", "data": {"iscontiguous":1,"exception_at":"Features geometry type check","firstfeaturegeomtype":firstFeatureGeometryType,"secondfeaturegeomtype":secondFeatureGeometryType}});
        return res.end(payloadString);
      }
    });
  });
});

app.post('/findCentroid', function(req, res) {
  let areaGeometry = req.body.wktgeom;
  let spatialQueryCentroid = `SELECT AsGeoJSON(Centroid(ST_GeomFromText('${areaGeometry}')), 5) AS areacentroid;`;
  let instantDB = new sqlite.Database(':memory:');
  instantDB.spatialite(function(err) {
    instantDB.each(spatialQueryCentroid, function(errFindCentroid, foundCentroid) {
      if(errFindCentroid){
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        let payloadString = JSON.stringify({"code": 200, "message": "exception", "data": {"exception_at":"Feature centroid query","exception_message":errFindCentroid.stack}});
        return res.end(payloadString);
      }
      let centroidObj = JSON.parse(foundCentroid.areacentroid);
      let unioncentroid = centroidObj;
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200, '', {
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range', 
          'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
        });
        let payloadString = JSON.stringify({"code": 200, "message": "success", "data": {"centroid":unioncentroid}});
        return res.end(payloadString);
    });
  });
});

app.listen(7447, function () {
  console.log('Local-isolated server is running @port 7447...');
});

module.exports = app;