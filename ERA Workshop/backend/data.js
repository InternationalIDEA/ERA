var fs = require('fs');
var path = require('path');
var sqlite = require('spatialite');

var config = require('./config');
var helpers = require('./helpers');

var lib = {};
lib.baseDir = path.join(__dirname, '/public/data/');
lib.dbFile = lib.baseDir +'db/'+ config.sqliteDBFile;

lib.dbObject = new sqlite.Database(lib.dbFile, sqlite.OPEN_READWRITE, (err) => {
  if(err) throw err;
});

lib.create = function(dir, file, data, callback){
  fs.open(lib.baseDir + dir +'/'+ file +'.json', 'wx', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      var stringData = JSON.stringify(data, null, 2);
      fs.writeFile(fileDescriptor, stringData, function(err){
        if(!err){
          fs.close(fileDescriptor,function(err){
            if(!err){
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('Could not create new file, it may already exist');
    }
  });
};

lib.read = function(dir, file, callback){
  fs.readFile(lib.baseDir + dir +'/'+ file +'.json', 'utf8', function(err, data){
    if(!err && data){
      var parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

lib.readFast = function(dir, file, callback){
  fs.readFile(lib.baseDir + dir +'/'+ file +'.json', 'utf8', function(err, data){
    if(!err && data){
      var parsedData = helpers.parseJsonToObject(data);
      let basicProjectData = {"codex": parsedData.codex, "xfid_attribute": parsedData.xfid_attribute, "xareaname_attribute": parsedData.xareaname_attribute, "xpopulation_attribute": parsedData.xpopulation_attribute, "totalpopulation": parsedData.totalpopulation, "parliament_seats": parsedData.parliament_seats, "minimum_seats": parsedData.minimum_seats, "maximum_seats": parsedData.maximum_seats, "xparliamentseats_attribute": parsedData.xparliamentseats_attribute, "xareasqcalc_attribute": parsedData.xareasqcalc_attribute, "xareasqcalcreal_attribute": parsedData.xareasqcalcreal_attribute, "xareasqcalcremainder_attribute": parsedData.xareasqcalcremainder_attribute, "xareasqcalcremainderrounding_attribute": parsedData.xareasqcalcremainderrounding_attribute, "xareasqmin": parsedData.xareasqmin, "xareasqmax": parsedData.xareasqmax, "xareasqminmax_attribute": parsedData.xareasqminmax_attribute, "stddev": parsedData.stddev, "xstddev_attribute": parsedData.xstddev_attribute, "xstddev_ignore": parsedData.xstddev_ignore, "xredistricted_attribute": parsedData.xredistricted_attribute, "overlays": parsedData.overlays, "flag_basemap": parsedData.flag_basemap, "osm_standard": parsedData.osm_standard, "osm_dark": parsedData.osm_dark, "google_satellite": parsedData.google_satellite, "google_hybrid": parsedData.google_hybrid, "google_streets": parsedData.google_streets, "google_terrain": parsedData.google_terrain, "map_autopan": parsedData.map_autopan, "xdivider": parsedData.xdivider, "data_notes": parsedData.data_notes};
      let parsedDataFeaturesArray = parsedData.features;
      let featuresArray = [];
      parsedDataFeaturesArray.forEach(function(feature){
        featuresArray.push(feature.properties);
      });
      let featuresObject = {"features":featuresArray};
      Object.assign(basicProjectData, featuresObject);
      callback(false, basicProjectData);
    } else {
      callback(err, data);
    }
  });
};

lib.readTextCSVFile = function(dir, file, callback){
  fs.readFile(lib.baseDir + dir +'/'+ file, 'utf8', function(err, data){
    if(!err && data){
      callback(false, data);
    } else {
      callback(err, data);
    }
  });
};

lib.update = function(dir, file, data, callback){
  fs.open(lib.baseDir + dir +'/'+ file +'.json', 'r+', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      var stringData = JSON.stringify(data);
      fs.ftruncate(fileDescriptor, function(err){
        if(!err){
          fs.writeFile(fileDescriptor, stringData, function(err){
            if(!err){
              fs.close(fileDescriptor, function(err){
                if(!err){
                  callback(false);
                } else {
                  callback('Error closing existing file');
                }
              });
            } else {
              callback('Error writing to existing file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Could not open file for updating, it may not exist yet');
    }
  });
};

lib.delete = function(dir, file, callback){
  fs.unlink(lib.baseDir + dir +'/'+ file +'.json', function(err){
    callback(err);
  });
};

lib.list = function(dir, callback){
  fs.readdir(lib.baseDir + dir +'/', function(err, data){
    if(!err && data && data.length > 0){
      var trimmedFileNames = [];
      data.forEach(function(fileName){
        trimmedFileNames.push(fileName.replace('.json',''));
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
};

lib.wrangleData = function(codex, data){
  var objData = data;
  var featuresArray = objData.features;
  let fidCtr = 1;
  featuresArray.forEach(function(feature){
    let objFeaturesData = {"xfid": fidCtr, "fill_red_channel": "255", "fill_green_channel": "255", "fill_blue_channel": "255", "fill_alpha_channel": "0.6", "stroke_red_channel": "0", "stroke_green_channel": "0", "stroke_blue_channel": "0", "stroke_alpha_channel": "1", "stroke_width": "1", "centroid": {"type": "Point", "coordinates": [0,0]}};
    Object.assign(feature.properties, objFeaturesData);
    fidCtr++;
  });
  var objCommonData = {"codex": codex, "xfid_attribute": "1", "xareaname_attribute": "0", "xpopulation_attribute": "0", "totalpopulation": "0", "parliament_seats": "0", "minimum_seats": "0", "maximum_seats": "0", "xparliamentseats_attribute": "0", "xareasqcalc_attribute": "0", "xareasqcalcreal_attribute": "0", "xareasqcalcremainder_attribute": "0", "xareasqcalcremainderrounding_attribute": "0", "xareasqmin": "0", "xareasqmax": "0", "xareasqminmax_attribute": "0", "stddev": "0", "xstddev_attribute": "0", "xstddev_ignore": "0", "xredistricted_attribute": "0", "flag_overlays": "0", "overlays": [], "flag_basemap": "1", "osm_standard": "1", "osm_dark": "0", "google_satellite": "0", "google_hybrid": "0", "google_streets": "0", "google_terrain": "0", "map_autopan": true, "data_notes": "-"};
  Object.assign(objData, objCommonData);
  return objData;
};

lib.wrangleOverlayData = function(codex, mainfile, title, data){
  var objData = data;
  var featuresArray = objData.features;
  let fidCtr = 1;
  featuresArray.forEach(function(feature){
    let objFeaturesData = {"ovfid": fidCtr};
    Object.assign(feature.properties, objFeaturesData);
    fidCtr++;
  });
  var objCommonData = {"codex": codex, "mainfile": mainfile, "overlaytitle": title};
  Object.assign(objData, objCommonData);
  return objData;
};

lib.wrangleAddOverlayData = function(data, overlayFilename, overlayTitle){
  var objData = data;
  let arrayOverlays = objData.overlays;
  let newOverlayObject = {"title": overlayTitle, "srcfile": overlayFilename};
  let modifiedOverlaysArrayObject = lib.appendSelectedObject(arrayOverlays, newOverlayObject);
  var objCommonData = {"flag_overlays": "1", "overlays": modifiedOverlaysArrayObject};
  Object.assign(objData, objCommonData);
  return objData;
};

lib.wrangleOverlayLabelFile = function(data, labelkey){
  var objData = data;
  var featuresArray = objData.features;
  featuresArray.forEach(function(feature){
    let propertiesObject = feature.properties;
    for (const [key, value] of Object.entries(propertiesObject)) {
      if(key == labelkey){
        let objFeaturesData = {"ovlabel": value};
        Object.assign(feature.properties, objFeaturesData);
      }
    }
  });
  return objData;
};

lib.wrangleAreaData = function(data, areakey){
  var objData = data;
  var objCommonData = {"xareaname_attribute": "1"};
  Object.assign(objData, objCommonData);
  var featuresArray = objData.features;
  featuresArray.forEach(function(feature){
    let propertiesObject = feature.properties;
    for (const [key, value] of Object.entries(propertiesObject)) {
      if(key == areakey){
        let objFeaturesData = {"xareaname": value};
        Object.assign(feature.properties, objFeaturesData);
      }
    }
  });
  return objData;
};

lib.wrangleDelayedPopulationData = function(data){
  var objData = data;
  var objCommonData = {"xpopulation_attribute": "0"};
  Object.assign(objData, objCommonData);
  return objData;
};

lib.wranglePopulationDataFinalise = function(data, populationkey){
  var objData = data;
  var objCommonData = {"xpopulation_attribute": "1"};
  Object.assign(objData, objCommonData);
  var featuresArray = objData.features;
  featuresArray.forEach(function(feature){
    let propertiesObject = feature.properties;
    for (const [key, value] of Object.entries(propertiesObject)) {
      if(key == populationkey){
        let objFeaturesData = {"xarea_population": value, "xcalc_sq": "0", "xcalc_round": "0", "xcalc_remain": "0", "is_redistricted": "0", "electoral_district": "-", "district_xcalc_sq": "0", "district_xcalc_round": "0", "district_xcalc_remain": "0"};
        Object.assign(feature.properties, objFeaturesData);
      }
    }
  });
  return objData;
};

lib.wrangleMergePopulationData = function(data, populationdata){
  var objData = data;
  var featuresArray = objData.features;
  var populationDataArray = JSON.parse(populationdata);
  let populationCounter = 0;
  featuresArray.forEach(function(feature){
    let propertiesObject = feature.properties;
    for (const [key, value] of Object.entries(propertiesObject)) {
      populationDataArray.forEach(function(popData){
        let valueStr = ''+value;
        if(popData.xareaname.toUpperCase() == valueStr.toUpperCase()){
          let objFeaturesData = {"xarea_population": parseInt(popData.xarea_population), "xcalc_sq": "0", "xcalc_round": "0", "xcalc_remain": "0", "is_redistricted": "0", "electoral_district": "-", "district_xcalc_sq": "0", "district_xcalc_round": "0", "district_xcalc_remain": "0"};
          Object.assign(feature.properties, objFeaturesData);
          populationCounter += parseInt(popData.xarea_population);
        }
      });
    }
  });
  var objCommonData = {"xpopulation_attribute": "1", "totalpopulation": populationCounter};
  Object.assign(objData, objCommonData);
  return objData;
};

lib.wrangleParliamentSeatData = function(data, seats, minseats, maxseats){
  var objData = data;
  var objCommonData = {"parliament_seats": seats, "minimum_seats": minseats, "maximum_seats": maxseats, "xparliamentseats_attribute": "1"};
  Object.assign(objData, objCommonData);
  if(objData.xpopulation_attribute == '1'){
    var featuresArray = objData.features;
    let totalPopulation = 0;
    featuresArray.forEach(function(feature){
      totalPopulation += parseInt(feature.properties.xarea_population);
    });
    let populationToSQ = parseInt(totalPopulation) / parseInt(seats);
    featuresArray.forEach(function(feature){
      let calcsqarea = parseInt(feature.properties.xarea_population) / parseFloat(populationToSQ);
      let roundedToInt = lib.truncateFloat(calcsqarea.toFixed(2), 'integer');
      let truncatedDecimal = lib.truncateFloat(calcsqarea.toFixed(2), 'decimal');
      let objFeaturesData = {"xcalc_sq": calcsqarea.toFixed(2), "xcalc_round": roundedToInt, "xcalc_remain": truncatedDecimal};
      Object.assign(feature.properties, objFeaturesData);
    });
    var objCommonDataExt = {"totalpopulation": totalPopulation, "xdivider": populationToSQ.toFixed(4), "xareasqcalc_attribute": "1", "xareasqcalcreal_attribute": "1","xareasqcalcremainder_attribute": "1"};
    Object.assign(objData, objCommonDataExt);
    return objData;
  } else {
    return objData;
  }
};

lib.truncateFloat = function(strnumber, returnpart){
  /* TODO: Find the safe way to round the calculated number */
  returnpart = typeof returnpart !== 'undefined' ? returnpart : 'integer';
  if(returnpart == 'integer'){
    let roundedNumber = Math.round(parseFloat(strnumber));
    return roundedNumber.valueOf();
  } else if(returnpart == 'decimal'){
    let stringifiedNumber = ''+parseFloat(strnumber).valueOf()+'';
    let fractionsArray = stringifiedNumber.split('.');
    if(parseInt(fractionsArray[1]) <= 48){
      return '0.'+fractionsArray[1].valueOf()+'';
    } else {
      return '0';
    }
  } else {
    let roundedNumber = Math.round(parseFloat(strnumber));
    return roundedNumber.valueOf();
  }
};

lib.wrangleStandardDeviationData = function(data, stddev, ignoreflag){
  var objData = data;
  var objCommonData = {"stddev": stddev, "xstddev_attribute": "1", "xstddev_ignore": ignoreflag};
  Object.assign(objData, objCommonData);
  return objData;
};

lib.wrangleElectoralDistrict = function(data, districtdata){
  var objData = data;
  var arrayDistrictData = districtdata;
  var objCommonData = {"xredistricted_attribute": "1"};
  Object.assign(objData, objCommonData);
  var featuresArray = objData.features;
  featuresArray.forEach(function(feature){
    arrayDistrictData.forEach(function(district){
      if(feature.properties.xfid == district.xfid){
        let centroidObj = JSON.parse(district.centroid);
        let featureDistrictObject = {"is_redistricted": district.is_redistricted, "electoral_district": district.electoral_district, "fill_red_channel": district.fill_red_channel, "fill_green_channel": district.fill_green_channel, "fill_blue_channel": district.fill_blue_channel, "fill_alpha_channel": district.fill_alpha_channel, "stroke_red_channel": "0", "stroke_green_channel": "0", "stroke_blue_channel": "0", "stroke_alpha_channel": "1", "stroke_width": "3", "district_xcalc_sq": district.district_xcalc_sq, "district_xcalc_round": district.district_xcalc_round, "district_xcalc_remain": district.district_xcalc_remain, "centroid": centroidObj};
        Object.assign(feature.properties, featureDistrictObject);
      } else {
        return;
      }
    });
  });
  return objData;
};

lib.wrangleDeselectSingleArea = function(data, district, areaid, calculated, rounded, remained){
  var objData = data;
  var districtName = district;
  var areaFid = areaid;
  var deselectedCalculated = calculated;
  var deselectedRounded = rounded;
  var deselectedRemained = remained;
  var featuresArray = objData.features;
  featuresArray.forEach(function(feature){
    if(feature.properties.xfid == areaFid){
      let objFeaturesData = {"is_redistricted": "0", "electoral_district": "-", "district_xcalc_sq": "0", "district_xcalc_round": "0", "district_xcalc_remain": "0", "fill_red_channel": "255", "fill_green_channel": "255", "fill_blue_channel": "255", "fill_alpha_channel": "0.6", "stroke_red_channel": "0", "stroke_green_channel": "0", "stroke_blue_channel": "0", "stroke_alpha_channel": "1", "stroke_width": "1", "centroid": {"type": "Point", "coordinates": [0,0]}};
      Object.assign(feature.properties, objFeaturesData);
    } else {
      return;
    }
  });
  var redistrictedArray = objData.features;
  redistrictedArray.forEach(function(feature){
    if(feature.properties.electoral_district == districtName){
      let objRedistrictedData = {"district_xcalc_sq": deselectedCalculated, "district_xcalc_round": deselectedRounded, "district_xcalc_remain": deselectedRemained};
      Object.assign(feature.properties, objRedistrictedData);
    } else {
      return;
    }
  });
  var checkRedistArray = objData.features;
  var districtedArray = [];
  checkRedistArray.forEach(function(item, index){
    if(item.is_redistricted == 1){
      districtedArray.push(item);
    }
  });
  if(districtedArray.length > 0){
    var objCommonData = {"xredistricted_attribute": "1"};
    Object.assign(objData, objCommonData);
    return objData;
  } else {
    var objCommonData = {"xredistricted_attribute": "0"};
    Object.assign(objData, objCommonData);
    return objData;
  }
};

lib.wranglePurgeData = function(data){
  var objData = data;
  var objCommonData = {"xredistricted_attribute": "0"};
  Object.assign(objData, objCommonData);
  var featuresArray = objData.features;
  featuresArray.forEach(function(feature){
    let objFeaturesData = {"is_redistricted": "0", "electoral_district": "-", "district_xcalc_sq": "0", "district_xcalc_round": "0", "district_xcalc_remain": "0", "fill_red_channel": "255", "fill_green_channel": "255", "fill_blue_channel": "255", "fill_alpha_channel": "0.6", "stroke_red_channel": "0", "stroke_green_channel": "0", "stroke_blue_channel": "0", "stroke_alpha_channel": "1", "stroke_width": "1", "centroid": {"type": "Point", "coordinates": [0,0]}};
    Object.assign(feature.properties, objFeaturesData);
  });
  return objData;
};

lib.wrangleResetRedistrictedData = function(data, district){
  var objData = data;
  var districtName = district;
  var featuresArray = objData.features;
  featuresArray.forEach(function(feature){
    if(feature.properties.electoral_district == districtName){
      let objFeaturesData = {"is_redistricted": "0", "electoral_district": "-", "district_xcalc_sq": "0", "district_xcalc_round": "0", "district_xcalc_remain": "0", "fill_red_channel": "255", "fill_green_channel": "255", "fill_blue_channel": "255", "fill_alpha_channel": "0.6", "stroke_red_channel": "0", "stroke_green_channel": "0", "stroke_blue_channel": "0", "stroke_alpha_channel": "1", "stroke_width": "1", "centroid": {"type": "Point", "coordinates": [0,0]}};
      Object.assign(feature.properties, objFeaturesData);
    }
  });
  var checkRedistArray = objData.features;
  console.log(checkRedistArray);
  var districtedArray = [];
  checkRedistArray.forEach(function(item, index){
    if(item.properties.is_redistricted == 1){
      districtedArray.push(item);
    }
  });
  console.log(districtedArray.length);
  if(districtedArray.length > 0){
    var objCommonData = {"xredistricted_attribute": "1"};
    Object.assign(objData, objCommonData);
    return objData;
  } else {
    var objCommonData = {"xredistricted_attribute": "0"};
    Object.assign(objData, objCommonData);
    return objData;
  }
};

lib.appendSelectedObject = function(initialArray, newObject) {
  const dynamicObject = Object.freeze(newObject);
  return Object.freeze(initialArray.concat(dynamicObject));
}

lib.updateCommonData = function(data, dataKey, dataValue){
  var objData = data;
  var objCommonData = {dataKey: dataValue};
  Object.assign(objData, objCommonData);
  return objData;
};

lib.updateFeatureData = function(fileName, dataId, dataKey, dataValue){
  var objData = data;
  var featuresArray = objData.features;
  featuresArray.forEach(function(feature){
    let propertiesObject = feature.properties;
    for (const [key, value] of Object.entries(propertiesObject)) {
      populationDataArray.forEach(function(popData){
        let valueStr = ''+value;
        if(popData.xareaname.toUpperCase() == valueStr.toUpperCase()){
          let objFeaturesData = {"xarea_population": parseInt(popData.xarea_population), "xcalc_sq": "0", "xcalc_round": "0", "xcalc_remain": "0", "is_redistricted": "0", "electoral_district": "-", "district_xcalc_sq": "0", "district_xcalc_round": "0", "district_xcalc_remain": "0"};
          Object.assign(feature.properties, objFeaturesData);
          populationCounter += parseInt(popData.xarea_population);
        }
      });
    }
  });
  var objCommonData = {"xpopulation_attribute": "1", "totalpopulation": populationCounter};
  Object.assign(objData, objCommonData);
  return objData;
};

module.exports = lib;