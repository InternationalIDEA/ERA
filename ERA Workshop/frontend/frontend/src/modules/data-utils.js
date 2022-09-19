import { Grid, h, html } from 'gridjs';
import numeral from 'numeral';

var lib = {};

lib.createUtilityDataTable = function(data){
  let dataObject = data;
  let containerElement = document.getElementById('data_view_body');
  let datatableDOM = `<div id="datagrid" class="p-1 overflow-y-auto"></div>
      <!-- <div id="datatoolspanel" class="flex flex-row justify-end gap-3 mx-3">
        <div>
          <button id="recalculatequota" class="flex justify-between space-x-6 bg-blue-900 hover:text-white focus:ring-blue-900 focus:text-white hover:bg-pink-600 text-white dark:text-gray-200 border px-3 py-2 datatable-action-item">
            <p class="text-base leading-4">Calculate Quota Per-Area</p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
        </div>
      </div>
      <div id="popup-micro" class="hidden z-50 fixed w-full flex justify-center inset-0"></div> -->`;
  containerElement.insertAdjacentHTML('afterbegin', datatableDOM);
  let gridData = [];
  let featuresData = dataObject.features;
  featuresData.forEach(function(feature){
    gridData.push(feature);
  });
  if(dataObject.xareaname_attribute == 1){
    if(dataObject.xpopulation_attribute == 1){
      if(dataObject.xparliamentseats_attribute == 1){
        if(dataObject.xredistricted_attribute == 1){
          new Grid({
            columns: [
              {id:'xfid', name: 'Area ID'}, 
              {id:'xareaname', name: 'Area Name', formatter: (cell) => html(`<b>${cell}</b>`)},
              {id:'xarea_population', name: 'Population', formatter: (cell) => html(`<div class="h-full text-right">${numeral(cell).format('0,0')}</div>`)},
              {id:'xcalc_sq', name: 'Quota', formatter: (cell) => html(`<div class="h-full text-right">${cell}</div>`)},
              {id:'electoral_district', name: 'Electoral District', formatter: (cell) => html(`<b>${cell}</b>`)},
            ],
            sort: true, 
            pagination: {limit: 5}, 
            data: gridData
          }).render(document.getElementById('datagrid'));
        } else {
          new Grid({
            columns: [
              {id:'xfid', name: 'Area ID'}, 
              {id:'xareaname', name: 'Area Name', formatter: (cell) => html(`<b>${cell}</b>`)},
              {id:'xarea_population', name: 'Population', formatter: (cell) => html(`<div class="h-full text-right">${numeral(cell).format('0,0')}</div>`)},
              {id:'xcalc_sq', name: 'Quota', formatter: (cell) => html(`<div class="h-full text-right">${cell}</div>`)},
            ],
            sort: true, 
            pagination: {limit: 5}, 
            data: gridData
          }).render(document.getElementById('datagrid'));
        }
      } else {
        new Grid({
          columns: [
            {id:'xfid', name: 'Area ID'}, 
            {id:'xareaname', name: 'Area Name', formatter: (cell) => html(`<b>${cell}</b>`)},
            {id:'xarea_population', name: 'Population', formatter: (cell) => html(`<div class="h-full text-right">${numeral(cell).format('0,0')}</div>`)},
          ],
          sort: true, 
          pagination: {limit: 5}, 
          data: gridData
        }).render(document.getElementById('datagrid'));
      }
    } else {
      new Grid({
        columns: [
          {id:'xfid', name: 'Area ID'}, 
          {id:'xareaname', name: 'Area Name', formatter: (cell) => html(`<b>${cell}</b>`)},
        ],
        sort: true, 
        pagination: {limit: 5}, 
        data: gridData
      }).render(document.getElementById('datagrid'));
    }
  } else {
    new Grid({
      columns: [
        {id:'xfid', name: 'Area ID'}, 
      ],
      sort: true, 
      pagination: {limit: 5}, 
      data: gridData
    }).render(document.getElementById('datagrid'));
  }
};

