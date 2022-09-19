import Feature from 'ol/Feature';
import { GeoJSON, WKT } from 'ol/format';
import Map from 'ol/Map';
import View from 'ol/View';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Group as LayerGroup, Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import Select from 'ol/interaction/Select';
import Overlay from 'ol/Overlay';
import { Attribution, Control, ScaleLine, defaults as defaultControls } from 'ol/control';
import { click } from 'ol/events/condition';
import LayerSwitcher from 'ol-layerswitcher';
import { RedistrictingToolbox, RedistrictingToolboxStacked, RedistrictingResumeTable } from './webmap-toolbox';
import numeral from 'numeral';
import Picker from 'vanilla-picker';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import imageLogo from './logoimage';

var lib = {};

lib.createUtilityMap = function(data){
  let map;
  let mapData = data;
  /* if(parseInt(mapData.xpopulation_attribute) == 1){
    if(parseInt(mapData.xparliamentseats_attribute) == 1){
      if(parseInt(mapData.xredistricted_attribute) == 1){
        lib.createUtilityMapStageFour(mapData);
        console.log('map stage 4 - area name, population, area quota + select area label + toolbox + resume table');
      } else {
        lib.createUtilityMapStageThree(mapData);
        console.log('map stage 3 - area name, population, area quota + select area label + toolbox');
      }
    } else {
      lib.createUtilityMapStageTwo(mapData);
      console.log('map stage 2 - area name, population + area quota label');
    }
  } else {
    lib.createUtilityMapStageOne(mapData);
    console.log('map stage 1 - only area name label');
  } */
  let mapAnchor = document.getElementById('data_view_body');
  let mapDOM = `<div class="relative w-full h-full">
      <div id="map" class="full-w-reduced-height"></div>
      <input type="hidden" id="selectedfeaturegeometrystring" value=""/>
      <input type="hidden" id="selectedfeaturecentroid" value=""/>
      <input type="hidden" id="firstfeaturecentroid" value=""/>
      <div id="popup" class="hidden ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer text-white"></a>
        <div id="popup-content">
          <input type="hidden" id="f_xfid" value=""/>
          <input type="hidden" id="f_xareaname" value=""/>
          <input type="hidden" id="f_population" value=""/>
          <input type="hidden" id="f_quotacalc" value=""/>
          <input type="hidden" id="f_electoraldistrict" value=""/>
          <input type="hidden" id="deselected_xcalc" value=""/>
          <input type="hidden" id="deselected_xcalc_round" value=""/>
          <input type="hidden" id="deselected_xcalc_remains" value=""/>
          <table id="inpopuptable" class="mt-0 w-full table-auto border-collapse border border-blue-900">
            <thead>
              <tr>
                <th colspan="2" class="text-sm text-center align-middle py-2 bg-blue-900 text-gray-50">Area Data</th>
              </tr>
            </thead>
            <tfoot id="inpopuptablefooter" class="hidden inpopuptablefooterclass">
              <tr id="inpopupcontiguousrow" class="hidden">
                <td colspan="2" class="text-sm text-center font-semibold text-yellow-500 py-1 px-1 bg-red-700">This area is not contiguous with previously selected area(s).</td>
              </tr>
              <tr id="inpopupdeselectareafailed" class="hidden">
                <td colspan="2" class="text-sm text-center font-semibold text-yellow-500 py-1 px-1 bg-red-700">Deselection failed due to rule violation. Delete the entire district instead.</td>
              </tr>
              <tr>
                <td colspan="2" class="text-right py-1 px-1">
                  <button role="button" id="unselectfeature" class="hidden text-sm text-gray-50 px-3 py-1 border border-gray-500 focus:outline-none focus:ring-0 bg-red-700 area-unselector-button">Deselect Area</button>
                  <button role="button" id="deselectfeature" class="hidden text-sm px-3 py-1 border border-gray-500 focus:outline-none focus:ring-0 area-deselector-button">Deselect Area</button>
                  <button role="button" id="confirmdeselect" class="hidden text-sm px-3 py-1 border border-gray-500 focus:outline-none focus:ring-0 confirm-area-deselect-button">Proceed to Deselect Area</button>
                  <button role="button" id="canceldeselect" class="hidden text-sm px-3 py-1 border border-gray-500 focus:outline-none focus:ring-0 cancel-area-deselect-button">Cancel Deselect Area</button>
                  <button role="button" id="addfeaturetocombine" class="text-sm px-3 py-1 area-selector-disabled-button border border-gray-500 focus:outline-none focus:ring-0" disabled="true">Select Area</button>
                </td>
              </tr>
            </tfoot>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>`;
  mapAnchor.insertAdjacentHTML('afterbegin', mapDOM);

  sessionStorage.setItem('tbxdata', JSON.stringify([]));
  sessionStorage.setItem('geomdata', JSON.stringify([]));
  sessionStorage.setItem('geomtobe', JSON.stringify([]));
  sessionStorage.setItem('contiguouscheck', '0');
  sessionStorage.setItem('iscontiguous', '1');
  sessionStorage.setItem('centroid', '-');
  sessionStorage.setItem('firstcentroid', '-');

  const projectStringNameRef = document.getElementById('project_name_reference').value;
  const container = document.getElementById('popup');
  const content = document.getElementById('popup-content');
  const closer = document.getElementById('popup-closer');

  let onscreenSelectedFeatures = [];

  let areaIdStatus = parseInt(mapData.xfid_attribute);
  let areaNameLabelingStatus = parseInt(mapData.xareaname_attribute);
  let populationStatus = parseInt(mapData.xpopulation_attribute);
  let parliamentSeatStatus = parseInt(mapData.xparliamentseats_attribute);
  let minimumDistrictSeatNumber = parseInt(mapData.minimum_seats);
  let maximumDistrictSeatNumber = parseInt(mapData.maximum_seats);
  let areaQuotaCalculationStatus = parseInt(mapData.xareasqcalc_attribute);
  let areaStdDevAttrSetStatus = parseInt(mapData.xstddev_attribute);
  let areaStdDevIgnoreStatus = parseInt(mapData.xstddev_ignore);
  //let areaStdDeviationValue = parseInt(mapData.stddev);
  let areaStdDeviationValue = mapData.stddev;
  let areaDistrictingStatus = parseInt(mapData.xredistricted_attribute);
  // let setStdDevValue = parseInt(mapData.stddev);
  let setStdDevValue = mapData.stddev;
  let overlayAutoPan = mapData.map_autopan;
  let overlayObjects = mapData.overlays;

  const popcontainer = document.getElementById('popup');
  const popcloser = document.getElementById('popup-closer');
  const popuptablefooter = document.getElementById('inpopuptablefooter');
  const unsufficientcalcnotice = document.getElementById('inpopupdeselectareafailed');
  const contiguousrow = document.getElementById('inpopupcontiguousrow');
  var dataselector = document.getElementById('addfeaturetocombine');
  var unselectorbutton = document.getElementById('unselectfeature');
  const deselectorbutton = document.getElementById('deselectfeature');
  const confirmdeselectbutton = document.getElementById('confirmdeselect');
  const canceldeselectbutton = document.getElementById('canceldeselect');
  var deselectedcalc = document.getElementById('deselected_xcalc');
  var deselectedrounded = document.getElementById('deselected_xcalc_round');
  var deselectedremains = document.getElementById('deselected_xcalc_remains');
  var selectedfeaturegeometrystring = document.getElementById('selectedfeaturegeometrystring');
  var firstfeaturecentroid = document.getElementById('firstfeaturecentroid');
  var selectedfeaturecentroid = document.getElementById('selectedfeaturecentroid');

  const overlay = new Overlay({
    element: container,
    autoPan: overlayAutoPan,
    autoPanAnimation: {
      duration: 250,
    },
  });

  popcloser.onclick = function () {
    document.getElementById('f_xfid').value = '';
    document.getElementById('f_xareaname').value = '';
    document.getElementById('f_population').value = '';
    document.getElementById('f_quotacalc').value = '';
    popuptablefooter.classList.add('hidden');
    contiguousrow.classList.add('hidden');
    dataselector.disabled = true;
    setTimeout(function(){
      overlay.setPosition(undefined);
      popcloser.blur();
      if(!deselectorbutton.classList.contains('hidden')){
        deselectorbutton.classList.add('hidden');
      }
      if(!confirmdeselectbutton.classList.contains('hidden')){
        confirmdeselectbutton.classList.add('hidden');
      }
      lib.popupStateReset();
      return false;
    }, 100);
  };

  dataselector.onclick = function(){
    let exceedStdDevWarningElm = document.getElementById('toolboxnotice-stddevexceedwarning');
    let underStdDevWarningElm = document.getElementById('toolboxnotice-stddevunderwarning');
    let tbxData = sessionStorage.getItem('tbxdata');
    let geomData = sessionStorage.getItem('geomdata');
    let stdDevPassFlagElm = document.getElementById('stddevpass');
    let tbxArray = JSON.parse(tbxData);
    let geomArray = JSON.parse(geomData);
    let tbodyRef = document.getElementById('areatoprocess').getElementsByTagName('tbody')[0];
    let initCalc = document.getElementById('currentquotacounter').value;
    let selectedFeatureId = document.getElementById('f_xfid').value;
    let selectedFeatureName = document.getElementById('f_xareaname').value;
    let selectedFeaturePopulation = document.getElementById('f_population').value;
    let selectedFeatureQuota = document.getElementById('f_quotacalc').value;
    let selectedFeatureGeometry = document.getElementById('selectedfeaturegeometrystring').value;
    let selectedFeatureCentroid = document.getElementById('selectedfeaturecentroid').value;
    let selectedFeatureCentroidObj = JSON.parse(selectedFeatureCentroid);
    let cCentroidLng = selectedFeatureCentroidObj.coordinates[0];
    let cCentroidLat = selectedFeatureCentroidObj.coordinates[1];
    let firstFeatureCentroid = document.getElementById('firstfeaturecentroid').value;
    let selFeatureObj = {"wktgeom":selectedFeatureGeometry};
    let runningQuotaCounterCell = document.getElementById('quotaCounterCell');
    let runningSeatAllocationCounterCell = document.getElementById('seatallocation');
    let ignoreStdDevValue = document.getElementById('stddevignore').value;
    let runningStdDevValue = document.getElementById('stddev').value;
    /* ============ */
    let updateArrayToolboxObject = lib.appendSelectedObject(tbxArray, {"xfid":selectedFeatureId,"xareaname":selectedFeatureName,"xarea_population":selectedFeaturePopulation,"xcalc_sq":selectedFeatureQuota,"centroid":{"type":"Point","coordinates":[cCentroidLng,cCentroidLat]}});
    sessionStorage.setItem('tbxdata', JSON.stringify(updateArrayToolboxObject));
    //let updateArrayGeometryObject = lib.appendSelectedObject(geomArray, selFeatureObj);
    //sessionStorage.setItem('geomdata', JSON.stringify(updateArrayGeometryObject));
    sessionStorage.setItem('geomdata', JSON.stringify([selFeatureObj]));
    sessionStorage.setItem('centroid', selectedFeatureCentroid);
    sessionStorage.setItem('firstcentroid', firstFeatureCentroid);
    /* ============ */
    let newAreaRow = tbodyRef.insertRow();
    let newAreanameCell = newAreaRow.insertCell();
    let newAreanameCellContent = document.createTextNode(selectedFeatureName);
    newAreanameCell.appendChild(newAreanameCellContent);
    newAreanameCell.classList.add('border');
    newAreanameCell.classList.add('border-b');
    newAreanameCell.classList.add('border-r');
    newAreanameCell.classList.add('border-blue-900');
    newAreanameCell.classList.add('px-1');
    newAreanameCell.classList.add('w-40');
    let newAreaquotaCell = newAreaRow.insertCell();
    let newAreaquotaCellContent = document.createTextNode(selectedFeatureQuota);
    newAreaquotaCell.appendChild(newAreaquotaCellContent);
    newAreaquotaCell.classList.add('text-right');
    newAreaquotaCell.classList.add('border');
    newAreaquotaCell.classList.add('border-b');
    newAreaquotaCell.classList.add('border-blue-900');
    newAreaquotaCell.classList.add('px-1');
    let runningCalc = parseFloat(initCalc) + parseFloat(selectedFeatureQuota);
    runningQuotaCounterCell.innerText = runningCalc.toFixed(2);
    runningSeatAllocationCounterCell.innerText = Math.round(runningCalc);
    document.getElementById('currentquotacounter').value = runningCalc.toFixed(2);
    document.getElementById('roundedseatallocation').value = Math.round(runningCalc);
    let remainderNumber = parseFloat(parseFloat(runningCalc.toFixed(2)) - parseFloat(Math.round(runningCalc)));
    document.getElementById('roundedremainder').value = remainderNumber.toFixed(2);
    if(ignoreStdDevValue == 0){
      if(runningStdDevValue == 0){
        if(remainderNumber != 0){
          if(exceedStdDevWarningElm.classList.contains('hidden')){
            exceedStdDevWarningElm.classList.remove('hidden');
            stdDevPassFlagElm.value = 0;
          } else {
            stdDevPassFlagElm.value = 0;
          }
        } else {
          if(exceedStdDevWarningElm.classList.contains('hidden')){
            stdDevPassFlagElm.value = 1;
          } else {
            exceedStdDevWarningElm.classList.add('hidden');
            stdDevPassFlagElm.value = 1;
          }
        }
      } else {
        let realRemainder = parseFloat(runningCalc.toFixed(2)) - parseFloat(parseInt(runningCalc));
        let fixedRemainder = realRemainder.toFixed(2);
        if(parseInt(runningCalc) == Math.round(runningCalc)){
          /* PEMBULATAN KE BAWAH */
          let lowerDeviation = parseFloat(parseFloat(parseInt(runningCalc)) - parseFloat(runningStdDevValue));
          let upperDeviation = parseFloat(parseFloat(parseInt(runningCalc)) + parseFloat(runningStdDevValue));
          if(parseFloat(runningCalc.toFixed(2)) <= parseFloat(upperDeviation) && parseFloat(runningCalc.toFixed(2)) >= parseFloat(lowerDeviation)){
            if(exceedStdDevWarningElm.classList.contains('hidden') == false){
              exceedStdDevWarningElm.classList.add('hidden');
            }
            if(underStdDevWarningElm.classList.contains('hidden') == false){
              underStdDevWarningElm.classList.add('hidden');
            }
            stdDevPassFlagElm.value = 1;
          } else {
            if(parseFloat(runningCalc.toFixed(2)) > parseFloat(upperDeviation)){
              if(exceedStdDevWarningElm.classList.contains('hidden') == true){
                exceedStdDevWarningElm.classList.remove('hidden');
              }
              if(underStdDevWarningElm.classList.contains('hidden') == false){
                underStdDevWarningElm.classList.add('hidden');
              }
              stdDevPassFlagElm.value = 0;
            } else if(parseFloat(runningCalc.toFixed(2)) < parseFloat(lowerDeviation)){
              if(exceedStdDevWarningElm.classList.contains('hidden') == false){
                exceedStdDevWarningElm.classList.add('hidden');
              }
              if(underStdDevWarningElm.classList.contains('hidden') == true){
                underStdDevWarningElm.classList.remove('hidden');
              }
              stdDevPassFlagElm.value = 0;
            } else {
              stdDevPassFlagElm.value = 0;
              alert('Error: You must restart the redistricting process.');
            }
          }
          // console.log(`Hasil: ${runningCalc.toFixed(2)}, Metode: Pembulatan ke BAWAH, Pembulatan: ${parseInt(runningCalc)}, Sisa: ${fixedRemainder}, BB: ${lowerDeviation}, BA: ${upperDeviation}`);
        } else {
          /* PEMBULATAN KE ATAS */
          let lowerDeviation = parseFloat(parseFloat(Math.round(runningCalc)) - parseFloat(runningStdDevValue));
          let upperDeviation = parseFloat(parseFloat(Math.round(runningCalc)) + parseFloat(runningStdDevValue));
          if(parseFloat(runningCalc.toFixed(2)) >= parseFloat(lowerDeviation) && parseFloat(runningCalc.toFixed(2)) <= parseFloat(Math.round(runningCalc))){
            if(exceedStdDevWarningElm.classList.contains('hidden') == false){
              exceedStdDevWarningElm.classList.add('hidden');
            }
            if(underStdDevWarningElm.classList.contains('hidden') == false){
              underStdDevWarningElm.classList.add('hidden');
            }
            stdDevPassFlagElm.value = 1;
          } else {
            if(parseFloat(runningCalc.toFixed(2)) < parseFloat(lowerDeviation)){
              /* Hasil perhitungan lebih kecil dari batas bawah std deviation */
              if(exceedStdDevWarningElm.classList.contains('hidden') == false){
                exceedStdDevWarningElm.classList.add('hidden');
              }
              if(underStdDevWarningElm.classList.contains('hidden') == true){
                underStdDevWarningElm.classList.remove('hidden');
              }
              stdDevPassFlagElm.value = 0;
            } else if(parseFloat(runningCalc.toFixed(2)) > parseFloat(upperDeviation)){
              /* Hasil perhitungan melampaui batas atas pembulatan + std deviation [tidak masuk-akal, tapi untuk pemenuhan if-else saja] */
              if(exceedStdDevWarningElm.classList.contains('hidden') == true){
                exceedStdDevWarningElm.classList.remove('hidden');
              }
              if(underStdDevWarningElm.classList.contains('hidden') == false){
                underStdDevWarningElm.classList.add('hidden');
              }
              stdDevPassFlagElm.value = 0;
            } else {
              stdDevPassFlagElm.value = 0;
              alert('Error: You must restart the redistricting process.');
            }
          }
          // console.log(`Hasil: ${runningCalc.toFixed(2)}, Metode: Pembulatan ke ATAS, Pembulatan: ${Math.round(runningCalc)}, Sisa: ${fixedRemainder}, BB: ${lowerDeviation}, BA: ${upperDeviation}`);
        }
      }
    }

    let featuresArrayVar = vectorLayer.getSource().getFeatures();
    featuresArrayVar.forEach(function(feature){
      if(feature.get('xfid') != undefined && feature.get('xfid') == selectedFeatureId){
        feature.setStyle(selectedFeatureOnMapStyle);
        selectedFeaturesVectorSource.addFeature(feature);
      }
    });

    setTimeout(function(){
      overlay.setPosition(undefined);
      popcloser.blur();
      popuptablefooter.classList.add('hidden');
      contiguousrow.classList.add('hidden');
      dataselector.classList.remove('area-selector-enabled-button');
      dataselector.classList.add('area-selector-disabled-button');
      dataselector.disabled = true;
      if(dataselector.classList.contains('hidden')){
        dataselector.classList.remove('hidden');
      }
      if(!confirmdeselectbutton.classList.contains('hidden')){
        confirmdeselectbutton.classList.add('hidden');
      }
      lib.popupStateReset();
      return false;
    }, 500);
  }

  deselectorbutton.onclick = function(){
    let prjMainFile = document.getElementById('view_mainfile_codex').value;
    let reqPayload = JSON.stringify({"mainfile":prjMainFile});
    let d_fid = document.getElementById('f_xfid').value;
    let d_areaquota = document.getElementById('f_quotacalc').value;
    let d_eld = document.getElementById('f_electoraldistrict').value;
    let districtArray = [];
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onload = function(){
      let resObj = xhr.response;
      let minseat = resObj.data.minimum_seats;
      let maxseat = resObj.data.maximum_seats;
      let stddevignoresetting = resObj.data.xstddev_ignore;
      let stddev = resObj.data.stddev;
      let mainFileData = resObj.data.features;
      mainFileData.forEach(function(arrayitem){
        if(arrayitem.electoral_district == d_eld){
          districtArray.push(arrayitem);
        }
      });
      let runningCalc = parseFloat(districtArray[0].district_xcalc_sq) - parseFloat(d_areaquota);
      let deselectedCalc = runningCalc.toFixed(2);
      let deselectedRoundCalc = Math.round(deselectedCalc);
      let deselectedRemainsCalc = parseFloat(deselectedRoundCalc) - parseFloat(deselectedCalc);
      let realRemainder = parseFloat(runningCalc.toFixed(2)) - parseFloat(parseInt(runningCalc));
      if(parseInt(minseat) > 0){
        if(parseInt(minseat) > parseInt(deselectedCalc)){
          popuptablefooter.classList.remove('hidden');
          unsufficientcalcnotice.classList.remove('hidden');
          deselectorbutton.classList.add('hidden');
          canceldeselectbutton.classList.remove('hidden');
        } else {
          if(parseInt(stddevignoresetting) == 1){
            document.getElementById('deselected_xcalc').value = deselectedCalc;
            document.getElementById('deselected_xcalc_round').value = deselectedRoundCalc;
            document.getElementById('deselected_xcalc_remains').value = deselectedRemainsCalc.toFixed(2);
            popuptablefooter.classList.remove('hidden');
            deselectorbutton.classList.add('hidden');
            confirmdeselectbutton.classList.remove('hidden');
          } else {
            if(parseFloat(stddev) == 0){
              if(parseFloat(realRemainder) == 0){
                document.getElementById('deselected_xcalc').value = deselectedCalc;
                document.getElementById('deselected_xcalc_round').value = deselectedRoundCalc;
                document.getElementById('deselected_xcalc_remains').value = deselectedRemainsCalc.toFixed(2);
                popuptablefooter.classList.remove('hidden');
                deselectorbutton.classList.add('hidden');
                confirmdeselectbutton.classList.remove('hidden');
              } else {
                popuptablefooter.classList.remove('hidden');
                unsufficientcalcnotice.classList.remove('hidden');
                deselectorbutton.classList.add('hidden');
                canceldeselectbutton.classList.remove('hidden');
              }
            } else {
              if(parseFloat(realRemainder) <= parseFloat(stddev)){
                document.getElementById('deselected_xcalc').value = deselectedCalc;
                document.getElementById('deselected_xcalc_round').value = deselectedRoundCalc;
                document.getElementById('deselected_xcalc_remains').value = deselectedRemainsCalc.toFixed(2);
                popuptablefooter.classList.remove('hidden');
                deselectorbutton.classList.add('hidden');
                confirmdeselectbutton.classList.remove('hidden');
              } else {
                popuptablefooter.classList.remove('hidden');
                unsufficientcalcnotice.classList.remove('hidden');
                deselectorbutton.classList.add('hidden');
                canceldeselectbutton.classList.remove('hidden');
              }
            }
          }
        }
      } else {
        alert("Minimum seat allocation district magnitude is set to 0.");
      }
    };
    xhr.open('POST', 'http://localhost:7447/fastReadMainFile');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(reqPayload);
  }

  unselectorbutton.onclick = function(){
    let exceedStdDevWarningElm = document.getElementById('toolboxnotice-stddevexceedwarning');
    let underStdDevWarningElm = document.getElementById('toolboxnotice-stddevunderwarning');
    let tbxData = sessionStorage.getItem('tbxdata');
    let stdDevPassFlagElm = document.getElementById('stddevpass');
    let tbxArray = JSON.parse(tbxData);
    let tbodyRef = document.getElementById('areatoprocess').getElementsByTagName('tbody')[0];
    let initCalcHidden = document.getElementById('currentquotacounter');
    let initCalc = initCalcHidden.value;
    let selectedFeatureId = document.getElementById('f_xfid').value;
    let selectedFeatureName = document.getElementById('f_xareaname').value;
    let selectedFeaturePopulation = document.getElementById('f_population').value;
    let selectedFeatureQuota = document.getElementById('f_quotacalc').value;
    let selectedFeatureGeometry = document.getElementById('selectedfeaturegeometrystring').value;
    let selectedFeatureCentroid = document.getElementById('selectedfeaturecentroid').value;
    let firstFeatureCentroid = document.getElementById('firstfeaturecentroid').value;
    let selFeatureObj = {"wktgeom":selectedFeatureGeometry};
    let runningQuotaCounterCell = document.getElementById('quotaCounterCell');
    let runningSeatAllocationCounterCell = document.getElementById('seatallocation');
    let ignoreStdDevValue = document.getElementById('stddevignore').value;
    let runningStdDevValue = document.getElementById('stddev').value;

    let newIpcData = [];
    let ipcData = tbxArray.map(item => {
      if(item.xfid != selectedFeatureId){
        newIpcData.push(item);
      }
    });
    /* Resetting toolbox */
    tbodyRef.innerHTML = '';
    initCalcHidden.value = 0;
    runningQuotaCounterCell.innerText = '0';
    runningSeatAllocationCounterCell.innerText = '';
    /* Set remaining selected data in session storage */
    sessionStorage.setItem('tbxdata', JSON.stringify(newIpcData));
    /* Populating selected table and hiddens */
    newIpcData.map(item => {
      let runningInitCalc = document.getElementById('currentquotacounter').value;
      let newAreaRow = tbodyRef.insertRow();
      let newAreanameCell = newAreaRow.insertCell();
      let newAreanameCellContent = document.createTextNode(item.xareaname);
      newAreanameCell.appendChild(newAreanameCellContent);
      newAreanameCell.classList.add('border');
      newAreanameCell.classList.add('border-b');
      newAreanameCell.classList.add('border-r');
      newAreanameCell.classList.add('border-blue-900');
      newAreanameCell.classList.add('px-1');
      newAreanameCell.classList.add('w-40');
      let newAreaquotaCell = newAreaRow.insertCell();
      let newAreaquotaCellContent = document.createTextNode(item.xcalc_sq);
      newAreaquotaCell.appendChild(newAreaquotaCellContent);
      newAreaquotaCell.classList.add('text-right');
      newAreaquotaCell.classList.add('border');
      newAreaquotaCell.classList.add('border-b');
      newAreaquotaCell.classList.add('border-blue-900');
      newAreaquotaCell.classList.add('px-1');
      let runningCalc = parseFloat(runningInitCalc) + parseFloat(item.xcalc_sq);
      runningQuotaCounterCell.innerText = runningCalc.toFixed(2);
      runningSeatAllocationCounterCell.innerText = Math.round(runningCalc);
      document.getElementById('currentquotacounter').value = runningCalc.toFixed(2);
      document.getElementById('roundedseatallocation').value = Math.round(runningCalc);
      let remainderNumber = parseFloat(parseFloat(runningCalc.toFixed(2)) - parseFloat(Math.round(runningCalc)));
      document.getElementById('roundedremainder').value = remainderNumber.toFixed(2);
      if(ignoreStdDevValue == 0){
        if(runningStdDevValue == 0){
          if(remainderNumber != 0){
            if(exceedStdDevWarningElm.classList.contains('hidden')){
              exceedStdDevWarningElm.classList.remove('hidden');
              stdDevPassFlagElm.value = 0;
            } else {
              stdDevPassFlagElm.value = 0;
            }
          } else {
            if(exceedStdDevWarningElm.classList.contains('hidden')){
              stdDevPassFlagElm.value = 1;
            } else {
              exceedStdDevWarningElm.classList.add('hidden');
              stdDevPassFlagElm.value = 1;
            }
          }
        } else {
          let realRemainder = parseFloat(runningCalc.toFixed(2)) - parseFloat(parseInt(runningCalc));
          let fixedRemainder = realRemainder.toFixed(2);
          if(parseInt(runningCalc) == Math.round(runningCalc)){
            /* PEMBULATAN KE BAWAH */
            let lowerDeviation = parseFloat(parseFloat(parseInt(runningCalc)) - parseFloat(runningStdDevValue));
            let upperDeviation = parseFloat(parseFloat(parseInt(runningCalc)) + parseFloat(runningStdDevValue));
            if(parseFloat(runningCalc.toFixed(2)) <= parseFloat(upperDeviation) && parseFloat(runningCalc.toFixed(2)) >= parseFloat(lowerDeviation)){
              if(exceedStdDevWarningElm.classList.contains('hidden') == false){
                exceedStdDevWarningElm.classList.add('hidden');
              }
              if(underStdDevWarningElm.classList.contains('hidden') == false){
                underStdDevWarningElm.classList.add('hidden');
              }
              stdDevPassFlagElm.value = 1;
            } else {
              if(parseFloat(runningCalc.toFixed(2)) > parseFloat(upperDeviation)){
                if(exceedStdDevWarningElm.classList.contains('hidden') == true){
                  exceedStdDevWarningElm.classList.remove('hidden');
                }
                if(underStdDevWarningElm.classList.contains('hidden') == false){
                  underStdDevWarningElm.classList.add('hidden');
                }
                stdDevPassFlagElm.value = 0;
              } else if(parseFloat(runningCalc.toFixed(2)) < parseFloat(lowerDeviation)){
                if(exceedStdDevWarningElm.classList.contains('hidden') == false){
                  exceedStdDevWarningElm.classList.add('hidden');
                }
                if(underStdDevWarningElm.classList.contains('hidden') == true){
                  underStdDevWarningElm.classList.remove('hidden');
                }
                stdDevPassFlagElm.value = 0;
              } else {
                stdDevPassFlagElm.value = 0;
                alert('Error: You must restart the redistricting process.');
              }
            }
            // console.log(`Hasil: ${runningCalc.toFixed(2)}, Metode: Pembulatan ke BAWAH, Pembulatan: ${parseInt(runningCalc)}, Sisa: ${fixedRemainder}, BB: ${lowerDeviation}, BA: ${upperDeviation}`);
          } else {
            /* PEMBULATAN KE ATAS */
            let lowerDeviation = parseFloat(parseFloat(Math.round(runningCalc)) - parseFloat(runningStdDevValue));
            let upperDeviation = parseFloat(parseFloat(Math.round(runningCalc)) + parseFloat(runningStdDevValue));
            if(parseFloat(runningCalc.toFixed(2)) >= parseFloat(lowerDeviation) && parseFloat(runningCalc.toFixed(2)) <= parseFloat(Math.round(runningCalc))){
              if(exceedStdDevWarningElm.classList.contains('hidden') == false){
                exceedStdDevWarningElm.classList.add('hidden');
              }
              if(underStdDevWarningElm.classList.contains('hidden') == false){
                underStdDevWarningElm.classList.add('hidden');
              }
              stdDevPassFlagElm.value = 1;
            } else {
              if(parseFloat(runningCalc.toFixed(2)) < parseFloat(lowerDeviation)){
                /* Hasil perhitungan lebih kecil dari batas bawah std deviation */
                if(exceedStdDevWarningElm.classList.contains('hidden') == false){
                  exceedStdDevWarningElm.classList.add('hidden');
                }
                if(underStdDevWarningElm.classList.contains('hidden') == true){
                  underStdDevWarningElm.classList.remove('hidden');
                }
                stdDevPassFlagElm.value = 0;
              } else if(parseFloat(runningCalc.toFixed(2)) > parseFloat(upperDeviation)){
                /* Hasil perhitungan melampaui batas atas pembulatan + std deviation [tidak masuk-akal, tapi untuk pemenuhan if-else saja] */
                if(exceedStdDevWarningElm.classList.contains('hidden') == true){
                  exceedStdDevWarningElm.classList.remove('hidden');
                }
                if(underStdDevWarningElm.classList.contains('hidden') == false){
                  underStdDevWarningElm.classList.add('hidden');
                }
                stdDevPassFlagElm.value = 0;
              } else {
                stdDevPassFlagElm.value = 0;
                alert('Error: You must restart the redistricting process.');
              }
            }
            // console.log(`Hasil: ${runningCalc.toFixed(2)}, Metode: Pembulatan ke ATAS, Pembulatan: ${Math.round(runningCalc)}, Sisa: ${fixedRemainder}, BB: ${lowerDeviation}, BA: ${upperDeviation}`);
          }
        }
      }
    });

    let featuresArrayVar = selectedVectorLayer.getSource().getFeatures();
    featuresArrayVar.forEach(function(feature){
      if(feature.get('xfid') != undefined && feature.get('xfid') == selectedFeatureId){
        selectedVectorLayer.getSource().removeFeature(feature);
      }
    });

    setTimeout(function(){
      overlay.setPosition(undefined);
      popcloser.blur();
      popuptablefooter.classList.add('hidden');
      contiguousrow.classList.add('hidden');
      dataselector.classList.remove('area-selector-enabled-button');
      dataselector.classList.add('area-selector-disabled-button');
      dataselector.disabled = true;
      if(dataselector.classList.contains('hidden')){
        dataselector.classList.remove('hidden');
      }
      if(!confirmdeselectbutton.classList.contains('hidden')){
        confirmdeselectbutton.classList.add('hidden');
      }
      lib.popupStateReset();
      return false;
    }, 500);
  }

  var districtLabelStyle = new Style({
    image: new CircleStyle({
      radius: 1,
      stroke: new Stroke({
        color: 'rgba(255,0,0,1.0)',
        width: 1,
      }),
      fill: new Fill({
        color: 'rgba(255,0,0,1.0)'
      }),
    }),
    text: new Text({
      font: 'bold 28px "Open Sans", "Arial Unicode MS", "sans-serif"',
      placement: 'point',
      fill: new Fill({color: 'rgba(30,58,138,1)'}),
      stroke: new Stroke({color: 'rgba(255,255,255,1.0)', width: 3}),
    }),
  });

  const districtStyleFunction = function (feature){
    districtLabelStyle.getText().setText(feature.get('electoral_district')+'\n'+feature.get('district_xcalc_round'))
    return districtLabelStyle;
  };

  const style = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.6)',
    }),
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 1)',
      width: 1,
    }),
    text: new Text({
      font: '16px Calibri, sans-serif',
      fill: new Fill({
        color: '#000',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 3,
      }),
    }),
  });

  let vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: './data/files/'+ mapData.codex +'.json',
  });

  var dynamicPointsLayerSource = new VectorSource();

  if(areaDistrictingStatus == 1){
    let districtData = mapData.features;
    /* form GeoJSON points */
    let featuresArray = [];
    districtData.forEach(function(district){
      if(district.is_redistricted != 0){
        let featureObj = {type:"Feature",properties:{electoral_district:district.electoral_district,district_xcalc_round:district.district_xcalc_round},geometry:district.centroid};
        featuresArray.push(featureObj);
      }
    });
    let arrayFeatures = [];
    let newArrayFeatures = lib.appendSelectedObject(arrayFeatures, featuresArray);
    let pointsGeoJSONObject = {type:"FeatureCollection", features:newArrayFeatures};
    var features = new GeoJSON().readFeatures(pointsGeoJSONObject, {featureProjection: "EPSG:3857"});
    dynamicPointsLayerSource = new VectorSource({features});
  }

  var otfPointsLayer = new VectorLayer({source:dynamicPointsLayerSource, style:districtStyleFunction, id: 'otf-points-layer',});

  let vectorLayer = new VectorLayer({
    source: vectorSource,
    style: function (feature) {
      var fred_ch = parseInt(feature.get('fill_red_channel'));
      var fgreen_ch = parseInt(feature.get('fill_green_channel'));
      var fblue_ch = parseInt(feature.get('fill_blue_channel'));
      var falpha_ch = parseFloat(feature.get('fill_alpha_channel'));
      var sred_ch = parseInt(feature.get('stroke_red_channel'));
      var sgreen_ch = parseInt(feature.get('stroke_green_channel'));
      var sblue_ch = parseInt(feature.get('stroke_blue_channel'));
      var salpha_ch = parseFloat(feature.get('stroke_alpha_channel'));
      var stroke_wd = parseInt(feature.get('stroke_width'));
      style.getText().setText(feature.get('xareaname'));
      style.getFill().setColor(`rgba(${fred_ch},${fgreen_ch},${fblue_ch},${falpha_ch})`);
      style.getStroke().setColor(`rgba(${sred_ch},${sgreen_ch},${sblue_ch},${salpha_ch})`);
      style.getStroke().setWidth(stroke_wd);
      return style;
    },
    id: 'main-layer',
  });

  let selectedFeaturesVectorSource = new VectorSource();

  let selectedVectorLayer = new VectorLayer({
    source: selectedFeaturesVectorSource,
    style: function (feature) {
      style.getText().setText(feature.get('xareaname'));
      style.getFill().setColor(`rgba(255, 153, 51, 0.90)`);
      style.getStroke().setColor(`rgba(11,77,216,1)`);
      style.getStroke().setWidth(3);
      return style;
    },
  });

  if(overlayObjects.length == 0){
    map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
        otfPointsLayer,
        selectedVectorLayer,
      ],
      overlays: [overlay],
      target: 'map',
      controls: defaultControls().extend([new RedistrictingToolbox(), new RedistrictingResumeTable()]),
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
  } else {
    let overlaysObjectsArray = mapData.overlays;
    let overlayLayersArray = [];
    let zidx = 4;
    overlaysObjectsArray.forEach(function(overlayobj){
      let ovrl = new VectorLayer({
        'title': overlayobj.title,
        visible: false,
        source: new VectorSource({
          format: new GeoJSON(),
          url: './data/overlays/'+ overlayobj.srcfile +'.json',
        }),
      });
      ovrl.setZIndex(zidx);
      overlayLayersArray.push(ovrl);
      zidx++;
    });
    map = new Map({
      layers: [
        new LayerGroup({
          'title': 'User-Defined Overlays',
          'fold': 'close',
          layers: overlayLayersArray,
        }),
        new LayerGroup({
          'title': 'Common Basemap',
          'fold': 'close',
          layers: [
            new TileLayer({
              'title': 'OpenStreetMaps Standard',
              type: 'base',
              visible: true,
              source: new OSM(),
            }),
            new TileLayer({
              'title': 'No Basemap',
              type: 'base',
              visible: false,
              source: null
            }),
          ]
        }),
        vectorLayer,
        otfPointsLayer,
        selectedVectorLayer,
      ],
      overlays: [overlay],
      target: 'map',
      controls: defaultControls().extend([new RedistrictingToolboxStacked(), new RedistrictingResumeTable(), new LayerSwitcher({activationMode: 'click', tipLabel: 'Map Legend', groupSelectStyle: 'children', reverse: true })]),
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
  }

  if(areaStdDevAttrSetStatus == 0){
    document.getElementById('cellStdDev').innerText = '0';
  } else {
    if(areaStdDevIgnoreStatus == 0){
      document.getElementById('cellStdDev').innerText = setStdDevValue;
    } else {
      document.getElementById('cellStdDev').innerText = '0';
    }
  }

  let combinedQuotaValueCell = document.getElementById('quotaCounterCell');
  let currentCombinedQuotaHiddenElm = document.getElementById('currentquotacounter');
  let minimumSeatMagnitudeIndicatorElm = document.getElementById('districtminimumseatallocation');
  let maximumSeatMagnitudeIndicatorElm = document.getElementById('districtmaximumseatallocation');
  let stdDeviationStatusElm = document.getElementById('stddevstatus');
  let stdDeviationIgnoreStatusElm = document.getElementById('stddevignore');
  let stdDeviationValueElm = document.getElementById('stddev');
  let stdDeviationPassValueElm = document.getElementById('stddevpass');
  let combinedQuotaInitValue = document.getElementById('quotacounterinit').value;
  combinedQuotaValueCell.innerText = combinedQuotaInitValue;
  currentCombinedQuotaHiddenElm.value = combinedQuotaInitValue;
  minimumSeatMagnitudeIndicatorElm.value = minimumDistrictSeatNumber;
  maximumSeatMagnitudeIndicatorElm.value = maximumDistrictSeatNumber;
  stdDeviationStatusElm.value = areaStdDevAttrSetStatus;
  stdDeviationIgnoreStatusElm.value = areaStdDevIgnoreStatus;
  stdDeviationValueElm.value = areaStdDeviationValue;
  stdDeviationPassValueElm.value = 1;

  vectorSource.once('change',function(e){
    if(vectorSource.getState() === 'ready') {
      if(vectorLayer.getSource().getFeatures().length>0) {
        map.getView().fit(vectorSource.getExtent(), map.getSize());
      }
    }
  });

  const highlightStyle = new Style({
    stroke: new Stroke({
      color: '#ff9933',
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(255, 153, 51, 0.95)',
    }),
    text: new Text({
      font: '16px Calibri, sans-serif',
      fill: new Fill({
        color: '#ff0000',
      }),
      stroke: new Stroke({
        color: '#ffd400',
        width: 3,
      }),
    }),
  });

  const defaultUnselectedFeatureOnMapStyle = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.6)',
    }),
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 1)',
      width: 1,
    }),
    text: new Text({
      font: '16px Calibri, sans-serif',
      fill: new Fill({
        color: '#000',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 3,
      }),
    }),
  });

  const selectedFeatureOnMapStyle = new Style({
    stroke: new Stroke({
      color: '#ff9933',
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(255, 153, 51, 0.95)',
    }),
    text: new Text({
      font: '16px Calibri, sans-serif',
      fill: new Fill({
        color: '#ff0000',
      }),
      stroke: new Stroke({
        color: '#ffd400',
        width: 3,
      }),
    }),
  });

  const featureOverlay = new VectorLayer({
    source: new VectorSource(),
    map: map,
    style: function (feature) {
      highlightStyle.getText().setText(feature.get('xareaname'));
      return highlightStyle;
    },
  });

  let highlight;

  const displayFeatureInfo = function (pixel) {
    const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
      return feature;
    });
    if (feature !== highlight){
      if (highlight) {
        featureOverlay.getSource().removeFeature(highlight);
      }
      if (feature){
        featureOverlay.getSource().addFeature(feature);
      }
      highlight = feature;
    }
  };

  let select = new Select({
    condition: click,
  });

  map.addInteraction(select);

  select.on('select', function (e) {
    let toolboxSession = sessionStorage.getItem('tbxdata');
    let selectedAreaArrayObject = JSON.parse(toolboxSession);
    let isAreaHasBeenTemporarilySelected = 0, featurexfid;
    lib.popupStateReset();
    if(e.target.getFeatures().getLength() == 0){
      return;
    } else {
      featurexfid = e.selected[0].get('xfid');
      let strAreaName = `-`;
      let strAreaPopulation = `-`;
      let strAreaQuota = `-`;
      let strElectoralDistrict = `-`;
      if(areaNameLabelingStatus == 1){
        strAreaName = e.selected[0].get('xareaname');
      }
      if(populationStatus == 1){
        strAreaPopulation = e.selected[0].get('xarea_population');
      }
      if(areaQuotaCalculationStatus == 1){
        if(parseInt(e.selected[0].get('is_redistricted')) == 0){
          selectedAreaArrayObject.forEach(function(item){
            if(item.xfid == featurexfid){
              isAreaHasBeenTemporarilySelected = 1;
            }
          });
          if(isAreaHasBeenTemporarilySelected == 0){
            document.getElementById('f_xfid').value = e.selected[0].get('xfid');
            document.getElementById('f_xareaname').value = e.selected[0].get('xareaname');
            document.getElementById('f_population').value = e.selected[0].get('xarea_population');
            document.getElementById('f_quotacalc').value = e.selected[0].get('xcalc_sq');
            strAreaQuota = e.selected[0].get('xcalc_sq');
            popuptablefooter.classList.remove('hidden');
            if(dataselector.classList.contains('hidden')){
              dataselector.classList.remove('hidden');
            }
            dataselector.classList.remove('area-selector-disabled-button');
            dataselector.classList.add('area-selector-enabled-button');
            dataselector.disabled = false;
            if(deselectorbutton.classList.contains('hidden') == false){
              deselectorbutton.classList.add('hidden');
            }
            let popupContentDOM = `<tr><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-r border-blue-900">Admin. Unit</td><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-blue-900">${strAreaName}</td></tr>
                <tr><td class="text-sm py-2 align-middle bg-gray-200 text-gray-900 border-b border-r border-blue-900">Population</td><td class="text-sm py-2 align-middle bg-gray-200 text-gray-900 border-b border-blue-900 text-right">${numeral(strAreaPopulation).format('0,0')}</td></tr>
                <tr><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-r border-blue-900">Quota</td><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-blue-900 text-right">${strAreaQuota}</td></tr>`;
            let tableRef = document.getElementById('inpopuptable').getElementsByTagName('tbody')[0];
            tableRef.innerHTML = popupContentDOM;
          } else {
            document.getElementById('f_xfid').value = e.selected[0].get('xfid');
            document.getElementById('f_xareaname').value = e.selected[0].get('xareaname');
            document.getElementById('f_population').value = e.selected[0].get('xarea_population');
            document.getElementById('f_quotacalc').value = e.selected[0].get('xcalc_sq');
            strAreaQuota = e.selected[0].get('xcalc_sq');
            popuptablefooter.classList.remove('hidden');
            if(dataselector.classList.contains('hidden') == false){
              dataselector.classList.add('hidden');
            }
            dataselector.classList.remove('area-selector-disabled-button');
            dataselector.classList.add('area-selector-enabled-button');
            dataselector.disabled = true;
            if(unselectorbutton.classList.contains('hidden') == true){
              unselectorbutton.classList.remove('hidden');
            }
            let popupContentDOM = `<tr><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-r border-blue-900">Admin. Unit</td><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-blue-900">${strAreaName}</td></tr>
                <tr><td class="text-sm py-2 align-middle bg-gray-200 text-gray-900 border-b border-r border-blue-900">Population</td><td class="text-sm py-2 align-middle bg-gray-200 text-gray-900 border-b border-blue-900 text-right">${numeral(strAreaPopulation).format('0,0')}</td></tr>
                <tr><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-r border-blue-900">Quota</td><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-blue-900 text-right">${strAreaQuota}</td></tr>`;
            let tableRef = document.getElementById('inpopuptable').getElementsByTagName('tbody')[0];
            tableRef.innerHTML = popupContentDOM;
          }
        } else {
          document.getElementById('f_xfid').value = e.selected[0].get('xfid');
          document.getElementById('f_xareaname').value = e.selected[0].get('xareaname');
          document.getElementById('f_population').value = e.selected[0].get('xarea_population');
          document.getElementById('f_quotacalc').value = e.selected[0].get('xcalc_sq');
          strAreaQuota = e.selected[0].get('xcalc_sq');
          strElectoralDistrict = e.selected[0].get('electoral_district');
          document.getElementById('f_electoraldistrict').value = strElectoralDistrict;

          popuptablefooter.classList.remove('hidden');
          dataselector.classList.add('hidden');
          deselectorbutton.classList.remove('hidden');

          let popupContentDOM = `<tr><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-r border-blue-900">Admin. Unit</td><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-blue-900">${strAreaName}</td></tr>
              <tr><td class="text-sm py-2 align-middle bg-gray-200 text-gray-900 border-b border-r border-blue-900">Population</td><td class="text-sm py-2 align-middle bg-gray-200 text-gray-900 border-b border-blue-900 text-right">${numeral(strAreaPopulation).format('0,0')}</td></tr>
              <tr><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-r border-blue-900">Quota</td><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-blue-900 text-right">${strAreaQuota}</td></tr>
              <tr><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-r border-blue-900">Electoral District</td><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-blue-900">${strElectoralDistrict}</td></tr>`;
          let tableRef = document.getElementById('inpopuptable').getElementsByTagName('tbody')[0];
          tableRef.innerHTML = popupContentDOM;
        }
      } else {
        let popupContentDOM = `<tr><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-r border-blue-900">Admin. Unit</td><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-blue-900">${strAreaName}</td></tr>
            <tr><td class="text-sm py-2 align-middle bg-gray-200 text-gray-900 border-b border-r border-blue-900">Population</td><td class="text-sm py-2 align-middle bg-gray-200 text-gray-900 border-b border-blue-900 text-right">${numeral(strAreaPopulation).format('0,0')}</td></tr>
            <tr><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-r border-blue-900">Quota</td><td class="text-sm py-2 align-middle bg-blue-200 text-gray-900 border-b border-blue-900 text-right">${strAreaQuota}</td></tr>`;
        let tableRef = document.getElementById('inpopuptable').getElementsByTagName('tbody')[0];
        tableRef.innerHTML = popupContentDOM;
      }
    }
  });

  map.on('click', function (evt) {
    const coordinate = evt.coordinate;
    var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
      return feature;
    });
    lib.popupStateReset();
    if(!feature){
      overlay.setPosition(undefined);
      popcloser.blur();
    } else {
      overlay.setPosition(coordinate);
      popcontainer.classList.remove('hidden');
      let featureIsDistrictedStatus = feature.get('is_redistricted');
      let featurexfid = feature.get('xfid');
      let contiguousDetectorStatus = document.getElementById('contiguousdetector').value;
      let isAreaSelected = 0;
      if(featureIsDistrictedStatus == 0){
        let toolboxSession = sessionStorage.getItem('tbxdata');
        let selectedAreaArrayObject = JSON.parse(toolboxSession);
        if(selectedAreaArrayObject.length == 0){
          let firstGeom = [];
          firstGeom.push(new Feature(feature.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326')));
          let firstAreaWKT = new WKT().writeFeature(firstGeom[0]);
          selectedfeaturegeometrystring.value = firstAreaWKT;
          let reqPayload = JSON.stringify({"wktgeom":firstAreaWKT});
          let xhr = new XMLHttpRequest();
          xhr.responseType = 'json';
          xhr.open('POST', `http://localhost:7447/findCentroid`);
          xhr.onreadystatechange = function () {
            if(xhr.readyState === XMLHttpRequest.DONE) {
              var status = xhr.status;
              if (status === 0 || (status >= 200 && status < 400)) {
                if(xhr.response.code == 200 && xhr.response.message == 'success'){
                  firstfeaturecentroid.value = JSON.stringify(xhr.response.data.centroid);
                  selectedfeaturecentroid.value = JSON.stringify(xhr.response.data.centroid);
                } else {
                  console.log(xhr.response.data.exception_at);
                }
              } else {
                console.log(xhr.response.data.exception_at);
              }
            }
          };
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(reqPayload);
        } else {
          //let isAreaSelected = 0;
          selectedAreaArrayObject.forEach(function(item){
            if(item.xfid == featurexfid){
              isAreaSelected = 1;
            }
          });
          if(isAreaSelected == 0){
            let fGeom = [];
            fGeom.push(new Feature(feature.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326')));
            let areaWKT = new WKT().writeFeature(fGeom[0]);
            let geomSession = sessionStorage.getItem('geomdata');
            let geomArray = JSON.parse(geomSession);
            if(geomArray.length == 0){
              selectedfeaturegeometrystring.value = areaWKT;
              let reqPayload = JSON.stringify({"wktgeom":areaWKT});
              let xhr = new XMLHttpRequest();
              xhr.responseType = 'json';
              xhr.open('POST', `http://localhost:7447/findCentroid`);
              xhr.onreadystatechange = function () {
                if(xhr.readyState === XMLHttpRequest.DONE) {
                  var status = xhr.status;
                  if (status === 0 || (status >= 200 && status < 400)) {
                    if(xhr.response.code == 200 && xhr.response.message == 'success'){
                      selectedfeaturecentroid.value = JSON.stringify(xhr.response.data.centroid);
                    } else {
                      console.log(xhr.response.data.exception_at);
                    }
                  } else {
                    console.log(xhr.response.data.exception_at);
                  }
                }
              };
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.send(reqPayload);
            } else {
              if(contiguousDetectorStatus == 1){
                let firstGeomStr = geomArray[0];
                let reqPayload = JSON.stringify({"geomcollection":firstGeomStr, "geomcompared":areaWKT});
                let xhr = new XMLHttpRequest();
                xhr.responseType = 'json';
                xhr.open('POST', `http://localhost:7447/isContiguous`);
                xhr.onreadystatechange = function () {
                  if(xhr.readyState === XMLHttpRequest.DONE) {
                    var status = xhr.status;
                    if (status === 0 || (status >= 200 && status < 400)) {
                      if(xhr.response.code == 200 && xhr.response.message == 'success'){
                        if(xhr.response.data.iscontiguous == 1){
                          if(xhr.response.data.centroid == null){
                            document.getElementById('contiguousdetectoractivate').checked = false;
                            document.getElementById('contiguousdetector').value = 0;
                            sessionStorage.setItem('contiguouscheck', 0);
                            sessionStorage.setItem('iscontiguous', '1');
                            dataselector.classList.remove('area-selector-disabled-button');
                            dataselector.classList.add('area-selector-enabled-button');
                            dataselector.disabled = false;
                            contiguousrow.classList.add('hidden');
                          } else {
                            sessionStorage.setItem('iscontiguous', '1');
                            dataselector.classList.remove('area-selector-disabled-button');
                            dataselector.classList.add('area-selector-enabled-button');
                            dataselector.disabled = false;
                            contiguousrow.classList.add('hidden');
                            selectedfeaturegeometrystring.value = xhr.response.data.unionarea;
                            selectedfeaturecentroid.value = JSON.stringify(xhr.response.data.centroid);
                          }
                        } else {
                          sessionStorage.setItem('iscontiguous', '0');
                          dataselector.classList.remove('area-selector-enabled-button');
                          dataselector.classList.add('area-selector-disabled-button');
                          dataselector.disabled = true;
                          contiguousrow.classList.remove('hidden');
                          selectedfeaturegeometrystring.value = '';
                          selectedfeaturecentroid.value = '';
                        }
                      } else {
                        sessionStorage.setItem('iscontiguous', '0');
                        selectedfeaturegeometrystring.value = '';
                        selectedfeaturecentroid.value = '';
                      }
                    } else {
                      sessionStorage.setItem('iscontiguous', '0');
                      selectedfeaturegeometrystring.value = '';
                      selectedfeaturecentroid.value = '';
                    }
                  }
                };
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(reqPayload);
              } else {
                selectedfeaturegeometrystring.value = areaWKT;
                let reqPayload = JSON.stringify({"wktgeom":areaWKT});
                let xhr = new XMLHttpRequest();
                xhr.responseType = 'json';
                xhr.open('POST', `http://localhost:7447/findCentroid`);
                xhr.onreadystatechange = function () {
                  if(xhr.readyState === XMLHttpRequest.DONE) {
                    var status = xhr.status;
                    if (status === 0 || (status >= 200 && status < 400)) {
                      if(xhr.response.code == 200 && xhr.response.message == 'success'){
                        sessionStorage.setItem('iscontiguous', '1');
                        dataselector.disabled = false;
                        contiguousrow.classList.add('hidden');
                        selectedfeaturecentroid.value = JSON.stringify(xhr.response.data.centroid);
                      } else {
                        console.log(xhr.response.data.exception_at);
                      }
                    } else {
                      console.log(xhr.response.data.exception_at);
                    }
                  }
                };
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(reqPayload);
              }
            }
          } else {
            if(popuptablefooter.classList.contains('hidden') == true){
              popuptablefooter.classList.remove('hidden');
            }
            if(dataselector.classList.contains('hidden') == false){
              dataselector.classList.add('hidden');
            }
            if(unselectorbutton.classList.contains('hidden') == true){
              unselectorbutton.classList.remove('hidden');
            }
            selectedfeaturegeometrystring.value = '';
            selectedfeaturecentroid.value = '';
          }
        }
      } else {
        selectedfeaturegeometrystring.value = '';
        selectedfeaturecentroid.value = '';
      }
    }
  });

  confirmdeselectbutton.onclick = function(){
    let prjMainFile = document.getElementById('view_mainfile_codex').value;
    let d_fid = document.getElementById('f_xfid').value;
    let d_eld = document.getElementById('f_electoraldistrict').value;
    let d_calc = document.getElementById('deselected_xcalc').value;
    let d_calcrounded = document.getElementById('deselected_xcalc_round').value;
    let d_remained = document.getElementById('deselected_xcalc_remains').value;
    let reqPayload = JSON.stringify({"mainfile":prjMainFile,"district":d_eld,"xfid":d_fid,"sqcalc":d_calc,"roundedcalc":d_calcrounded,"remainedcalc":d_remained});
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('POST', 'http://localhost:7447/deselectSingleArea');
    xhr.onreadystatechange = function () {
      if(xhr.readyState === XMLHttpRequest.DONE) {
        var status = xhr.status;
        if (status === 0 || (status >= 200 && status < 400)) {
          if(xhr.response.code == 200 && xhr.response.message == 'success'){
            let basicProjectData = {"codex": xhr.response.data.codex, "xfid_attribute": xhr.response.data.xfid_attribute, "xareaname_attribute": xhr.response.data.xareaname_attribute, "xpopulation_attribute": xhr.response.data.xpopulation_attribute, "totalpopulation": xhr.response.data.totalpopulation, "parliament_seats": xhr.response.data.parliament_seats, "minimum_seats": xhr.response.data.minimum_seats, "maximum_seats": xhr.response.data.maximum_seats, "xparliamentseats_attribute": xhr.response.data.xparliamentseats_attribute, "xareasqcalc_attribute": xhr.response.data.xareasqcalc_attribute, "xareasqcalcreal_attribute": xhr.response.data.xareasqcalcreal_attribute, "xareasqcalcremainder_attribute": xhr.response.data.xareasqcalcremainder_attribute, "xareasqcalcremainderrounding_attribute": xhr.response.data.xareasqcalcremainderrounding_attribute, "xareasqmin": xhr.response.data.xareasqmin, "xareasqmax": xhr.response.data.xareasqmax, "xareasqminmax_attribute": xhr.response.data.xareasqminmax_attribute, "stddev": xhr.response.data.stddev, "xstddev_attribute": xhr.response.data.xstddev_attribute, "xstddev_ignore": xhr.response.data.xstddev_ignore, "xredistricted_attribute": xhr.response.data.xredistricted_attribute, "overlays": xhr.response.data.overlays, "flag_basemap": xhr.response.data.flag_basemap, "osm_standard": xhr.response.data.osm_standard, "osm_dark": xhr.response.data.osm_dark, "google_satellite": xhr.response.data.google_satellite, "google_hybrid": xhr.response.data.google_hybrid, "google_streets": xhr.response.data.google_streets, "google_terrain": xhr.response.data.google_terrain, "map_autopan": xhr.response.data.map_autopan, "xdivider": xhr.response.data.xdivider, "data_notes": xhr.response.data.data_notes};
            let parsedDataFeaturesArray = xhr.response.data.features;
            let featuresArray = [];
            parsedDataFeaturesArray.forEach(function(feature){
              featuresArray.push(feature.properties);
            });
            let featuresObject = {"features":featuresArray};
            Object.assign(basicProjectData, featuresObject);
            lib.buildResumeTable(basicProjectData, map, otfPointsLayer);
            lib.mapRedrawOptionalFeatures(map, basicProjectData, otfPointsLayer);
            setTimeout(function(){
              overlay.setPosition(undefined);
              popcloser.blur();
              lib.popupStateReset();
              return false;
            }, 500);
          } else {
            alert('Admin. unit deselection failed.');
            setTimeout(function(){
              overlay.setPosition(undefined);
              popcloser.blur();
              lib.popupStateReset();
              return false;
            }, 500);
          }
        } else {
          alert('Admin. unit deselection failed.');
          setTimeout(function(){
            overlay.setPosition(undefined);
            popcloser.blur();
            lib.popupStateReset();
            return false;
          }, 500);
        }
      }
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(reqPayload);
  }

  canceldeselectbutton.onclick = function(){
    setTimeout(function(){
      overlay.setPosition(undefined);
      popcloser.blur();
      lib.popupStateReset();
      return false;
    }, 500);
  }

  if(areaDistrictingStatus == 1){
    let districtData = mapData.features;
    let districtedArray = [];
    districtData.forEach(function(item, index){
      if(item.is_redistricted == 1){
        districtedArray.push(item);
      }
    });
    if(districtedArray.length > 0){
      let mainProjectName = document.getElementById('project_name_reference').value;
      let resumeTableContainer = document.getElementById('resumecontainer');
      let resumeTableRef = document.getElementById('resumetable').getElementsByTagName('tbody')[0];
      let resumeTablePrintedRef = document.getElementById('resumetableprinted').getElementsByTagName('tbody')[0];
      let mainProjectNameHeaderCell = document.getElementById('onscreentablenomenclature');
      let totalPopulationIndicatorCell = document.getElementById('totalpopulationindicator');
      let parliamentSeatsIndicatorCell = document.getElementById('parliamentseatsindicator');
      let quotaDividerIndicatorCell = document.getElementById('quotadividerindicator');
      let minimumSeatMagnitudeIndicatorCell = document.getElementById('minimumseatmagnitudeindicator');
      let maximumSeatMagnitudeIndicatorCell = document.getElementById('maximumseatmagnitudeindicator');
      let standardDeviationIndicatorCell = document.getElementById('standarddeviationindicator');
      let mainProjectNameHeaderPrintedCell = document.getElementById('printedtablenomenclature');
      let totalPopulationIndicatorPrintedCell = document.getElementById('printedtotalpopulationindicator');
      let parliamentSeatsIndicatorPrintedCell = document.getElementById('printedparliamentseatsindicator');
      let quotaDividerIndicatorPrintedCell = document.getElementById('printedquotadividerindicator');
      let minimumSeatMagnitudeIndicatorPrintedCell = document.getElementById('printedminimumseatmagnitudeindicator');
      let maximumSeatMagnitudeIndicatorPrintedCell = document.getElementById('printedmaximumseatmagnitudeindicator');
      let standardDeviationIndicatorPrintedCell = document.getElementById('printedstandarddeviationindicator');
      /* some resets on dynamic tfoot for remaining seats >= 1 */
      let resumeTFootCell = document.getElementById('resumetotalremains');
      if(resumeTFootCell.classList.contains('bg-blue-900') == true){
        resumeTFootCell.classList.remove('bg-blue-900');
      }
      if(resumeTFootCell.classList.contains('bg-red-700') == true){
        resumeTFootCell.classList.remove('bg-red-700');
      }
      districtedArray.sort(function(firstEntry, nextEntry){
        var firstDistrictName = firstEntry.electoral_district.toUpperCase();
        var nextDistrictName = nextEntry.electoral_district.toUpperCase();
        if (firstDistrictName < nextDistrictName) {
          return -1;
        }
        if (firstDistrictName > nextDistrictName){
          return 1;
        }
        return 0;
      });
      let tableRowsDOM = '';
      let tableRowsPrintedDOM = '';
      let districtNameTemp;
      let resumeTotalPopulation = 0;
      let resumeTotalSeat = 0;
      let resumeTotalRemain = 0;
      districtedArray.forEach(function(item) {
        let districtName = item.electoral_district;
        let areaName = item.xareaname;
        let areaPopulation = item.xarea_population;
        let areaQuota = item.xcalc_sq;
        let districtQuota = item.district_xcalc_sq;
        let districtSeat = item.district_xcalc_round;
        let districtRemains = item.district_xcalc_remain;
        let districtNamesFilter = districtedArray.filter(function(feature) {
          return feature.electoral_district === districtName;
        });
  
        var rowspan = districtNamesFilter.length;
        tableRowsDOM += `<tr>`;
        tableRowsPrintedDOM += `<tr>`;
  
        if (districtName !== districtNameTemp) {
          if (rowspan > 1) {
            tableRowsDOM += `<td rowspan="${rowspan}" class="resume-table-tbody-district-name" style="width: 91px;">${districtName}</td>`;
            tableRowsPrintedDOM += `<td rowspan="${rowspan}" class="">${districtName}</td>`;
          } else {
            tableRowsDOM += `<td class="resume-table-tbody-district-name" style="width: 91px;">${districtName}</td>`;
            tableRowsPrintedDOM += `<td class="">${districtName}</td>`;
          }
        }
        tableRowsDOM += `<td class="resume-table-tbody-area-name" style="width: 102px;">${areaName}</td>`;
        tableRowsPrintedDOM += `<td class="">${areaName}</td>`;
        tableRowsDOM += `<td class="resume-table-tbody-area-population" style="width: 73px;">${numeral(areaPopulation).format('0,0')}</td>`;
        tableRowsPrintedDOM += `<td class="">${numeral(areaPopulation).format('0,0')}</td>`;
        tableRowsDOM += `<td class="resume-table-tbody-area-quota" style="width: 44px;">${areaQuota}</td>`;
        tableRowsPrintedDOM += `<td class="">${areaQuota}</td>`;
  
        if (districtName !== districtNameTemp) {
          if (rowspan > 1) {
            tableRowsDOM += `<td rowspan="${rowspan}" class="resume-table-tbody-district-quota" style="width: 42px;">${districtQuota}</td>`;
            tableRowsPrintedDOM += `<td rowspan="${rowspan}" class="">${districtQuota}</td>`;
            tableRowsDOM += `<td rowspan="${rowspan}" class="resume-table-tbody-seat-allocation" style="width: 36px;">${districtSeat}</td>`;
            tableRowsPrintedDOM += `<td rowspan="${rowspan}" class="">${districtSeat}</td>`;
            tableRowsDOM += `<td rowspan="${rowspan}" class="resume-table-tbody-quota-remains-plus" style="width: 43px;">${districtRemains}</td>`;
            tableRowsPrintedDOM += `<td rowspan="${rowspan}" class="">${districtRemains}</td>`;
            tableRowsDOM += `<td rowspan="${rowspan}" class="resume-table-tbody-delete-plus" style="width: 22px;"><button role='button' id='${districtName}' class='p-1 text-red-900 bg-gray-400 item-to-undistrict'><svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button></td>`;
          } else {
            tableRowsDOM += `<td class="resume-table-tbody-district-quota" style="width: 42px;">${districtQuota}</td>`;
            tableRowsPrintedDOM += `<td class="">${districtQuota}</td>`;
            tableRowsDOM += `<td class="resume-table-tbody-seat-allocation" style="width: 36px;">${districtSeat}</td>`;
            tableRowsPrintedDOM += `<td class="">${districtSeat}</td>`;
            tableRowsDOM += `<td class="resume-table-tbody-quota-remains-plus" style="width: 43px;">${districtRemains}</td>`;
            tableRowsPrintedDOM += `<td class="">${districtRemains}</td>`;
            tableRowsDOM += `<td class="resume-table-tbody-delete-plus" style="width: 22px;"><button role='button' id='${districtName}' class='p-1 text-red-900 bg-gray-400 item-to-undistrict'><svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button></td>`;
          }
          districtNameTemp = districtName;
          resumeTotalSeat += parseInt(districtSeat);
          resumeTotalRemain += parseFloat(districtRemains);
        }
        tableRowsDOM += `</tr>`;
        tableRowsPrintedDOM += `</tr>`;
        resumeTotalPopulation += parseInt(areaPopulation);
      });
      resumeTableRef.innerHTML = tableRowsDOM;
      resumeTablePrintedRef.innerHTML = tableRowsPrintedDOM;
      document.getElementById('resumetotalpopulation').innerText = numeral(resumeTotalPopulation).format('0,0');
      document.getElementById('printedresumetotalpopulation').innerText = numeral(resumeTotalPopulation).format('0,0');
      document.getElementById('resumetotalseats').innerText = resumeTotalSeat;
      document.getElementById('printedresumetotalseats').innerText = resumeTotalSeat;
      document.getElementById('resumetotalremains').innerText = resumeTotalRemain.toFixed(2);
      document.getElementById('printedresumetotalremains').innerText = resumeTotalRemain.toFixed(2);
      mainProjectNameHeaderCell.innerText = `Electoral Redistricting Resume on ${mainProjectName}`;
      mainProjectNameHeaderPrintedCell.innerText = `Electoral Redistricting Resume on ${mainProjectName}`;
      totalPopulationIndicatorCell.innerText = numeral(mapData.totalpopulation).format('0,0');
      totalPopulationIndicatorPrintedCell.innerText = numeral(mapData.totalpopulation).format('0,0');
      parliamentSeatsIndicatorCell.innerText = mapData.parliament_seats;
      parliamentSeatsIndicatorPrintedCell.innerText = mapData.parliament_seats;
      quotaDividerIndicatorCell.innerText = numeral(parseInt(mapData.xdivider)).format('0,0');
      quotaDividerIndicatorPrintedCell.innerText = numeral(parseInt(mapData.xdivider)).format('0,0');
      minimumSeatMagnitudeIndicatorCell.innerText = mapData.minimum_seats;
      minimumSeatMagnitudeIndicatorPrintedCell.innerText = mapData.minimum_seats;
      maximumSeatMagnitudeIndicatorCell.innerText = mapData.maximum_seats;
      maximumSeatMagnitudeIndicatorPrintedCell.innerText = mapData.maximum_seats;
      standardDeviationIndicatorCell.innerText = mapData.stddev;
      standardDeviationIndicatorPrintedCell.innerText = mapData.stddev;
      if(parseInt(resumeTotalRemain) >= 1){
        resumeTFootCell.classList.add('bg-red-700');
      } else {
        resumeTFootCell.classList.add('bg-blue-900');
      }
      resumeTableContainer.classList.remove('hidden');
      lib.enableUndistrictFunction(map, otfPointsLayer);
      lib.enableMapPDFPrint(mapData, map, projectStringNameRef);
    } else {
      districtedArray = null;
    }
  }
  lib.toolboxFunction(map, mapData, otfPointsLayer);
  lib.setDefaultFeatureColour(mapData);
};

lib.toolboxFunction = function(mapObject, mapData, optionalPointsVectorLayer){
  let map = mapObject;
  let mapdata = mapData;
  let mainFeaturesData = mapData.features;
  let otfPointsLayer = optionalPointsVectorLayer;

  let selectedfeaturegeometrystring = document.getElementById('selectedfeaturegeometrystring');

  let contiguousrow = document.getElementById('inpopupcontiguousrow');
  let dataselector = document.getElementById('addfeaturetocombine');

  var colourPickerAnchor = document.getElementById('colourpicker');
  let colourSamplePallete = document.getElementById('colourpallete');

  let cfillredchannel = document.getElementById('fillredchannel');
  let cfillgreenchannel = document.getElementById('fillgreenchannel');
  let cfillbluechannel = document.getElementById('fillbluechannel');
  let cfillalphachannel = document.getElementById('fillalphachannel');
  let strokeredchannel = document.getElementById('strokeredchannel');
  let strokegreenchannel = document.getElementById('strokegreenchannel');
  let strokebluechannel = document.getElementById('strokebluechannel');
  let strokealphachannel = document.getElementById('strokealphachannel');
  let strokewidthvalue = document.getElementById('strokewidthvalue');
  let checkcontiguousvalue = document.getElementById('contiguousdetector');

  let mainFile = document.getElementById('view_mainfile_codex').value;
  let toolboxQuotaInitCounter = document.getElementById('quotacounterinit');
  let toolboxQuotaCurrentCounter = document.getElementById('currentquotacounter');
  let toolboxRoundedQuotaNumber = document.getElementById('roundedseatallocation');
  let toolboxRemainderQuotaNumber = document.getElementById('roundedremainder');
  let minimumSeatMagnitudeIndicator = document.getElementById('districtminimumseatallocation');
  let maximumSeatMagnitudeIndicator = document.getElementById('districtmaximumseatallocation');

  let stdDeviationStatus = document.getElementById('stddevstatus');
  let stdDeviationIgnoreStatus = document.getElementById('stddevignore');
  let stdDeviationValue = document.getElementById('stddev');
  let stdDeviationPassValue = document.getElementById('stddevpass');

  let notice_nodistricttosave = document.getElementById('toolboxnotice-nodistricttosave');
  let notice_duplicatedname = document.getElementById('toolboxnotice-duplicatedname');
  let notice_nodistrictname = document.getElementById('toolboxnotice-nodistrictname');
  let notice_minimumwarning = document.getElementById('toolboxnotice-minimumwarning');
  let notice_maximumwarning = document.getElementById('toolboxnotice-maximumwarning');
  let notice_stddevexceedwarning = document.getElementById('toolboxnotice-stddevexceedwarning');
  let notice_savesuccess = document.getElementById('toolboxnotice-savesuccess');

  let toolboxTableBody = document.getElementById('areatoprocess').getElementsByTagName('tbody')[0];
  let toolboxTableSeatAllocationCell = document.getElementById('seatallocation');
  let toolboxTableQuotaCounterCell = document.getElementById('quotaCounterCell');
  let electoralDistrictName = document.getElementById('electoraldistrictname');
  let btnSaveElectoralDistrict = document.getElementById('saveelectoraldistrict');
  let checkboxActivateContiguousCheck = document.getElementById('contiguousdetectoractivate');
  let checkboxShowHideDistrictLabel = document.getElementById('showhidedistrictlabelinmap');
  let btnShowHideResumeTable = document.getElementById('showelectoraldistricttableresume');
  let btnRefreshToolbox = document.getElementById('refreshtoolbox');
  let btnPurgeToolbox = document.getElementById('purgetoolbox');

  /* table resume */
  let resumeTableRef = document.getElementById('resumetable').getElementsByTagName('tbody')[0];
  let resumeTableContainer = document.getElementById('resumecontainer');
  let resumeTableFooterTotalPopulationCell = document.getElementById('resumetotalpopulation');
  let resumeTableFooterTotalSeatsCell = document.getElementById('resumetotalseats');
  let resumeTableFooterTotalRemainsCell = document.getElementById('resumetotalremains');

  let colourPicker = new Picker(colourPickerAnchor);
  colourPicker.onChange = function(color) {
    colourSamplePallete.classList.remove('colourpallete-initial');
    colourSamplePallete.style.background = color.rgbaString;
    cfillredchannel.value = color.rgba[0];
    cfillgreenchannel.value = color.rgba[1];
    cfillbluechannel.value = color.rgba[2];
    cfillalphachannel.value = color.rgba[3];
  };

  checkboxActivateContiguousCheck.addEventListener('change', function(){
    if(checkboxActivateContiguousCheck.checked == true){
      checkcontiguousvalue.value = 1;
      sessionStorage.setItem('contiguouscheck', 1);
    } else {
      checkcontiguousvalue.value = 0;
      sessionStorage.setItem('contiguouscheck', 0);
    }
  });

  checkboxShowHideDistrictLabel.addEventListener('change', function(){
    if(checkboxShowHideDistrictLabel.checked == true){
      otfPointsLayer.setVisible(true);
    } else {
      otfPointsLayer.setVisible(false);
    }
  });

  btnShowHideResumeTable.addEventListener('click', function(evt){
    evt.preventDefault();
    resumeTableContainer.classList.toggle('hidden');
  });

  btnSaveElectoralDistrict.addEventListener('click', function(evt){
    evt.preventDefault();
    let cActiveFeatures = [];
    map.getLayers().forEach(function(layer){
      if(layer.get('id') == 'main-layer'){
        layer.getSource().getFeatures().map((feature)=>{
          if(feature.get('is_redistricted') == 1){
            cActiveFeatures.push(feature.get('electoral_district').toLowerCase());
          }
        });
      }
    });
    let currentStoredData = sessionStorage.getItem('tbxdata');
    //let centroidObject = sessionStorage.getItem('centroid');
    let storedDataObject = JSON.parse(currentStoredData);
    let vredchannel = cfillredchannel.value;
    let vgreenchannel = cfillgreenchannel.value;
    let vbluechannel = cfillbluechannel.value;
    let valphachannel = cfillalphachannel.value;
    if(storedDataObject.length == 0){
      notice_nodistricttosave.classList.remove('hidden');
      setTimeout(function(){
        notice_nodistricttosave.classList.add('hidden');
      }, 3000);
    } else {
      let calculatedCentroidObj = lib.pickCentroid(storedDataObject);
      let eDistrictName = electoralDistrictName.value;
      let eDistrictQuotaCombined = toolboxQuotaCurrentCounter.value;
      let eDistrictSeatAllocationRounded = toolboxRoundedQuotaNumber.value;
      let eDistrictQuotaRemainder = toolboxRemainderQuotaNumber.value;
      // let eDistrictCentroid = centroidObject;
      let eDistrictCentroid = JSON.stringify(calculatedCentroidObj);
      let eMinimumSeatAllocation = minimumSeatMagnitudeIndicator.value;
      let eMaximumSeatAllocation = maximumSeatMagnitudeIndicator.value;
      let eStdDeviationStatusValue = stdDeviationStatus.value;
      let eStdDeviationIgnoreStatusValue = stdDeviationIgnoreStatus.value;
      let eStdDeviationValue = stdDeviationValue.value;
      let eStdDeviationPassValue = stdDeviationPassValue.value;
      if(eDistrictName.length == 0){
        notice_nodistrictname.classList.remove('hidden');
        setTimeout(function(){
          notice_nodistrictname.classList.add('hidden');
        }, 3000);
      } else {
        if(parseInt(eDistrictSeatAllocationRounded) < parseInt(eMaximumSeatAllocation) && parseInt(eDistrictSeatAllocationRounded) < parseInt(eMinimumSeatAllocation)){
          notice_minimumwarning.classList.remove('hidden');
          setTimeout(function(){
            notice_minimumwarning.classList.add('hidden');
          }, 3000);
        } else if(parseInt(eDistrictSeatAllocationRounded) > parseInt(eMaximumSeatAllocation) && parseInt(eDistrictSeatAllocationRounded) > parseInt(eMinimumSeatAllocation)){
          notice_maximumwarning.classList.remove('hidden');
          setTimeout(function(){
            notice_maximumwarning.classList.add('hidden');
          }, 3000);
        } else {
          if(eStdDeviationPassValue == 0){
            notice_stddevexceedwarning.classList.remove('hidden');
            setTimeout(function(){
              notice_stddevexceedwarning.classList.add('hidden');
            }, 3000);
          } else {
            let uniqueDistrictNames = [...new Set(cActiveFeatures)];
            if(uniqueDistrictNames.indexOf(eDistrictName.toLowerCase()) != -1){
              notice_duplicatedname.classList.remove('hidden');
              setTimeout(function(){
                notice_duplicatedname.classList.add('hidden');
              }, 3000);
            } else {
              let electoralDistrictNameObject = {"is_redistricted": "1", "electoral_district": eDistrictName, "fill_red_channel": vredchannel, "fill_green_channel": vgreenchannel, "fill_blue_channel": vbluechannel, "fill_alpha_channel": valphachannel, "district_xcalc_sq": eDistrictQuotaCombined, "district_xcalc_round": eDistrictSeatAllocationRounded, "district_xcalc_remain": eDistrictQuotaRemainder, "centroid": eDistrictCentroid};
              storedDataObject.forEach(function(item){
                Object.assign(item, electoralDistrictNameObject);
              });
              let wrappedDataObject = {"mainfile": mainFile, "areas": storedDataObject};
              let reqPayload = JSON.stringify(wrappedDataObject);
              let xhr = new XMLHttpRequest();
              xhr.responseType = 'json';
              xhr.onload = function(){
                let resObj = xhr.response;
                if(resObj.code == 200 && resObj.message == 'success'){
                  notice_savesuccess.classList.remove('hidden');
                  setTimeout(function(){
                    notice_savesuccess.classList.add('hidden');
                    if(notice_nodistricttosave.classList.contains('hidden') == false){
                      notice_nodistricttosave.classList.add('hidden');
                    }
                    if(notice_duplicatedname.classList.contains('hidden') == false){
                      notice_duplicatedname.classList.add('hidden');
                    }
                    if(notice_nodistrictname.classList.contains('hidden') == false){
                      notice_nodistrictname.classList.add('hidden');
                    }
                    if(notice_minimumwarning.classList.contains('hidden') == false){
                      notice_minimumwarning.classList.add('hidden');
                    }
                    if(notice_maximumwarning.classList.contains('hidden') == false){
                      notice_maximumwarning.classList.add('hidden');
                    }
                    if(notice_stddevexceedwarning.classList.contains('hidden') == false){
                      notice_stddevexceedwarning.classList.add('hidden');
                    }
                  }, 2000);
                  lib.sessionStorageStateReset();
                  //lib.setNextDefaultColour();
                  lib.setDefaultFeatureColour(resObj.data);
                  if(resObj.data.xredistricted_attribute == 1){
                    lib.buildResumeTable(resObj.data, map, otfPointsLayer);
                    lib.mapRedrawOptionalFeatures(map, resObj.data, otfPointsLayer);
                    if(btnShowHideResumeTable.classList.contains('button-show-resume-table-disabled')){
                      btnShowHideResumeTable.classList.remove('button-show-resume-table-disabled');
                      btnShowHideResumeTable.classList.add('button-show-resume-table-enabled');
                      btnShowHideResumeTable.disabled = false;
                    }
                  }
                  strokeredchannel.value = '0';
                  strokegreenchannel.value = '0';
                  strokebluechannel.value = '0';
                  strokealphachannel.value = '1';
                  strokewidthvalue.value = '1';
                  toolboxTableBody.innerHTML = '';
                  toolboxQuotaInitCounter.value = '0';
                  toolboxQuotaCurrentCounter.value = '0';
                  toolboxRoundedQuotaNumber.value = '0';
                  toolboxRemainderQuotaNumber.value = '0';
                  toolboxTableSeatAllocationCell.innerText = '0';
                  toolboxTableQuotaCounterCell.innerText = '0';
                  electoralDistrictName.value = '';
                  //colourSamplePallete.style.background = null;
                  //colourSamplePallete.classList.add('colourpallete-initial');
                  selectedfeaturegeometrystring.value = '';
                  dataselector.classList.remove('area-selector-enabled-button');
                  dataselector.classList.add('area-selector-disabled-button');
                  dataselector.disabled = true;
                  contiguousrow.classList.add('hidden');
                } else {
                  alert('Saving data failed.');
                  lib.sessionStorageStateReset();
                  strokeredchannel.value = '0';
                  strokegreenchannel.value = '0';
                  strokebluechannel.value = '0';
                  strokealphachannel.value = '1';
                  strokewidthvalue.value = '1';
                  toolboxTableBody.innerHTML = '';
                  toolboxQuotaInitCounter.value = '0';
                  toolboxQuotaCurrentCounter.value = '0';
                  toolboxRoundedQuotaNumber.value = '0';
                  toolboxRemainderQuotaNumber.value = '0';
                  toolboxTableSeatAllocationCell.innerText = '0';
                  toolboxTableQuotaCounterCell.innerText = '0';
                  electoralDistrictName.value = '';
                  //colourSamplePallete.style.background = null;
                  //colourSamplePallete.classList.add('colourpallete-initial');
                  selectedfeaturegeometrystring.value = '';
                  dataselector.classList.remove('area-selector-enabled-button');
                  dataselector.classList.add('area-selector-disabled-button');
                  dataselector.disabled = true;
                  contiguousrow.classList.add('hidden');
                  map.getLayers().forEach(function(layer){
                    if(layer instanceof VectorLayer){
                      layer.getSource().refresh();
                      map.updateSize();
                    }
                  });
                }
              };
              xhr.open('POST', 'http://localhost:7447/saveElectoralDistrict');
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.send(reqPayload);
            }
          }
        }
      }
    }
  });

  btnRefreshToolbox.addEventListener('click', function(evt){
    evt.preventDefault();
    lib.sessionStorageStateReset();
    lib.setDefaultFeatureColour(mapdata);
    strokeredchannel.value = '0';
    strokegreenchannel.value = '0';
    strokebluechannel.value = '0';
    strokealphachannel.value = '1';
    strokewidthvalue.value = '1';
    toolboxTableBody.innerHTML = '';
    toolboxQuotaInitCounter.value = '0';
    toolboxQuotaCurrentCounter.value = '0';
    toolboxRoundedQuotaNumber.value = '0';
    toolboxRemainderQuotaNumber.value = '0';
    toolboxTableSeatAllocationCell.innerText = '0';
    toolboxTableQuotaCounterCell.innerText = '0';
    electoralDistrictName.value = '';
    colourSamplePallete.style.background = null;
    colourSamplePallete.classList.add('colourpallete-initial');
    selectedfeaturegeometrystring.value = '';
    dataselector.classList.remove('area-selector-enabled-button');
    dataselector.classList.add('area-selector-disabled-button');
    dataselector.disabled = true;
    contiguousrow.classList.add('hidden');
    map.getLayers().forEach(function(layer){
      if(layer instanceof VectorLayer){
        layer.getSource().refresh();
        map.updateSize();
      }
    });
    if(notice_nodistricttosave.classList.contains('hidden') == false){
      notice_nodistricttosave.classList.add('hidden');
    }
    if(notice_duplicatedname.classList.contains('hidden') == false){
      notice_duplicatedname.classList.add('hidden');
    }
    if(notice_nodistrictname.classList.contains('hidden') == false){
      notice_nodistrictname.classList.add('hidden');
    }
    if(notice_minimumwarning.classList.contains('hidden') == false){
      notice_minimumwarning.classList.add('hidden');
    }
    if(notice_maximumwarning.classList.contains('hidden') == false){
      notice_maximumwarning.classList.add('hidden');
    }
    if(notice_stddevexceedwarning.classList.contains('hidden') == false){
      notice_stddevexceedwarning.classList.add('hidden');
    }
    if(notice_savesuccess.classList.contains('hidden') == false){
      notice_savesuccess.classList.add('hidden');
    }
  });

  btnPurgeToolbox.addEventListener('click', function(evt){
    evt.preventDefault();
    let purgeConfirmation = confirm('Are you really want to purge this project?');
    if(purgeConfirmation === true){
      let wrappedDataObject = {"mainfile": mainFile};
      let reqPayload = JSON.stringify(wrappedDataObject);
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.onload = function(){
        let resObj = xhr.response;
        if(resObj.code == 200 && resObj.message == 'success'){
          alert('Purge data success.');
          lib.sessionStorageStateReset();
          lib.setDefaultFeatureColour(resObj.data);
          strokeredchannel.value = '0';
          strokegreenchannel.value = '0';
          strokebluechannel.value = '0';
          strokealphachannel.value = '1';
          strokewidthvalue.value = '1';
          toolboxTableBody.innerHTML = '';
          toolboxQuotaInitCounter.value = '0';
          toolboxQuotaCurrentCounter.value = '0';
          toolboxRoundedQuotaNumber.value = '0';
          toolboxRemainderQuotaNumber.value = '0';
          toolboxTableSeatAllocationCell.innerText = '0';
          toolboxTableQuotaCounterCell.innerText = '0';
          electoralDistrictName.value = '';
          //colourSamplePallete.style.background = null;
          //colourSamplePallete.classList.add('colourpallete-initial');
          selectedfeaturegeometrystring.value = '';
          dataselector.classList.remove('area-selector-enabled-button');
          dataselector.classList.add('area-selector-disabled-button');
          dataselector.disabled = true;
          contiguousrow.classList.add('hidden');
          resumeTableRef.innerHTML = '';
          resumeTableFooterTotalPopulationCell.innerText = '';
          resumeTableFooterTotalSeatsCell.innerText = '';
          resumeTableFooterTotalRemainsCell.innerText = '';
          resumeTableContainer.classList.add('hidden');
          map.getLayers().forEach(function(layer){
            if(layer instanceof VectorLayer){
              layer.getSource().refresh();
              map.updateSize();
            }
          });
          if(notice_nodistricttosave.classList.contains('hidden') == false){
            notice_nodistricttosave.classList.add('hidden');
          }
          if(notice_duplicatedname.classList.contains('hidden') == false){
            notice_duplicatedname.classList.add('hidden');
          }
          if(notice_nodistrictname.classList.contains('hidden') == false){
            notice_nodistrictname.classList.add('hidden');
          }
          if(notice_minimumwarning.classList.contains('hidden') == false){
            notice_minimumwarning.classList.add('hidden');
          }
          if(notice_maximumwarning.classList.contains('hidden') == false){
            notice_maximumwarning.classList.add('hidden');
          }
          if(notice_stddevexceedwarning.classList.contains('hidden') == false){
            notice_stddevexceedwarning.classList.add('hidden');
          }
          if(notice_savesuccess.classList.contains('hidden') == false){
            notice_savesuccess.classList.add('hidden');
          }
        } else {
          alert('Purge data failed.');
          lib.sessionStorageStateReset();
          cfillredchannel.value = '178';
          cfillgreenchannel.value = '24';
          cfillbluechannel.value = '43';
          cfillalphachannel.value = '1';
          strokeredchannel.value = '0';
          strokegreenchannel.value = '0';
          strokebluechannel.value = '0';
          strokealphachannel.value = '1';
          strokewidthvalue.value = '1';
          toolboxTableBody.innerHTML = '';
          toolboxQuotaInitCounter.value = '0';
          toolboxQuotaCurrentCounter.value = '0';
          toolboxRoundedQuotaNumber.value = '0';
          toolboxRemainderQuotaNumber.value = '0';
          toolboxTableSeatAllocationCell.innerText = '0';
          toolboxTableQuotaCounterCell.innerText = '0';
          electoralDistrictName.value = '';
          //colourSamplePallete.style.background = null;
          //colourSamplePallete.classList.add('colourpallete-initial');
          selectedfeaturegeometrystring.value = '';
          dataselector.classList.remove('area-selector-enabled-button');
          dataselector.classList.add('area-selector-disabled-button');
          dataselector.disabled = true;
          contiguousrow.classList.add('hidden');
          resumeTableRef.innerHTML = '';
          resumeTableFooterTotalPopulationCell.innerText = '';
          resumeTableFooterTotalSeatsCell.innerText = '';
          resumeTableFooterTotalRemainsCell.innerText = '';
          resumeTableContainer.classList.add('hidden');
          map.getLayers().forEach(function(layer){
            if(layer instanceof VectorLayer){
              layer.getSource().refresh();
              map.updateSize();
            }
          });
          if(notice_nodistricttosave.classList.contains('hidden') == false){
            notice_nodistricttosave.classList.add('hidden');
          }
          if(notice_duplicatedname.classList.contains('hidden') == false){
            notice_duplicatedname.classList.add('hidden');
          }
          if(notice_nodistrictname.classList.contains('hidden') == false){
            notice_nodistrictname.classList.add('hidden');
          }
          if(notice_minimumwarning.classList.contains('hidden') == false){
            notice_minimumwarning.classList.add('hidden');
          }
          if(notice_maximumwarning.classList.contains('hidden') == false){
            notice_maximumwarning.classList.add('hidden');
          }
          if(notice_stddevexceedwarning.classList.contains('hidden') == false){
            notice_stddevexceedwarning.classList.add('hidden');
          }
          if(notice_savesuccess.classList.contains('hidden') == false){
            notice_savesuccess.classList.add('hidden');
          }
        }
      };
      xhr.open('POST', 'http://localhost:7447/purgeCurrentProject');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(reqPayload);
    } else {
      return;
    }
  });
  if(mapdata.xredistricted_attribute == 1){
    btnShowHideResumeTable.classList.remove('button-show-resume-table-disabled');
    btnShowHideResumeTable.classList.add('button-show-resume-table-enabled');
    btnShowHideResumeTable.disabled = false;
  }
};

lib.buildResumeTable = function(data, mapObject, optionalPointsVectorLayer){
  let districtData = data.features;
  let map = mapObject;
  let otfPointsLayer = optionalPointsVectorLayer;
  let districtedArray = [];
  districtData.forEach(function(item, index){
    if(item.is_redistricted == 1){
      districtedArray.push(item);
    }
  });
  if(districtedArray.length > 0){
    let mainProjectName = document.getElementById('project_name_reference').value;
    let resumeTableContainer = document.getElementById('resumecontainer');
    let resumeTableRef = document.getElementById('resumetable').getElementsByTagName('tbody')[0];
    let resumeTablePrintedRef = document.getElementById('resumetableprinted').getElementsByTagName('tbody')[0];
    let mainProjectNameHeaderCell = document.getElementById('onscreentablenomenclature');
    let totalPopulationIndicatorCell = document.getElementById('totalpopulationindicator');
    let parliamentSeatsIndicatorCell = document.getElementById('parliamentseatsindicator');
    let quotaDividerIndicatorCell = document.getElementById('quotadividerindicator');
    let minimumSeatMagnitudeIndicatorCell = document.getElementById('minimumseatmagnitudeindicator');
    let maximumSeatMagnitudeIndicatorCell = document.getElementById('maximumseatmagnitudeindicator');
    let standardDeviationIndicatorCell = document.getElementById('standarddeviationindicator');
    let mainProjectNameHeaderPrintedCell = document.getElementById('printedtablenomenclature');
    let totalPopulationIndicatorPrintedCell = document.getElementById('printedtotalpopulationindicator');
    let parliamentSeatsIndicatorPrintedCell = document.getElementById('printedparliamentseatsindicator');
    let quotaDividerIndicatorPrintedCell = document.getElementById('printedquotadividerindicator');
    let minimumSeatMagnitudeIndicatorPrintedCell = document.getElementById('printedminimumseatmagnitudeindicator');
    let maximumSeatMagnitudeIndicatorPrintedCell = document.getElementById('printedmaximumseatmagnitudeindicator');
    let standardDeviationIndicatorPrintedCell = document.getElementById('printedstandarddeviationindicator');
    /* some resets on dynamic tfoot for remaining seats >= 1 */
    let resumeTFootCell = document.getElementById('resumetotalremains');
    if(resumeTFootCell.classList.contains('bg-blue-900') == true){
      resumeTFootCell.classList.remove('bg-blue-900');
    }
    if(resumeTFootCell.classList.contains('bg-red-700') == true){
      resumeTFootCell.classList.remove('bg-red-700');
    }
    districtedArray.sort(function(firstEntry, nextEntry){
      var firstDistrictName = firstEntry.electoral_district.toUpperCase();
      var nextDistrictName = nextEntry.electoral_district.toUpperCase();
      if (firstDistrictName < nextDistrictName) {
        return -1;
      }
      if (firstDistrictName > nextDistrictName){
        return 1;
      }
      return 0;
    });
    let tableRowsDOM = '';
    let tableRowsPrintedDOM = '';
    let districtNameTemp;
    let resumeTotalPopulation = 0;
    let resumeTotalSeat = 0;
    let resumeTotalRemain = 0;
    districtedArray.forEach(function(item) {
      let districtName = item.electoral_district;
      let areaName = item.xareaname;
      let areaPopulation = item.xarea_population;
      let areaQuota = item.xcalc_sq;
      let districtQuota = item.district_xcalc_sq;
      let districtSeat = item.district_xcalc_round;
      let districtRemains = item.district_xcalc_remain;
      let districtNamesFilter = districtedArray.filter(function(feature) {
        return feature.electoral_district === districtName;
      });
      var rowspan = districtNamesFilter.length;
      tableRowsDOM += `<tr>`;
      tableRowsPrintedDOM += `<tr>`;
  
      if (districtName !== districtNameTemp) {
        if (rowspan > 1) {
          tableRowsDOM += `<td rowspan="${rowspan}" class="resume-table-tbody-district-name" style="width: 91px;">${districtName}</td>`;
          tableRowsPrintedDOM += `<td rowspan="${rowspan}" class="">${districtName}</td>`;
        } else {
          tableRowsDOM += `<td class="resume-table-tbody-district-name" style="width: 91px;">${districtName}</td>`;
          tableRowsPrintedDOM += `<td class="">${districtName}</td>`;
        }
      }
      tableRowsDOM += `<td class="resume-table-tbody-area-name" style="width: 102px;">${areaName}</td>`;
      tableRowsPrintedDOM += `<td class="">${areaName}</td>`;
      tableRowsDOM += `<td class="resume-table-tbody-area-population" style="width: 73px;">${numeral(areaPopulation).format('0,0')}</td>`;
      tableRowsPrintedDOM += `<td class="">${numeral(areaPopulation).format('0,0')}</td>`;
      tableRowsDOM += `<td class="resume-table-tbody-area-quota" style="width: 44px;">${areaQuota}</td>`;
      tableRowsPrintedDOM += `<td class="">${areaQuota}</td>`;
      
      if (districtName !== districtNameTemp) {
        if (rowspan > 1) {
          tableRowsDOM += `<td rowspan="${rowspan}" class="resume-table-tbody-district-quota" style="width: 42px;">${districtQuota}</td>`;
          tableRowsPrintedDOM += `<td rowspan="${rowspan}" class="">${districtQuota}</td>`;
          tableRowsDOM += `<td rowspan="${rowspan}" class="resume-table-tbody-seat-allocation" style="width: 36px;">${districtSeat}</td>`;
          tableRowsPrintedDOM += `<td rowspan="${rowspan}" class="">${districtSeat}</td>`;
          tableRowsDOM += `<td rowspan="${rowspan}" class="resume-table-tbody-quota-remains-plus" style="width: 43px;">${districtRemains}</td>`;
          tableRowsPrintedDOM += `<td rowspan="${rowspan}" class="">${districtRemains}</td>`;
          tableRowsDOM += `<td rowspan="${rowspan}" class="resume-table-tbody-delete-plus" style="width: 22px;"><button role='button' id='${districtName}' class='p-1 text-red-900 bg-gray-400 item-to-undistrict'><svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button></td>`;
        } else {
          tableRowsDOM += `<td class="resume-table-tbody-district-quota" style="width: 42px;">${districtQuota}</td>`;
          tableRowsPrintedDOM += `<td class="">${districtQuota}</td>`;
          tableRowsDOM += `<td class="resume-table-tbody-seat-allocation" style="width: 36px;">${districtSeat}</td>`;
          tableRowsPrintedDOM += `<td class="">${districtSeat}</td>`;
          tableRowsDOM += `<td class="resume-table-tbody-quota-remains-plus" style="width: 43px;">${districtRemains}</td>`;
          tableRowsPrintedDOM += `<td class="">${districtRemains}</td>`;
          tableRowsDOM += `<td rowspan="${rowspan}" class="resume-table-tbody-delete-plus" style="width: 22px;"><button role='button' id='${districtName}' class='p-1 text-red-900 bg-gray-400 item-to-undistrict'><svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button></td>`;
        }
        districtNameTemp = districtName;
        resumeTotalSeat += parseInt(districtSeat);
        resumeTotalRemain += parseFloat(districtRemains);
      }
      tableRowsDOM += `</tr>`;
      tableRowsPrintedDOM += `</tr>`;
      resumeTotalPopulation += parseInt(areaPopulation);
    });
    resumeTableRef.innerHTML = tableRowsDOM;
    resumeTablePrintedRef.innerHTML = tableRowsPrintedDOM;
    document.getElementById('resumetotalpopulation').innerText = numeral(resumeTotalPopulation).format('0,0');
    document.getElementById('printedresumetotalpopulation').innerText = numeral(resumeTotalPopulation).format('0,0');
    document.getElementById('resumetotalseats').innerText = resumeTotalSeat;
    document.getElementById('printedresumetotalseats').innerText = resumeTotalSeat;
    document.getElementById('resumetotalremains').innerText = resumeTotalRemain.toFixed(2);
    document.getElementById('printedresumetotalremains').innerText = resumeTotalRemain.toFixed(2);
    totalPopulationIndicatorCell.innerText = numeral(data.totalpopulation).format('0,0');
    mainProjectNameHeaderCell.innerText = `Electoral Redistricting Resume on ${mainProjectName}`;
    mainProjectNameHeaderPrintedCell.innerText = `Electoral Redistricting Resume on ${mainProjectName}`;
    totalPopulationIndicatorPrintedCell.innerText = numeral(data.totalpopulation).format('0,0');
    parliamentSeatsIndicatorCell.innerText = data.parliament_seats;
    parliamentSeatsIndicatorPrintedCell.innerText = data.parliament_seats;
    quotaDividerIndicatorCell.innerText = numeral(parseInt(data.xdivider)).format('0,0');
    quotaDividerIndicatorPrintedCell.innerText = numeral(parseInt(data.xdivider)).format('0,0');
    minimumSeatMagnitudeIndicatorCell.innerText = data.minimum_seats;
    minimumSeatMagnitudeIndicatorPrintedCell.innerText = data.minimum_seats;
    maximumSeatMagnitudeIndicatorCell.innerText = data.maximum_seats;
    maximumSeatMagnitudeIndicatorPrintedCell.innerText = data.maximum_seats;
    standardDeviationIndicatorCell.innerText = data.stddev;
    standardDeviationIndicatorPrintedCell.innerText = data.stddev;
    if(parseInt(resumeTotalRemain) >= 1){
      resumeTFootCell.classList.add('bg-red-700');
    } else {
      resumeTFootCell.classList.add('bg-blue-900');
    }
    resumeTableContainer.classList.remove('hidden');
    lib.enableUndistrictFunction(map, otfPointsLayer);
    lib.enableMapPDFPrint(data, map);
  } else {
    districtedArray = null;
  }
};

lib.enableMapPDFPrint = function(data, mapObject, projectName){
  var projectStringNameRef = document.getElementById('project_name_reference').value;
  let map = mapObject;
  let mainFileName = data.codex;
  let pdfFileName = projectStringNameRef;
  let geoJSONFileName = pdfFileName.replaceAll(' ', '_');
  var exportGeoJSONButton = document.getElementById('export-geojson');
  var exportTableButton = document.getElementById('export-table');
  var exportMapButton = document.getElementById('export-map');
  var exportButton = document.getElementById('export-pdf');
  var base64Logo = imageLogo.logobase64;

  exportGeoJSONButton.removeEventListener('click', function(){return;});
  exportTableButton.removeEventListener('click', function(){return;});
  exportMapButton.removeEventListener('click', function(){return;});
  exportButton.removeEventListener('click', function(){return;});

  setTimeout(function(){
    exportTableButton.addEventListener('click', function(evt){
      evt.preventDefault();
      exportTableButton.disabled = true;
      document.body.style.cursor = 'progress';
      let pdf = new jsPDF('portrait', undefined, 'a4');
      pdf.autoTable({
        html: '#resumetableprinted',
        tableWidth: 180,
        theme: 'grid',
        tableLineWidth: 0.25,
        tableLineColor: [30, 58, 138],
        headStyles: { halign: 'center', lineWidth: 0.25, lineColor: [255, 255, 255], fillColor: [30, 58, 138], textColor: [255, 255, 255] },
        bodyStyles: { valign: 'middle', lineWidth: 0.25, lineColor: [30, 58, 138], fillColor: [255, 255, 255], textColor: [17, 17, 17] },
        footStyles: { lineWidth: 0.25, lineColor: [255, 255, 255], fillColor: [30, 58, 138], textColor: [255, 255, 255] },
        columnStyles: { 
          0: { valign: 'middle' }, 
          1: { valign: 'middle' }, 
          2: { valign: 'middle', halign: 'right' }, 
          3: { valign: 'middle', halign: 'right' }, 
          4: { valign: 'middle', halign: 'right' }, 
          5: { valign: 'middle', halign: 'right' }, 
          6: { valign: 'middle', halign: 'right' }, 
        },
        allSectionHooks: true,
        didParseCell: function(data){
          if(data.section === 'head'){
            if(data.row.index === 0){
              data.row.cells[0].styles.fontSize = 14;
            } else {
              return;
            }
          } else if(data.section === 'foot'){
            if(data.row.index === 0){
              data.cell.styles.halign = 'right';
            } else {
              data.row.cells[6].styles.halign = 'right';
            }
          } else {
            return;
          }
        },
      });
      pdf.save('Resume_Table_of_'+ pdfFileName +'.pdf');
      exportTableButton.disabled = false;
      document.body.style.cursor = 'auto';
    });
  
    exportMapButton.addEventListener('click', function(evt){
      evt.preventDefault();
      let resolution = 150;
      let dim = [420, 297];
      let width = Math.round((dim[0] * resolution) / 25.4);
      let height = Math.round((dim[1] * resolution) / 25.4);
      let size = map.getSize();
      let viewResolution = map.getView().getResolution();
  
      exportMapButton.disabled = true;
      document.body.style.cursor = 'progress';
  
      map.once('rendercomplete', function () {
        let mapCanvas = document.createElement('canvas');
        mapCanvas.width = width;
        mapCanvas.height = height;
        let mapContext = mapCanvas.getContext('2d');
        Array.prototype.forEach.call(
          document.querySelectorAll('.ol-layer canvas'),
          function (canvas) {
            if (canvas.width > 0) {
              const opacity = canvas.parentNode.style.opacity;
              mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
              const transform = canvas.style.transform;
              const matrix = transform.match(/^matrix\(([^\(]*)\)$/)[1].split(',').map(Number);
              CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
              mapContext.drawImage(canvas, 0, 0);
            }
          }
        );
        let pdf = new jsPDF('landscape', undefined, 'a3');
        pdf.addImage(mapCanvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, dim[0], dim[1]);
        pdf.addImage(base64Logo, 'JPEG', 330, 280, 85, 14);
        pdf.save(''+ pdfFileName +'.pdf');
        map.setSize(size);
        map.getView().setResolution(viewResolution);
        exportMapButton.disabled = false;
        document.body.style.cursor = 'auto';
      });
      const printSize = [width, height];
      map.setSize(printSize);
      const scaling = Math.min(width / size[0], height / size[1]);
      map.getView().setResolution(viewResolution / scaling);
    });
  
    exportButton.addEventListener('click', function(evt){
      evt.preventDefault();
      let resolution = 150;
      let dim = [210, 297];
      let width = Math.round((dim[0] * resolution) / 25.4);
      let height = Math.round((dim[1] * resolution) / 25.4);
      let size = map.getSize();
      let viewResolution = map.getView().getResolution();
  
      exportButton.disabled = true;
      document.body.style.cursor = 'progress';
  
      map.once('rendercomplete', function () {
        let mapCanvas = document.createElement('canvas');
        mapCanvas.width = width;
        mapCanvas.height = height;
        let mapContext = mapCanvas.getContext('2d');
        Array.prototype.forEach.call(
          document.querySelectorAll('.ol-layer canvas'),
          function (canvas) {
            if (canvas.width > 0) {
              const opacity = canvas.parentNode.style.opacity;
              mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
              const transform = canvas.style.transform;
              const matrix = transform.match(/^matrix\(([^\(]*)\)$/)[1].split(',').map(Number);
              CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
              mapContext.drawImage(canvas, 0, 0);
            }
          }
        );
        let pdf = new jsPDF('portrait', undefined, 'a4');
        pdf.addImage(mapCanvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, dim[0], dim[1]);
        pdf.addImage(base64Logo, 'JPEG', 122, 280, 85, 14);
        pdf.addPage('portrait', undefined, 'a4');
        pdf.autoTable({
          html: '#resumetableprinted',
          tableWidth: 180,
          theme: 'grid',
          tableLineWidth: 0.25,
          tableLineColor: [30, 58, 138],
          headStyles: { halign: 'center', lineWidth: 0.25, lineColor: [255, 255, 255], fillColor: [30, 58, 138], textColor: [255, 255, 255] },
          bodyStyles: { valign: 'middle', lineWidth: 0.25, lineColor: [30, 58, 138], fillColor: [255, 255, 255], textColor: [17, 17, 17] },
          footStyles: { lineWidth: 0.25, lineColor: [255, 255, 255], fillColor: [30, 58, 138], textColor: [255, 255, 255] },
          columnStyles: { 
            0: { valign: 'middle' }, 
            1: { valign: 'middle' }, 
            2: { valign: 'middle', halign: 'right' }, 
            3: { valign: 'middle', halign: 'right' }, 
            4: { valign: 'middle', halign: 'right' }, 
            5: { valign: 'middle', halign: 'right' }, 
            6: { valign: 'middle', halign: 'right' }, 
          },
          allSectionHooks: true,
          didParseCell: function(data){
            if(data.section === 'head'){
              if(data.row.index === 0){
                data.row.cells[0].styles.fontSize = 14;
              } else {
                return;
              }
            } else if(data.section === 'foot'){
              if(data.row.index === 0){
                data.cell.styles.halign = 'right';
              } else {
                data.row.cells[6].styles.halign = 'right';
              }
            } else {
              return;
            }
          },
        });
        pdf.save(''+ pdfFileName +'.pdf');
        map.setSize(size);
        map.getView().setResolution(viewResolution);
        exportButton.disabled = false;
        document.body.style.cursor = 'auto';
      });
      const printSize = [width, height];
      map.setSize(printSize);
      const scaling = Math.min(width / size[0], height / size[1]);
      map.getView().setResolution(viewResolution / scaling);
    });
  
    exportGeoJSONButton.addEventListener('click', function(evt){
      evt.preventDefault();
      var element = document.createElement('a');
      element.setAttribute('href', './data/files/'+mainFileName+'.json');
      element.setAttribute('download', geoJSONFileName+'.json');
    
      element.style.display = 'none';
      document.body.appendChild(element);
    
      element.click();
    
      document.body.removeChild(element);
    });
  }, 100);
};

lib.mapRedrawOptionalFeatures = function(mapObject, dataObject, optionalVectorLayer){
  let map = mapObject;
  let data = dataObject;
  map.getLayers().forEach(function(layer){
    if(layer instanceof VectorLayer){
      layer.getSource().refresh();
      map.updateSize();
    }
  });
  let otfPointsLayer = optionalVectorLayer;
  let districtData = data.features;
  let featuresArray = [];
  districtData.forEach(function(district){
    if(district.is_redistricted != 0){
      let featureObj = {type:"Feature",properties:{electoral_district:district.electoral_district,district_xcalc_round:district.district_xcalc_round},geometry:district.centroid};
      featuresArray.push(featureObj);
    }
  });
  let arrayFeatures = [];
  let newArrayFeatures = lib.appendSelectedObject(arrayFeatures, featuresArray);
  let pointsGeoJSONObject = {type:"FeatureCollection", features:newArrayFeatures};
  var features = new GeoJSON().readFeatures(pointsGeoJSONObject, {featureProjection: "EPSG:3857"});
  let otfPointObjects = new VectorSource({features});
  otfPointsLayer.setSource(otfPointObjects);
};

lib.createUtilityMapStageOne = function(data){
  let mapData = data;
  let mapAnchor = document.getElementById('data_view_body');
  let mapDOM = `<div class="relative w-full h-full">
      <div id="map" class="full-w-reduced-height"></div>
      <input type="hidden" id="selectedfeaturegeometrystring" value=""/>
      <input type="hidden" id="selectedfeaturecentroid" value=""/>
      <div id="popup" class="hidden ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer"></a>
        <div id="popup-content">
          <input type="hidden" id="f_xfid" value=""/>
          <input type="hidden" id="f_xareaname" value=""/>
          <input type="hidden" id="f_population" value=""/>
          <input type="hidden" id="f_quotacalc" value=""/>
          <table id="inpopuptable" class="mt-2 w-full table-auto border-collapse border border-blue-900">
            <thead>
              <tr>
                <th colspan="2" class="text-sm text-center align-middle py-2 bg-blue-900 text-gray-50">Area Data</th>
              </tr>
            </thead>
            <tfoot id="inpopuptablefooter" class="hidden inpopuptablefooterclass">
              <tr id="inpopupcontiguousrow" class="hidden">
                <td colspan="2" class="text-sm text-center font-semibold text-yellow-500 py-1 px-1 bg-red-700">This area is not contiguous with previously selected area(s).</td>
              </tr>
              <tr>
                <td colspan="2" class="text-right py-1 px-1">
                  <button role="button" id="addfeaturetocombine" class="text-sm px-3 py-1 area-selector-disabled-button border border-gray-500 focus:outline-none focus:ring-0" disabled="true">Select Area</button>
                </td>
              </tr>
            </tfoot>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>`;
  mapAnchor.insertAdjacentHTML('afterbegin', mapDOM);
};

lib.createUtilityMapStageTwo = function(data){
  let mapData = data;
  let mapAnchor = document.getElementById('data_view_body');
  let mapDOM = `<div class="relative w-full h-full">
      <div id="map" class="full-w-reduced-height"></div>
      <input type="hidden" id="selectedfeaturegeometrystring" value=""/>
      <input type="hidden" id="selectedfeaturecentroid" value=""/>
      <div id="popup" class="hidden ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer"></a>
        <div id="popup-content">
          <input type="hidden" id="f_xfid" value=""/>
          <input type="hidden" id="f_xareaname" value=""/>
          <input type="hidden" id="f_population" value=""/>
          <input type="hidden" id="f_quotacalc" value=""/>
          <table id="inpopuptable" class="mt-2 w-full table-auto border-collapse border border-blue-900">
            <thead>
              <tr>
                <th colspan="2" class="text-sm text-center align-middle py-2 bg-blue-900 text-gray-50">Area Data</th>
              </tr>
            </thead>
            <tfoot id="inpopuptablefooter" class="hidden inpopuptablefooterclass">
              <tr id="inpopupcontiguousrow" class="hidden">
                <td colspan="2" class="text-sm text-center font-semibold text-yellow-500 py-1 px-1 bg-red-700">This area is not contiguous with previously selected area(s).</td>
              </tr>
              <tr>
                <td colspan="2" class="text-right py-1 px-1">
                  <button role="button" id="addfeaturetocombine" class="text-sm px-3 py-1 area-selector-disabled-button border border-gray-500 focus:outline-none focus:ring-0" disabled="true">Select Area</button>
                </td>
              </tr>
            </tfoot>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>`;
  mapAnchor.insertAdjacentHTML('afterbegin', mapDOM);
};

lib.createUtilityMapStageThree = function(data){
  let mapData = data;
  let mapAnchor = document.getElementById('data_view_body');
  let mapDOM = `<div class="relative w-full h-full">
      <div id="map" class="full-w-reduced-height"></div>
      <input type="hidden" id="selectedfeaturegeometrystring" value=""/>
      <input type="hidden" id="selectedfeaturecentroid" value=""/>
      <div id="popup" class="hidden ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer"></a>
        <div id="popup-content">
          <input type="hidden" id="f_xfid" value=""/>
          <input type="hidden" id="f_xareaname" value=""/>
          <input type="hidden" id="f_population" value=""/>
          <input type="hidden" id="f_quotacalc" value=""/>
          <table id="inpopuptable" class="mt-2 w-full table-auto border-collapse border border-blue-900">
            <thead>
              <tr>
                <th colspan="2" class="text-sm text-center align-middle py-2 bg-blue-900 text-gray-50">Area Data</th>
              </tr>
            </thead>
            <tfoot id="inpopuptablefooter" class="hidden inpopuptablefooterclass">
              <tr id="inpopupcontiguousrow" class="hidden">
                <td colspan="2" class="text-sm text-center font-semibold text-yellow-500 py-1 px-1 bg-red-700">This area is not contiguous with previously selected area(s).</td>
              </tr>
              <tr>
                <td colspan="2" class="text-right py-1 px-1">
                  <button role="button" id="addfeaturetocombine" class="text-sm px-3 py-1 area-selector-disabled-button border border-gray-500 focus:outline-none focus:ring-0" disabled="true">Select Area</button>
                </td>
              </tr>
            </tfoot>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>`;
  mapAnchor.insertAdjacentHTML('afterbegin', mapDOM);
};

lib.createUtilityMapStageFour = function(data){
  let mapData = data;
  let mapAnchor = document.getElementById('data_view_body');
  let mapDOM = `<div class="relative w-full h-full">
      <div id="map" class="full-w-reduced-height"></div>
      <input type="hidden" id="selectedfeaturegeometrystring" value=""/>
      <input type="hidden" id="selectedfeaturecentroid" value=""/>
      <div id="popup" class="hidden ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer"></a>
        <div id="popup-content">
          <input type="hidden" id="f_xfid" value=""/>
          <input type="hidden" id="f_xareaname" value=""/>
          <input type="hidden" id="f_population" value=""/>
          <input type="hidden" id="f_quotacalc" value=""/>
          <table id="inpopuptable" class="mt-2 w-full table-auto border-collapse border border-blue-900">
            <thead>
              <tr>
                <th colspan="2" class="text-sm text-center align-middle py-2 bg-blue-900 text-gray-50">Area Data</th>
              </tr>
            </thead>
            <tfoot id="inpopuptablefooter" class="hidden inpopuptablefooterclass">
              <tr id="inpopupcontiguousrow" class="hidden">
                <td colspan="2" class="text-sm text-center font-semibold text-yellow-500 py-1 px-1 bg-red-700">This area is not contiguous with previously selected area(s).</td>
              </tr>
              <tr>
                <td colspan="2" class="text-right py-1 px-1">
                  <button role="button" id="addfeaturetocombine" class="text-sm px-3 py-1 area-selector-disabled-button border border-gray-500 focus:outline-none focus:ring-0" disabled="true">Select Area</button>
                </td>
              </tr>
            </tfoot>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>`;
  mapAnchor.insertAdjacentHTML('afterbegin', mapDOM);
};

lib.toolboxStateReset = function(){
  let selectedfeaturegeometrystring = document.getElementById('selectedfeaturegeometrystring');

  let contiguousrow = document.getElementById('inpopupcontiguousrow');
  let dataselector = document.getElementById('addfeaturetocombine');

  var colourPickerAnchor = document.getElementById('colourpicker');
  let colourSamplePallete = document.getElementById('colourpallete');

  let strokeredchannel = document.getElementById('strokeredchannel');
  let strokegreenchannel = document.getElementById('strokegreenchannel');
  let strokebluechannel = document.getElementById('strokebluechannel');
  let strokealphachannel = document.getElementById('strokealphachannel');
  let strokewidthvalue = document.getElementById('strokewidthvalue');

  let mainFile = document.getElementById('view_mainfile_codex').value;
  let toolboxQuotaInitCounter = document.getElementById('quotacounterinit');
  let toolboxQuotaCurrentCounter = document.getElementById('currentquotacounter');
  let toolboxRoundedQuotaNumber = document.getElementById('roundedseatallocation');
  let toolboxRemainderQuotaNumber = document.getElementById('roundedremainder');
  let toolboxTableBody = document.getElementById('areatoprocess').getElementsByTagName('tbody')[0];
  let toolboxTableSeatAllocationCell = document.getElementById('seatallocation');
  let toolboxTableQuotaCounterCell = document.getElementById('quotaCounterCell');
  let electoralDistrictName = document.getElementById('electoraldistrictname');
  let checkboxActivateContiguousCheck = document.getElementById('contiguousdetectoractivate');
  let btnSaveElectoralDistrict = document.getElementById('saveelectoraldistrict');
  let btnShowHideResumeTable = document.getElementById('showelectoraldistricttableresume');
  let btnRefreshToolbox = document.getElementById('refreshtoolbox');
  let btnPurgeToolbox = document.getElementById('purgetoolbox');

  let resumeTableContainer = document.getElementById('resumecontainer');

  strokeredchannel.value = '0';
  strokegreenchannel.value = '0';
  strokebluechannel.value = '0';
  strokealphachannel.value = '1';
  strokewidthvalue.value = '1';
  toolboxTableBody.innerHTML = '';
  toolboxQuotaInitCounter.value = '0';
  toolboxQuotaCurrentCounter.value = '0';
  toolboxRoundedQuotaNumber.value = '0';
  toolboxRemainderQuotaNumber.value = '0';
  toolboxTableSeatAllocationCell.innerText = '0';
  toolboxTableQuotaCounterCell.innerText = '0';
  electoralDistrictName.value = '';
  colourSamplePallete.style.background = null;
  colourSamplePallete.classList.add('colourpallete-initial');
  selectedfeaturegeometrystring.value = '';
  dataselector.classList.remove('area-selector-enabled-button');
  dataselector.classList.add('area-selector-disabled-button');
  dataselector.disabled = true;
  contiguousrow.classList.add('hidden');
  checkboxActivateContiguousCheck.setAttribute('checked', false);
};

lib.enableUndistrictFunction = function(mapObject, optionalVectorLayer){
  let map = mapObject;
  let otfPointsLayer = optionalVectorLayer;
  document.querySelectorAll('.item-to-undistrict').forEach(function(elm){
    elm.addEventListener('click', function(evt){
      evt.preventDefault();
      let districtName = this.getAttribute('id');
      let confirmUndistrict = confirm(`Are you really want to reset ${districtName}?`);
      if(confirmUndistrict === true){
        let mainFile = document.getElementById('view_mainfile_codex').value;
        let reqPayload = JSON.stringify({"mainfile": mainFile, "district": districtName});
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.onload = function(){
          let resObj = xhr.response;
          let btnShowHideResumeTable = document.getElementById('showelectoraldistricttableresume');
          let resumeTableContainer = document.getElementById('resumecontainer');
          let resumeTableRef = document.getElementById('resumetable').getElementsByTagName('tbody')[0];
          let resumeTablePrintedRef = document.getElementById('resumetableprinted').getElementsByTagName('tbody')[0];
          if(resObj.code == 200 && resObj.message == 'success'){
            lib.sessionStorageStateReset();
            if(resObj.data.xredistricted_attribute == 1){
              lib.buildResumeTable(resObj.data, map, otfPointsLayer);
              lib.mapRedrawOptionalFeatures(map, resObj.data, otfPointsLayer);
              if(btnShowHideResumeTable.classList.contains('button-show-resume-table-disabled')){
                btnShowHideResumeTable.classList.remove('button-show-resume-table-disabled');
                btnShowHideResumeTable.classList.add('button-show-resume-table-enabled');
                btnShowHideResumeTable.disabled = false;
              }
            } else {
              lib.mapRedrawOptionalFeatures(map, resObj.data, otfPointsLayer);
              if(btnShowHideResumeTable.classList.contains('button-show-resume-table-enabled')){
                btnShowHideResumeTable.classList.remove('button-show-resume-table-enabled');
                btnShowHideResumeTable.classList.add('button-show-resume-table-disabled');
                btnShowHideResumeTable.disabled = true;
              }
              if(resumeTableContainer.classList.contains('hidden') == false){
                resumeTableContainer.classList.add('hidden');
                resumeTableRef.innerHTML = '';
                resumeTablePrintedRef.innerHTML = '';
              } else {
                resumeTableRef.innerHTML = '';
                resumeTablePrintedRef.innerHTML = '';
              }
            }
            lib.toolboxStateReset();
          } else {
            alert('Reset electoral district failed.');
            lib.sessionStorageStateReset();
            lib.toolboxStateReset();
            map.getLayers().forEach(function(layer){
              if(layer instanceof VectorLayer){
                layer.getSource().refresh();
                map.updateSize();
              }
            });
          }
        };
        xhr.open('POST', 'http://localhost:7447/resetElectoralDistrict');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(reqPayload);
      } else {
        return;
      }
    });
  });
};

lib.sessionStorageStateReset = function(){
  sessionStorage.setItem('tbxdata', JSON.stringify([]));
  sessionStorage.setItem('geomdata', JSON.stringify([]));
  sessionStorage.setItem('geomtobe', JSON.stringify([]));
  sessionStorage.setItem('contiguouscheck', '1');
  sessionStorage.setItem('iscontiguous', '1');
  sessionStorage.setItem('centroid', '-');
};

lib.popupStateReset = function(){
  var popuptablefooter = document.getElementById('inpopuptablefooter');
  var contiguousrownotice = document.getElementById('inpopupcontiguousrow');
  var unsufficientcalcnotice = document.getElementById('inpopupdeselectareafailed');
  var dataselector = document.getElementById('addfeaturetocombine');
  var unselectorbutton = document.getElementById('unselectfeature');
  var deselectorbutton = document.getElementById('deselectfeature');
  var confirmdeselectbutton = document.getElementById('confirmdeselect');
  var canceldeselectbutton = document.getElementById('canceldeselect');
  if(!popuptablefooter.classList.contains('hidden')){
    popuptablefooter.classList.add('hidden');
  }
  if(!contiguousrownotice.classList.contains('hidden')){
    contiguousrownotice.classList.add('hidden');
  }
  if(!unsufficientcalcnotice.classList.contains('hidden')){
    unsufficientcalcnotice.classList.add('hidden');
  }
  if(!unselectorbutton.classList.contains('hidden')){
    unselectorbutton.classList.add('hidden');
  }
  if(!deselectorbutton.classList.contains('hidden')){
    deselectorbutton.classList.add('hidden');
  }
  if(!confirmdeselectbutton.classList.contains('hidden')){
    confirmdeselectbutton.classList.add('hidden');
  }
  if(!canceldeselectbutton.classList.contains('hidden')){
    canceldeselectbutton.classList.add('hidden');
  }
  if(!dataselector.classList.contains('area-selector-disabled-button')){
    dataselector.classList.add('area-selector-disabled-button');
  }
  if(dataselector.classList.contains('area-selector-enabled-button') == true){
    dataselector.classList.remove('area-selector-enabled-button');
  }
  dataselector.disabled = true;
  document.getElementById('f_xfid').value = '';
  document.getElementById('f_xareaname').value = '';
  document.getElementById('f_population').value = '';
  document.getElementById('f_quotacalc').value = '';
  document.getElementById('f_electoraldistrict').value = '';
  document.getElementById('deselected_xcalc').value = '';
  document.getElementById('deselected_xcalc_round').value = '';
  document.getElementById('deselected_xcalc_remains').value = '';
};

lib.pickCentroid = function(objdata){
  if(objdata.length == 1){
    return objdata[0].centroid;
  } else if(objdata.length == 2){
    return objdata[1].centroid;
  } else if(objdata.length == 3){
    return objdata[1].centroid;
  } else if(objdata.length == 4){
    return objdata[2].centroid;
  } else if(objdata.length == 5){
    return objdata[3].centroid;
  } else {
    if(objdata.length % 2 == 0){
      return objdata[(objdata.length / 2) + 1].centroid;
    } else {
      return objdata[((objdata.length - 1) / 2) + 1].centroid;
    }
  }
};

lib.setDefaultFeatureColour = function(data){
  if(data != undefined){
    let dataObj = data;
    let featuresArray = dataObj.features;
    let dataColourArray = [], uniqueDataColourArray = [];
    let defaultColourArray = ['178,24,43,1','84,48,5,1','140,81,10,1','191,129,45,1','223,194,125,1','246,232,195,1','142,1,82,1','197,27,125,1','222,119,174,1','241,182,218,1','253,224,239,1','64,0,75,1','118,42,131,1','153,112,171,1','194,165,207,1','231,212,232,1','127,59,8,1','179,88,6,1','224,130,20,1','253,184,99,1','254,224,182,1','103,0,31,1','214,96,77,1','244,165,130,1','253,219,199,1','165,0,38,1','215,48,39,1','244,109,67,1','253,174,97,1','254,224,144,1','255,255,191,1','224,243,248,1','171,217,233,1','116,173,209,1','69,117,180,1','49,54,149,1','209,229,240,1','146,197,222,1','67,147,195,1','33,102,172,1','5,48,97,1','216,218,235,1','178,171,210,1','128,115,172,1','84,39,136,1','45,0,75,1','217,240,211,1','166,219,160,1','90,174,97,1','27,120,55,1','0,68,27,1','230,245,208,1','184,225,134,1','127,188,65,1','77,146,33,1','39,100,25,1','199,234,229,1','128,205,193,1','53,151,143,1','1,102,94,1','0,60,48,1'];
    let cfillredchannel = document.getElementById('fillredchannel');
    let cfillgreenchannel = document.getElementById('fillgreenchannel');
    let cfillbluechannel = document.getElementById('fillbluechannel');
    let cfillalphachannel = document.getElementById('fillalphachannel');
    let colourPalleteBox = document.getElementById('colourpallete');
    if(dataObj.xredistricted_attribute == 0){
      colourPalleteBox.className = '';
      let defaultFirstColourArray = defaultColourArray[0].split(',');
      cfillredchannel.value = defaultFirstColourArray[0];
      cfillgreenchannel.value = defaultFirstColourArray[1];
      cfillbluechannel.value = defaultFirstColourArray[2];
      cfillalphachannel.value = defaultFirstColourArray[3];
      colourPalleteBox.classList.add('w-full');
      colourPalleteBox.classList.add('h-6');
      colourPalleteBox.style.backgroundColor = `rgba(${defaultFirstColourArray[0]},${defaultFirstColourArray[1]},${defaultFirstColourArray[2]},${defaultFirstColourArray[3]})`;
    } else {
      colourPalleteBox.className = '';
      featuresArray.map((feature)=>{
        if(feature.is_redistricted == 1){
          dataColourArray.push(`${parseInt(feature.fill_red_channel)},${parseInt(feature.fill_green_channel)},${parseInt(feature.fill_blue_channel)},${parseInt(feature.fill_alpha_channel)}`);
        }
      });
      uniqueDataColourArray = [...new Set(dataColourArray)];
      uniqueDataColourArray.map((featureColour)=>{
        for(let i = 0; i < defaultColourArray.length; i++){
          if(defaultColourArray[i] === featureColour){
            defaultColourArray.splice(i, 1);
          }
        }
      });
      let selectedColour = defaultColourArray[Math.floor(Math.random()*defaultColourArray.length)];
      let nextColourArray = selectedColour.split(',');
      colourPalleteBox.classList.add('w-full');
      colourPalleteBox.classList.add('h-6');
      cfillredchannel.value = nextColourArray[0];
      cfillgreenchannel.value = nextColourArray[1];
      cfillbluechannel.value = nextColourArray[2];
      cfillalphachannel.value = nextColourArray[3];
      colourPalleteBox.style.backgroundColor = `rgba(${nextColourArray[0]},${nextColourArray[1]},${nextColourArray[2]},${nextColourArray[3]})`;
    }
  } else {
    let cfillredchannel = document.getElementById('fillredchannel');
    let cfillgreenchannel = document.getElementById('fillgreenchannel');
    let cfillbluechannel = document.getElementById('fillbluechannel');
    let cfillalphachannel = document.getElementById('fillalphachannel');
    let colourPalleteBox = document.getElementById('colourpallete');
    colourPalleteBox.className = '';
    cfillredchannel.value = '178';
    cfillgreenchannel.value = '24';
    cfillbluechannel.value = '43';
    cfillalphachannel.value = '1';
    colourPalleteBox.classList.add('w-full');
    colourPalleteBox.classList.add('h-6');
    colourPalleteBox.style.backgroundColor = `rgba(178,24,43,1)`;
  }
};

lib.appendSelectedObject = function(initialArray, newObject){
  const dynamicObject = Object.freeze(newObject);
  return Object.freeze(initialArray.concat(dynamicObject));
};

lib.hexToRGBA = function(hex, opacity) {
  return 'rgba(' + (hex = hex.replace('#', '')).match(new RegExp('(.{' + hex.length/3 + '})', 'g')).map(function(l) { return parseInt(hex.length%2 ? l+l : l, 16) }).concat(isFinite(opacity) ? opacity : 1).join(',') + ')';
};

export default lib;