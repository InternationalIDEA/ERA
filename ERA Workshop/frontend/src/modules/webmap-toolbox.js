import { Control } from 'ol/control';

export class RedistrictingToolbox extends Control {
  constructor(opt_options) {
    const options = opt_options || {};
    const element = document.createElement('div');
    element.classList.add('relative');
    element.style.pointerEvents = 'none';
    element.id = 'redistrictingtoolboxidx';
    element.innerHTML = `<div id="toolbox" class='absolute mt-4 mr-2 h-full pointer-events-none right-0 top-0'>
        <input type="hidden" id="quotacounterinit" class="quotacounter" value="0"/>
        <input type="hidden" id="currentquotacounter" class="quotacounter" value="0"/>
        <input type="hidden" id="roundedseatallocation" class="quotacounter" value="0"/>
        <input type="hidden" id="roundedremainder" class="quotacounter" value="0"/>
        <input type="hidden" id="districtminimumseatallocation" class="quotacounter" value="0"/>
        <input type="hidden" id="districtmaximumseatallocation" class="quotacounter" value="0"/>
        <input type="hidden" id="stddevstatus" class="quotacounter" value="0"/>
        <input type="hidden" id="stddevignore" class="quotacounter" value="0"/>
        <input type="hidden" id="stddev" class="quotacounter" value="0"/>
        <input type="hidden" id="stddevpass" value="-"/>
        <input type="hidden" id="fillredchannel" value="178"/>
        <input type="hidden" id="fillgreenchannel" value="24"/>
        <input type="hidden" id="fillbluechannel" value="43"/>
        <input type="hidden" id="fillalphachannel" value="1"/>
        <input type="hidden" id="strokeredchannel" value="0"/>
        <input type="hidden" id="strokegreenchannel" value="0"/>
        <input type="hidden" id="strokebluechannel" value="0"/>
        <input type="hidden" id="strokealphachannel" value="1"/>
        <input type="hidden" id="strokewidthvalue" value="3"/>
        <input type="hidden" id="contiguousdetector" value="0"/>
        <div class="flex flex-col gap-0 bg-white p-2 pointer-events-auto custom-width-272px">
          <div class="custom-width-248px">
            <table class="text-sm w-full border border-b-0 border-blue-900">
              <thead>
                <tr>
                  <th colspan="2" class="text-center border border-blue-900">Electoral Redistricting Toolbox</th>
                </tr>
                <tr>
                  <th class="text-center border border-blue-900 w-40">Admin. Unit</th><th class="text-center border border-blue-900">Quota</th>
                </tr>
              </thead>
            </table>
          </div>
          <div class="w-full">
            <div class="flex flex-col gap-0">
              <div class="toolbox-dynamic-table-container w-full">
                <table id="areatoprocess" class="text-sm w-full border border-r border-l border-t-0 border-b-0 border-blue-900">
                  <tbody></tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="custom-width-248px">
            <table class="text-sm w-full border border-blue-900">
              <tfoot>
                <tr>
                  <th class="text-right border border-blue-900 w-40 pr-1">Quota</th><th id="quotaCounterCell" class="text-right border border-blue-900 pr-1"></th>
                </tr>
                <tr>
                  <th class="text-right border border-blue-900 w-40 pr-1">Seat Allocation</th><th id="seatallocation" class="text-right border border-blue-900 pr-1"></th>
                </tr>
                <tr class="hidden">
                  <th class="text-right border border-blue-900 w-40 pr-1">Standard Deviation</th><th id="cellStdDev" class="text-right border border-blue-900 pr-1"></th>
                </tr>
              </tfoot>
            </table>
          </div>
          <!-- <button id="recalculatequota" class="w-full my-1 p-1 text-sm bg-blue-900 text-white">Recalculate Quota</button> -->
          <div class="flex flex-col mt-2">
            <label class="text-sm">Save Electoral District Name as...</label>
            <input id="electoraldistrictname" name="electoraldistrictname" type="text" class="text-sm px-2 py-1 border border-gray-900"/>
          </div>
          <div class="flex flex-col mt-2">
            <div><span class="text-xs">Set Electoral District Colour</span></div>
            <div class="flex flex-col">
              <div class="flex flex-row justify-between items-center gap-1">
                <div class="">
                  <button id="colourpicker" class="flex items-center h-5 w-5 border border-gray-800 bg-gray-200 shadow">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </button>
                </div>
                <div id="colourpallete" class="w-full h-6 colourpallete-initial"></div>
              </div>
              <div></div>
            </div>
          </div>
          <button id="saveelectoraldistrict" class="w-full my-2 p-1 text-xs bg-blue-900 text-white">Save Electoral District</button>
          <div id="toolboxnotice-nodistricttosave" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-red-700">
            <p class="text-sm text-white text-center">No electoral district data to save.</p>
          </div>
          <div id="toolboxnotice-nodistrictname" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-red-700">
            <p class="text-sm text-white text-center">An electoral district name must be set.</p>
          </div>
          <div id="toolboxnotice-duplicatedname" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-red-700">
            <p class="text-sm text-white text-center">An electoral district with the same name has been set.</p>
          </div>
          <div id="toolboxnotice-minimumwarning" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-red-700">
            <p class="text-sm text-white text-center">Seat allocation doesn't reach the minimum allocation magnitude.</p>
          </div>
          <div id="toolboxnotice-maximumwarning" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-red-700">
            <p class="text-sm text-white text-center">Seat allocation exceeds the maximum allocation magnitude.</p>
          </div>
          <div id="toolboxnotice-stddevunderwarning" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-yellow-400">
            <p class="text-sm text-red-900 text-center">Does not comply with the minimum standard deviation rule.</p>
          </div>
          <div id="toolboxnotice-stddevexceedwarning" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-yellow-400">
            <p class="text-sm text-red-900 text-center">Does not comply with the maximum standard deviation rule.</p>
          </div>
          <div id="toolboxnotice-savesuccess" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-green-700">
            <p class="text-sm text-white text-center">Saving data success.</p>
          </div>
          <hr/>
          <div class="hidden">
            <label class="text-xs align-middle"><input type="checkbox" id="contiguousdetectoractivate" name="contiguousdetectoractivate"/>&nbsp;Enable / Disable Contiguity Detection</label>
          </div>
          <hr/>
          <div class="">
            <label class="text-xs align-middle"><input type="checkbox" id="showhidedistrictlabelinmap" name="showhidedistrictlabelinmap" checked="true"/>&nbsp;Show / Hide District Label in Map</label>
          </div>
          <hr/>
          <button id="showelectoraldistricttableresume" class="button-show-resume-table-disabled" disabled="true">Show/Hide Table</button>
          <hr/>
          <button id="refreshtoolbox" class="w-full my-2 p-1 text-sm bg-blue-900 text-white">Cancel / Reset</button>
          <hr/>
          <button id="purgetoolbox" class="w-full my-2 p-1 text-sm bg-red-700 text-white">Purge Data</button>
        </div>
      </div>`;
    super({
      element: element,
      target: options.target,
    });
  }
}