lib.createPostDataModificationTable = function(data){
  let dataObject = data;
  let containerElement = document.getElementById('data_view_body');
  let datatableDOM = `<div id="datagrid" class="p-1 overflow-y-auto"></div>
      <!-- <div id="datatoolspanel" class="flex flex-row justify-end gap-3 mx-3">
        <div>
          <button id="recalculatequota" class="flex justify-between space-x-6 bg-blue-900 hover:text-white focus:ring-blue-900 focus:text-white hover:bg-pink-600 text-white dark:text-gray-200 border px-3 py-2 datatable-action-item">
            <p class="text-base leading-4">Calculate Quota Per-Area</p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
        </div>
      </div>
      <div id="popup-micro" class="hidden z-50 fixed w-full flex justify-center inset-0"></div> -->`;
  containerElement.insertAdjacentHTML('afterbegin', datatableDOM);
  let gridData = [];
  let featuresData = dataObject.features;
  featuresData.forEach(function(feature){
    gridData.push(feature.properties);
  });
  if(dataObject.xareaname_attribute == 1){
    if(dataObject.xpopulation_attribute == 1){
      if(dataObject.xparliamentseats_attribute == 1){
        new Grid({
          columns: [
            {id:'xfid', name: 'Area ID'}, 
            {id:'xareaname', name: 'Area Name', formatter: (cell) => html(`<b>${cell}</b>`)},
            {id:'xarea_population', name: 'Population', formatter: (cell) => html(`<div class="h-full text-right">${numeral(cell).format('0,0')}</div>`)},
            {id:'xcalc_sq', name: 'Quota', formatter: (cell) => html(`<div class="h-full text-right">${cell}</div>`)},
          ],
          sort: true, 
          pagination: {limit: 5}, 
          data: gridData
        }).render(document.getElementById('datagrid'));
      } else {
        new Grid({
          columns: [
            {id:'xfid', name: 'Area ID'}, 
            {id:'xareaname', name: 'Area Name', formatter: (cell) => html(`<b>${cell}</b>`)},
            {id:'xarea_population', name: 'Population', formatter: (cell) => html(`<div class="h-full text-right">${numeral(cell).format('0,0')}</div>`)},
          ],
          sort: true, 
          pagination: {limit: 5}, 
          data: gridData
        }).render(document.getElementById('datagrid'));
      }
    } else {
      new Grid({
        columns: [
          {id:'xfid', name: 'Area ID'}, 
          {id:'xareaname', name: 'Area Name', formatter: (cell) => html(`<b>${cell}</b>`)},
        ],
        sort: true, 
        pagination: {limit: 5}, 
        data: gridData
      }).render(document.getElementById('datagrid'));
    }
  } else {
    new Grid({
      columns: [
        {id:'xfid', name: 'Area ID'}, 
      ],
      sort: true, 
      pagination: {limit: 5}, 
      data: gridData
    }).render(document.getElementById('datagrid'));
  }
};

lib.create_main_file_datatable = function(workspaceId){
  let xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  xhr.onload = function(){
    let geojsonObject = xhr.response;
    document.getElementById('data_view_body').innerHTML = `<div id="datagrid" class="p-1 overflow-y-auto"></div><div id="datatoolspanel"></div><div id="popup-micro" class="hidden z-50 fixed w-full flex justify-center inset-0"></div>`;
    let gridData = [];
    let featuresData = geojsonObject.features;
    /* build table data */
    featuresData.forEach(function(feature){
      gridData.push(feature.properties);
    });
    new Grid({
      columns: [
        {id:'xfid', name: 'Area ID'}, 
        {id:'xareaname', name: 'Area Name', formatter: (cell) => html(`<b>${cell}</b>`)},
        {id:'xarea_population', name: 'Population', formatter: (cell) => html(`<div class="h-full text-right">${cell}</div>`)},
        {id:'xcalc_sq', name: 'Quota', formatter: (cell) => html(`<div class="h-full text-right">${cell}</div>`)},
        /* {id:'seats', name: 'Seat Allocation', formatter: (cell) => html(`<div class="h-full text-right">${cell}</div>`), hidden:true},
        {id:'district', name: 'Electoral District', formatter: (cell) => html(`<div class="h-full">${cell}</div>`), hidden:true},
        {id:'feature_notes', name: 'Label???', hidden: true},
        { 
          name: 'Actions',
          formatter: (cell, row) => {
            return h('button', {
              className: 'py-1 px-4 border text-sm text-gray-200 bg-blue-900',
              onClick: () => lib.edit_feature_attribute_value(row.cells[0].data, row.cells[1].data, row.cells[2].data, row.cells[3].data)
            }, 'Edit');
          }
        },*/
      ],
      sort: true, 
      pagination: {limit: 5}, 
      data: gridData
    }).render(document.getElementById('datagrid'));
  };
  xhr.open('GET', './data/files/'+ workspaceId +'.json');
  xhr.send();
};