export class RedistrictingToolboxStacked extends Control {
  constructor(opt_options) {
    const options = opt_options || {};
    const element = document.createElement('div');
    element.classList.add('relative');
    element.style.pointerEvents = 'none';
    element.id = 'redistrictingtoolboxidx';
    element.innerHTML = `<div id="toolbox" class='absolute mt-4 mr-2 h-full pointer-events-none right-0 top-10'>
        <input type="hidden" id="quotacounterinit" class="quotacounter" value="0"/>
        <input type="hidden" id="currentquotacounter" class="quotacounter" value="0"/>
        <input type="hidden" id="roundedseatallocation" class="quotacounter" value="0"/>
        <input type="hidden" id="roundedremainder" class="quotacounter" value="0"/>
        <input type="hidden" id="districtminimumseatallocation" class="quotacounter" value="0"/>
        <input type="hidden" id="districtmaximumseatallocation" class="quotacounter" value="0"/>
        <input type="hidden" id="stddevstatus" class="quotacounter" value="0"/>
        <input type="hidden" id="stddevignore" class="quotacounter" value="0"/>
        <input type="hidden" id="stddev" class="quotacounter" value="0"/>
        <input type="hidden" id="stddevpass" value="-"/>
        <input type="hidden" id="fillredchannel" value="178"/>
        <input type="hidden" id="fillgreenchannel" value="24"/>
        <input type="hidden" id="fillbluechannel" value="43"/>
        <input type="hidden" id="fillalphachannel" value="1"/>
        <input type="hidden" id="strokeredchannel" value="0"/>
        <input type="hidden" id="strokegreenchannel" value="0"/>
        <input type="hidden" id="strokebluechannel" value="0"/>
        <input type="hidden" id="strokealphachannel" value="1"/>
        <input type="hidden" id="strokewidthvalue" value="1"/>
        <input type="hidden" id="contiguousdetector" value="0"/>
        <div class="flex flex-col gap-0 bg-white p-2 pointer-events-auto custom-width-272px">
          <div class="custom-width-248px">
            <table class="text-sm w-full border border-b-0 border-blue-900">
              <thead>
                <tr>
                  <th colspan="2" class="text-center border border-blue-900">Electoral Redistricting Toolbox</th>
                </tr>
                <tr>
                  <th class="text-center border border-blue-900 w-40">Admin. Unit</th><th class="text-center border border-blue-900">Quota</th>
                </tr>
              </thead>
            </table>
          </div>
          <div class="w-full">
            <div class="flex flex-col gap-0">
              <div class="toolbox-dynamic-table-container w-full">
                <table id="areatoprocess" class="text-sm w-full border border-r border-l border-t-0 border-b-0 border-blue-900">
                  <tbody></tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="custom-width-248px">
            <table class="text-sm w-full border border-blue-900">
              <tfoot>
                <tr>
                  <th class="text-right border border-blue-900 w-40 pr-1">Quota</th><th id="quotaCounterCell" class="text-right border border-blue-900 pr-1"></th>
                </tr>
                <tr>
                  <th class="text-right border border-blue-900 w-40 pr-1">Seat Allocation</th><th id="seatallocation" class="text-right border border-blue-900 pr-1"></th>
                </tr>
                <tr class="hidden">
                  <th class="text-right border border-blue-900 w-40 pr-1">Standard Deviation</th><th id="cellStdDev" class="text-right border border-blue-900 pr-1"></th>
                </tr>
              </tfoot>
            </table>
          </div>
          <!-- <button id="recalculatequota" class="w-full my-1 p-1 text-sm bg-blue-900 text-white">Recalculate Quota</button> -->
          <div class="flex flex-col mt-2">
            <label class="text-xs">Save Electoral District Name as...</label>
            <input id="electoraldistrictname" name="electoraldistrictname" type="text" class="text-sm px-2 py-1 border border-gray-900"/>
          </div>
          <div class="flex flex-col mt-2">
            <div><span class="text-xs">Set Electoral District Colour</span></div>
            <div class="flex flex-col">
              <div class="flex flex-row justify-between items-center gap-1">
                <div class="">
                  <button id="colourpicker" class="flex items-center h-5 w-5 border border-gray-800 bg-gray-200 shadow">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </button>
                </div>
                <div id="colourpallete" class="w-full h-6 colourpallete-initial"></div>
              </div>
              <div></div>
            </div>
          </div>
          <button id="saveelectoraldistrict" class="w-full my-2 p-1 text-sm bg-blue-900 text-white">Save Electoral District</button>
          <div id="toolboxnotice-nodistricttosave" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-red-700">
            <p class="text-sm text-white text-center">No electoral district data to save.</p>
          </div>
          <div id="toolboxnotice-nodistrictname" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-red-700">
            <p class="text-sm text-white text-center">An electoral district name must be set.</p>
          </div>
          <div id="toolboxnotice-minimumwarning" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-red-700">
            <p class="text-sm text-white text-center">Seat allocation doesn't reach the minimum allocation magnitude.</p>
          </div>
          <div id="toolboxnotice-maximumwarning" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-red-700">
            <p class="text-sm text-white text-center">Seat allocation exceeds the maximum allocation magnitude.</p>
          </div>
          <div id="toolboxnotice-stddevunderwarning" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-yellow-400">
            <p class="text-sm text-red-900 text-center">Does not comply with the minimum standard deviation rule.</p>
          </div>
          <div id="toolboxnotice-stddevexceedwarning" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-yellow-400">
            <p class="text-sm text-red-900 text-center">Does not comply with the maximum standard deviation rule.</p>
          </div>
          <div id="toolboxnotice-savesuccess" class="hidden w-full mt-0 mb-1 py-1 px-0.5 align-middle bg-green-700">
            <p class="text-sm text-white text-center">Saving data success.</p>
          </div>
          <hr/>
          <div class="hidden">
            <label class="text-xs align-middle"><input type="checkbox" id="contiguousdetectoractivate" name="contiguousdetectoractivate"/>&nbsp;Enable / Disable Contiguity Detection</label>
          </div>
          <hr/>
          <div class="">
            <label class="text-xs align-middle"><input type="checkbox" id="showhidedistrictlabelinmap" name="showhidedistrictlabelinmap" checked="true"/>&nbsp;Show / Hide District Label in Map</label>
          </div>
          <hr/>
          <button id="showelectoraldistricttableresume" class="button-show-resume-table-disabled" disabled="true">Show/Hide Table</button>
          <hr/>
          <button id="refreshtoolbox" class="w-full my-2 p-1 text-sm bg-blue-900 text-white">Cancel / Reset</button>
          <hr/>
          <button id="purgetoolbox" class="w-full my-2 p-1 text-sm bg-red-700 text-white">Purge Data</button>
        </div>
      </div>`;
    super({
      element: element,
      target: options.target,
    });
  }
}

export class RedistrictingResumeTable extends Control {
  constructor(opt_options) {
    const options = opt_options || {};
    const element = document.createElement('div');
    element.classList.add('relative');
    element.classList.add('hidden');
    element.style.pointerEvents = 'none';
    element.id = 'resumecontainer';
    element.innerHTML = `<div class="resume-table-container">
        <div class="flex flex-col gap-0">
          <div class="w-[454px]">
            <table class="table-fixed border border-blue-900">
              <thead>
                <tr>
                  <th id="onscreentablenomenclature" colspan="8" class="text-sm text-center text-white align-middle border-b border-blue-200 bg-blue-900" style="width: 453px;">Electoral Redistricting Resume</th>
                </tr>
                <tr>
                  <th class="text-xs text-center text-white border-b border-r border-blue-200 bg-blue-900" style="width: 90px;">Electoral District</th>
                  <th class="text-xs text-center text-white border-b border-r border-blue-200 bg-blue-900" style="width: 101px;">Admin. Unit</th>
                  <th class="text-xs text-center text-white border-b border-r border-blue-200 bg-blue-900" style="width: 72px;">Population</th>
                  <th class="text-xs text-center text-white border-b border-r border-blue-200 bg-blue-900" style="width: 43px;">A.U.Q.</th>
                  <th class="text-xs text-center text-white border-b border-r border-blue-200 bg-blue-900" style="width: 42px;">D.Q.</th>
                  <th class="text-xs text-center text-white border-b border-r border-blue-200 bg-blue-900" style="width: 36px;">S.A.</th>
                  <th class="text-xs text-center text-white border-b border-r border-blue-200 bg-blue-900" style="width: 42px;">Rem.</th>
                  <th class="text-xs text-center text-white border-b border-blue-200 bg-blue-900 px-0.5" style="width: 22px;">&nbsp;</th>
                </tr>
              </thead>
            </table>
          </div>
          <div class="custom-exact-width-462px">
            <div class="flex flex-col gap-0">
              <div class="resumetable-dynamic-table-container w-full">
                <table id="resumetable" class="table-fixed border border-blue-900">
                  <tbody></tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="custom-exact-width-454px">
            <table class="table-fixed border border-blue-900">
              <tfoot>
                <tr>
                  <th colspan="2" class="resume-table-tfoot-total" style="width: 87px;">Total</th>
                  <th id="resumetotalpopulation" class="resume-table-tfoot-area-population" style="width: 73px;"></th>
                  <th class="resume-table-tfoot-area-quota" style="width: 44px;"></th>
                  <th class="resume-table-tfoot-district-quota" style="width: 42px;"></th>
                  <th id="resumetotalseats" class="resume-table-tfoot-seat-allocation" style="width: 36px;"></th>
                  <th id="resumetotalremains" class="resume-table-tfoot-quota-remains-plus" style="width: 43px;"></th>
                  <th id="" class="resume-table-tfoot-delete-plus" style="width: 22px;"></th>
                </tr>
                <tr><th colspan="8" class="text-xs">A.U.Q.: Administrative Unit Quota | D.Q.: District Quota | S.A.: Seat Allocation | Rems.: Remainder</th></tr>
              </tfoot>
            </table>
          </div>
          <div class="custom-exact-width-454px mt-2">
            <table class="w-full border border-blue-900">
              <thead>
                <tr>
                  <th colspan="2" class="text-sm text-center text-white align-middle border-b border-blue-200 bg-blue-900">Referential Variables / Indicators</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="indicator-table-tbody-variables">Total Population</td><td id="totalpopulationindicator" class="indicator-table-tbody-values"></td>
                </tr>
                <tr>
                  <td class="indicator-table-tbody-variables">Number of Parliament Seats</td><td id="parliamentseatsindicator" class="indicator-table-tbody-values"></td>
                </tr>
                <tr>
                  <td class="indicator-table-tbody-variables">Quota Divider Number</td><td id="quotadividerindicator" class="indicator-table-tbody-values"></td>
                </tr>
                <tr>
                  <td class="indicator-table-tbody-variables">Minimum Seat Allocation District Magnitude</td><td id="minimumseatmagnitudeindicator" class="indicator-table-tbody-values"></td>
                </tr>
                <tr>
                  <td class="indicator-table-tbody-variables">Maximum Seat Allocation District Magnitude</td><td id="maximumseatmagnitudeindicator" class="indicator-table-tbody-values"></td>
                </tr>
                <tr>
                  <td class="indicator-table-tbody-variables">Standard Maximum Deviation</td><td id="standarddeviationindicator" class="indicator-table-tbody-values"></td>
                </tr>
                <tr>
                  <td colspan="2" class="indicator-table-tbody-variables text-right">
                    <button role="button" id="export-geojson" class="mx-0.5 p-1 text-sm text-gray-50 bg-blue-900 border border-transparent hover:bg-yellow-700 focus:outline-none focus:bg-yellow-700">Save GeoJSON</button>
                    <button role="button" id="export-table" class="mx-0.5 p-1 text-sm text-gray-50 bg-blue-900 border border-transparent hover:bg-yellow-700 focus:outline-none focus:bg-yellow-700">Save PDF (Table)</button>
                    <button role="button" id="export-map" class="mx-0.5 p-1 text-sm text-gray-50 bg-blue-900 border border-transparent hover:bg-yellow-700 focus:outline-none focus:bg-yellow-700">Save PDF (Map)</button>
                    <button role="button" id="export-pdf" class="ml-0.5 p-1 text-sm text-gray-50 bg-blue-900 border border-transparent hover:bg-yellow-700 focus:outline-none focus:bg-yellow-700">Save PDF (All)</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="hidden">
        <div id="printablediv" class="printable-section">
          <table id="resumetableprinted">
            <thead>
              <tr>
                <th id="printedtablenomenclature" colspan="7">Electoral Redistricting Resume</th>
              </tr>
              <tr>
                <th>Electoral District</th>
                <th>Admin. Unit</th>
                <th>Population</th>
                <th>Admin. Unit Quota</th>
                <th>District Quota</th>
                <th>Seat Allocation</th>
                <th>Rem.</th>
              </tr>
            </thead>
            <tfoot>
              <tr>
                <th colspan="2">Total</th>
                <th id="printedresumetotalpopulation"></th>
                <th></th>
                <th></th>
                <th id="printedresumetotalseats"></th>
                <th id="printedresumetotalremains"></th>
              </tr>
              <tr>
                <td colspan="6">Total Population</td><td id="printedtotalpopulationindicator"></td>
              </tr>
              <tr>
                <td colspan="6">Number of Parliament Seats</td><td id="printedparliamentseatsindicator"></td>
              </tr>
              <tr>
                <td colspan="6">Quota Divider Number</td><td id="printedquotadividerindicator"></td>
              </tr>
              <tr>
                <td colspan="6">Minimum Seat Allocation District Magnitude</td><td id="printedminimumseatmagnitudeindicator"></td>
              </tr>
              <tr>
                <td colspan="6">Maximum Seat Allocation District Magnitude</td><td id="printedmaximumseatmagnitudeindicator"></td>
              </tr>
              <tr>
                <td colspan="6">Standard Maximum Deviation</td><td id="printedstandarddeviationindicator"></td>
              </tr>
            </tfoot>
            <tbody></tbody>
          </table>
        </div>
      </div>`;
    super({
      element: element,
      target: options.target,
    });
  }
}