lib.create_datatable = function(workspaceId){
  let xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  xhr.onload = function(){
    let geojsonObject = xhr.response;
    document.getElementById('data_view_body').innerHTML = `<div id="datagrid" class="p-1 full-w-reduced-height overflow-y-auto"></div><div id="popup-micro" class="hidden z-50 fixed w-full flex justify-center inset-0"></div>`;
    let gridData = [];
    let featuresData = geojsonObject.features;
    featuresData.forEach(function(feature){
      gridData.push(feature.properties);
    });
    new Grid({
      columns: [
        {id:'area_id', name: 'Area ID'}, 
        {id:'area_name', name: 'Area Name', formatter: (cell) => html(`<b>${cell}</b>`)},
        {id:'population', name: 'Population', formatter: (cell) => html(`<div class="h-full text-right">${cell}</div>`)},
        {id:'area_quota', name: 'Quota', formatter: (cell) => html(`<div class="h-full text-right">${cell}</div>`)},
        {id:'seats', name: 'Seat Allocation', formatter: (cell) => html(`<div class="h-full text-right">${cell}</div>`), hidden:true},
        {id:'district', name: 'Electoral District', formatter: (cell) => html(`<div class="h-full">${cell}</div>`)},
        {id:'feature_notes', name: 'Label???', hidden: true},
        { 
          name: 'Actions',
          formatter: (cell, row) => {
            return h('button', {
              className: 'py-1 px-4 border text-sm text-gray-200 bg-blue-900',
              onClick: () => lib.edit_feature_attribute_value(row.cells[0].data, row.cells[1].data, row.cells[2].data, row.cells[3].data, row.cells[4].data, row.cells[5].data, row.cells[6].data, row.cells[7].data)
            }, 'Edit');
          }
        },
      ],
      sort: true, 
      pagination: {limit: 5}, 
      data: gridData
    }).render(document.getElementById('datagrid'));
  };
  xhr.open('GET', './data/files/'+ workspaceId +'.json');
  xhr.send();
};

lib.edit_feature_attribute_value = function(fId, field1, field2, field3){
  let popupDiv = document.getElementById('popup-micro');
  let popupDOM = `<div id="popup-content" class="w-full h-full bg-gray-900 z-0 absolute inset-0"></div>
      <div class="mx-auto container">
          <div class="flex items-center justify-center h-full w-full">
              <div class="bg-white rounded-md shadow fixed overflow-y-auto sm:h-auto w-10/12 md:w-8/12 lg:w-1/2 2xl:w-2/5">
                <div class="bg-gray-100 rounded-tl-md rounded-tr-md px-4 md:px-8 md:py-4 py-7 flex items-center justify-between">
                  <p class="text-base font-semibold">Edit Properties</p>
                  <button role="button" aria-label="close label" class="focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 focus:outline-none popup-closer">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 7L7 21" stroke="#A1A1AA" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>
                      <path d="M7 7L21 21" stroke="#A1A1AA" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                  </button>
                </div>
                <div class="px-4 md:px-10 pt-6 md:pb-4 pb-7">
                  <form id="editpropertiesform" name="editpropertiesform" class="mt-0">
                    <div class="flex items-center">
                      <input placeholder="Population" id="population" name="population" type="number" min="0" value="${field1}" class="focus:ring-2 focus:ring-gray-400 w-full focus:outline-none placeholder-gray-500 py-3 px-3 text-sm leading-none text-gray-800 bg-white border rounded border-gray-200" />
                    </div>
                  </form>
                  <div class="flex items-center justify-between mt-9">
                    <button role="button" aria-label="close button" class="focus:ring-2 focus:ring-offset-2 focus:bg-gray-600 focus:ring-gray-600 focus:outline-none px-6 py-3 bg-gray-600 hover:bg-gray-500 shadow rounded text-sm text-white popup-closer">Cancel</button>
                    <button aria-label="add user" role="button" class="focus:ring-2 focus:ring-offset-2 focus:ring-indigo-800 focus:outline-none px-6 py-3 bg-indigo-700 hover:bg-opacity-80 shadow rounded text-sm text-white">Update Data</button>
                  </div>
                </div>
              </div>
          </div>
      </div>
    </div>`;
    popupDiv.innerHTML = popupDOM;
    popupDiv.classList.remove('hidden');
    lib.popup_closer();
};

lib.popup_closer = function(){
  document.querySelectorAll('.popup-closer').forEach(function(elm){
    elm.addEventListener('click', function(evt){
      evt.preventDefault();
      let popupDiv = document.getElementById('popup-micro');
      let popupContent = document.getElementById('popup-content');
      popupDiv.classList.add('hidden');
      popupContent.remove();
    });
  });
};

export default lib;