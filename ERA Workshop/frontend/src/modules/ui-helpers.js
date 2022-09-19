import CryptoJS from 'crypto-js';

import cnfgutils from './config-utils';
import datautils from './data-utils';
import webmap from './webmap';
import Papa from 'papaparse';

var lib = {};

lib.start_project_ui = function(){
  let domObj = `<div class="flex flex-col items-center justify-center"><div class="bg-white dark:bg-gray-900 lg:w-1/3 md:w-1/2 w-full p-8 mt-4 border border-blue-900 dark:border-blue-300"><div class="flex justify-start"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-current text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg><p class="focus:outline-none text-lg font-bold ml-1 leading-6 text-gray-800 dark:text-gray-200">Projects</p></div><form id="createprojectform" name="createprojectform"><div><input type="hidden" id="codex" name="codex" value=""/><label id="labelproject" class="mt-3 mb-2 text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Create a new project</label><input aria-labelledby="labelproject" type="text" id="projectname" name="projectname" class="focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 bg-gray-200 dark:bg-gray-600 border text-md font-sans font-semibold leading-none text-gray-800 dark:text-gray-200 py-3 w-full pl-3 mt-2"/></div><div class="mt-4"><button type="submit" id="btncreateproject" class="focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 text-sm font-semibold leading-none text-white focus:outline-none bg-blue-900 border hover:bg-pink-600 py-4 w-full">Create my project</button></div></form><div class="w-full flex items-center justify-between py-5"><hr class="w-full bg-gray-600"><p class="text-base font-medium leading-4 px-2.5 text-gray-600 dark:text-gray-400">OR</p><hr class="w-full bg-gray-600"></div><div><p class="mb-4 focus:outline-none text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Directly access the existing projects</p><div id="projectlist" class="w-full h-40 overflow-auto bg-gray-200 dark:bg-gray-600"></div></div></div></div>`;
  return domObj;
};

lib.start_connect_ui = function(){
  let domObj = `<div class="flex flex-col items-center justify-center"><div class="bg-white dark:bg-gray-900 lg:w-1/3 md:w-1/2 w-full p-8 mt-4 border border-blue-900 dark:border-blue-300"><div class="flex justify-start"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-current text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p class="focus:outline-none text-lg font-bold ml-1 leading-6 text-gray-800 dark:text-gray-200">Connect</p></div><div><form id="connectform" name="connectform"><input type="hidden" id="codex" name="codex" value=""/><label id="labelusername" class="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Connect to main server</label><input aria-labelledby="labelusername" type="text" id="cusername" name="cusername" class="focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 bg-gray-200 dark:bg-gray-600 border text-md font-sans font-semibold leading-none text-gray-800 dark:text-gray-200 py-3 w-full pl-3 mt-2" placeholder="Username"/><input type="password" id="cpassword" name="cpassword" class="focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 bg-gray-200 dark:bg-gray-600 border text-md font-sans font-semibold leading-none text-gray-800 dark:text-gray-200 py-3 w-full pl-3 mt-3" placeholder="Password"/></form></div><div class="mt-3"><button role="button" id="btnconnectnow" class="focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 text-sm font-semibold leading-none text-white focus:outline-none bg-blue-900 border hover:bg-pink-600 py-4 w-full">Connect</button></div></div></div>`;
  return domObj;
};

lib.start_project_form_action = function(){
  let projectForm = document.getElementById('createprojectform');
  projectForm.addEventListener('submit', function(evt){
    evt.preventDefault();
    let projectname = document.getElementById('projectname').value;
    if(projectname.length > 0){
      let reqPayload = JSON.stringify({"project_name":projectname});
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.onload = function(){
        let resObj = xhr.response;
        let prjData = resObj.data;
        let content = ``;
        prjData.forEach(function(item){
          content += `<button id="${item.codex}|${item.project_name}|${item.mainfile}" class="flex justify-between space-x-6 hover:text-white focus:bg-pink-600 focus:text-white hover:bg-pink-600 text-gray-800 dark:text-gray-200 px-3 py-2 w-full project-list-item">
            <p class="text-base leading-4">`+ item.project_name +`</p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>`;
        });
        setTimeout(function(){
          document.getElementById('projectname').value = "";
          document.getElementById('projectlist').innerHTML = content;
          document.querySelectorAll('.project-list-item').forEach(function(elm){
            elm.addEventListener('click', function(evt){
              evt.preventDefault();
              let projectId = this.getAttribute('id');
              document.getElementById('app_main_body').innerHTML = "";
              lib.open_project_ui(projectId);
            });
          });
        }, 100);
      };
      xhr.open('POST', 'http://localhost:7447/createProject');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(reqPayload);
    } else {
      return;
    }
  });
};

lib.start_connect_form_action = function(){
  /* todo later */
};

lib.start_project_actions = function(){
  let xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  xhr.onload = function(){
    let resObj = xhr.response;
    let prjData = resObj.data;
    let content = ``;
    prjData.forEach(function(item){
      content += `<button role="button" id="${item.codex}|${item.project_name}|${item.mainfile}" class="flex justify-between space-x-6 hover:text-white focus:bg-pink-600 focus:text-white hover:bg-pink-600 text-gray-800 dark:text-gray-200 px-3 py-2 w-full project-list-item">
        <p class="text-base leading-4">`+ item.project_name +`</p>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>`;
    });
    setTimeout(function(){
      document.getElementById('projectlist').innerHTML = content;
      document.querySelectorAll('.project-list-item').forEach(function(elm){
        elm.addEventListener('click', function(evt){
          evt.preventDefault();
          let projectId = this.getAttribute('id');
          document.getElementById('app_main_body').innerHTML = "";
          lib.open_project_ui(projectId);
        });
      });
    }, 100);
    lib.start_project_form_action();
  };
  xhr.open('GET', 'http://localhost:7447/listProjects');
  xhr.send();
};

lib.open_project_ui = function(projectid){
  let arrId = projectid.split('|');
  let domObj = `<div class="flex flex-row justify-between dark:bg-gray-800 bg-gray-200"><div class="w-72 flex flex-col justify-between reduced-height-64 border-r border-gray-600"><div class="p-4 border-b border-gray-700"><input type="hidden" id="view_project_codex" value="${arrId[0]}"/><input type="hidden" id="project_name_reference" value="${arrId[1]}"/><input type="hidden" id="view_mainfile_codex" value="${arrId[2]}"/><div class="flex justify-start items-center w-full space-x-1 focus:outline-none dark:text-white focus:text-indigo-400"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg><p class="flex text-base leading-4 text-gray-800 dark:text-white">${arrId[1]}</p></div></div>
    <div class="mb-auto">
      <div class="flex flex-col">
        <div class="px-2 py-2 border-b border-gray-700">
          <button id="loadnewshapefile" class="flex justify-between space-x-6 bg-blue-900 hover:text-white focus:ring-blue-900 focus:text-white hover:bg-pink-600 text-white dark:text-gray-200 border px-3 py-2 w-full project-workspace-action-item">
            <p class="text-base leading-4">Load Shapefile</p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
        </div>
        <div class="px-2 py-2 border-b border-gray-700">
          <button id="addpopulationdata" class="flex justify-between space-x-6 bg-blue-900 hover:text-white focus:ring-blue-900 focus:text-white hover:bg-pink-600 text-white dark:text-gray-200 border px-3 py-2 w-full project-workspace-action-item">
            <p class="text-base leading-4">Population Data</p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
        </div>
        <div class="px-2 py-2 border-b border-gray-700">
          <button id="addparliamentquota" class="flex justify-between space-x-6 bg-blue-900 hover:text-white focus:ring-blue-900 focus:text-white hover:bg-pink-600 text-white dark:text-gray-200 border px-3 py-2 w-full project-workspace-action-item">
            <p class="text-base leading-4">Parliament Seats</p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        <div class="px-2 py-2 border-b border-gray-700">
          <button id="addstandarddeviation" class="flex justify-between space-x-6 bg-blue-900 hover:text-white focus:ring-blue-900 focus:text-white hover:bg-pink-600 text-white dark:text-gray-200 border px-3 py-2 w-full project-workspace-action-item">
            <p class="text-base leading-4">Standard Deviation</p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        <div class="px-2 py-2 border-b border-gray-700">
          <button id="addoverlays" class="flex justify-between space-x-6 bg-blue-900 hover:text-white focus:ring-blue-900 focus:text-white hover:bg-pink-600 text-white dark:text-gray-200 border px-3 py-2 w-full project-workspace-action-item">
            <p class="text-base leading-4">Map Overlays</p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
        </div>
        <div class="px-2 py-2 border-b border-gray-700">
          <button id="showdatatable" class="flex justify-between space-x-6 bg-blue-900 hover:text-white focus:ring-blue-900 focus:text-white hover:bg-pink-600 text-white dark:text-gray-200 border px-3 py-2 w-full project-workspace-action-item">
            <p class="text-base leading-4">Data</p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
        <div class="px-2 py-2 border-b border-gray-700">
          <button id="showmap" class="flex justify-between space-x-6 bg-blue-900 hover:text-white focus:ring-blue-900 focus:text-white hover:bg-pink-600 text-white dark:text-gray-200 border px-3 py-2 w-full project-workspace-action-item">
            <p class="text-base leading-4">Map</p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
        </div>
        <div id="workspacelist" class="hidden flex flex-col p-0"></div></div></div><div class=""><div class="w-full px-4 border-t border-gray-700"><ul class="flex justify-between"><li class="cursor-pointer pt-3 pb-3 text-gray-500 dark:text-gray-200"><button id="projectsettings" aria-label="open settings" class="focus:outline-none focus:ring-2 rounded focus:ring-gray-300 project-workspace-action-item"><svg xmlns="http://www.w3.org/2000/svg" class="hidden h-4 w-4 stroke-current text-gray-500 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button></li><li class="cursor-pointer pt-3 pb-3 text-gray-500 dark:text-gray-200"><button id="projectremove" aria-label="remove project" class="flex flex-row justify-start bg-red-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-700 p-1.5 project-workspace-action-item"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 stroke-current text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Delete Project</button></li></ul></div></div></div><div id="data_view_body" class="w-full bg-gray-300 dark:bg-gray-700"></div></div>`;
  document.getElementById('app_main_body').innerHTML = domObj;
  document.querySelectorAll('.project-workspace-action-item').forEach(function(elm){
    elm.addEventListener('click', function(evt){
      evt.preventDefault();
      let cmdId = this.getAttribute('id');
      let projectMainCodex = document.getElementById('view_project_codex').value;
      document.getElementById('data_view_body').innerHTML = "";
      if(cmdId == 'loadnewshapefile'){
        let prjMainFile = document.getElementById('view_mainfile_codex').value;
        if(prjMainFile == '-'){
          let xhrcodex = new XMLHttpRequest();
          let formDataCodex = new FormData();
          formDataCodex.append('project_codex', projectMainCodex);
          xhrcodex.responseType = 'json';
          xhrcodex.open('POST', 'http://localhost:7447/workspaceCodex');
          xhrcodex.onreadystatechange = function () {
            if(xhrcodex.readyState === XMLHttpRequest.DONE) {
              var status = xhrcodex.status;
              if (status === 0 || (status >= 200 && status < 400)) {
                let resCodex = xhrcodex.response;
                if(resCodex.code == 200 && resCodex.message == 'success'){
                  let wxCodex = resCodex.data.codex;
                  let wizardUploadShapefileDOM = `<div class="flex flex-col items-center justify-center">
                      <div class="bg-white dark:bg-gray-900 w-1/2 p-8 mt-4 border border-blue-900 dark:border-blue-300">
                        <div class="flex justify-start">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-current text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <p class="focus:outline-none text-lg font-bold ml-1 leading-6 text-gray-800 dark:text-gray-200">Step 1 - Upload Shapefile</p>
                        </div>
                        <form id="uploadshapefileform" name="uploadshapefileform">
                          <input type="hidden" id="project_codex" name="project_codex" value="${projectMainCodex}"/>
                          <input type="hidden" id="workspace_name" name="workspace_name" value="${wxCodex}"/>
                          <input type="hidden" id="uploadedfilecodex" name="uploadedfilecodex" value=""/>
                          <input type="hidden" id="samplepopulationdata" name="samplepopulationdata" value="-"/>
                          <div class="text-sm font-normal text-justify pt-3 text-gray-800 dark:text-gray-200">
                            <p>Please upload a compressed (*.zip) shapefile that contains *.shp, *.shx, *.dbf, and *.prj files. Technical specifications of the shapefile are:</p>
                            <ul class="list-disc pl-6">
                              <li>Contains <strong>area name</strong> data (mandatory).</li>
                              <li>Coordinate Reference System (CRS): EPSG:4326 (WGS84)</li>
                              <li>Geometry format: POLYGON.</li>
                            </ul>
                          </div>
                          <div id="microformwizard">
                            <div class="flex flex-col justify-between pt-3">
                              <label id="labelshapefile" class="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Select a *.zip compressed shapefile</label>
                              <input aria-labelledby="labelshapefile" type="file" id="filetoupload" name="filetoupload" class="mt-3 text-gray-600 dark:text-gray-200"/>
                            </div>
                            <div class="flex flex-row justify-end mt-8">
                              <button role="button" id="loadshapefilestep1" class="focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 text-sm font-semibold leading-none text-white focus:outline-none bg-blue-900 border hover:bg-pink-600 py-4 px-4">Next</button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                    <span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center"></span>`;
                  document.getElementById('data_view_body').innerHTML = wizardUploadShapefileDOM;
                  lib.uploadShapefileFirstStep();
                }
              }
            }
          };
          xhrcodex.send(formDataCodex);
        } else {
          let noticeDOM = `<span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center w-full"><div class="flex items-center justify-center px-4 w-full"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left"><strong>Application's Restriction:</strong> You already have a main project file.</p></div></div></div></span>`;
          document.getElementById('data_view_body').innerHTML = noticeDOM;
          setTimeout(function(){
            document.getElementById('data_view_body').innerHTML = "";
          }, 5000);
        }
      } else if(cmdId == 'addpopulationdata'){
        let prjMainFile = document.getElementById('view_mainfile_codex').value;
        if(prjMainFile != '-'){
          let reqPayload = JSON.stringify({"mainfile":prjMainFile});
          let xhr = new XMLHttpRequest();
          xhr.responseType = 'json';
          xhr.onload = function(){
            let resObj = xhr.response;
            if(resObj.code == 200 && resObj.message == 'success'){
              let objData = resObj.data;
              let populationDataDOM = `<div class="flex flex-col items-center justify-center">
                  <div class="bg-white dark:bg-gray-900 w-1/2 p-8 mt-4 border border-blue-900 dark:border-blue-300">
                    <div class="flex justify-start">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-current text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <p class="focus:outline-none text-lg font-bold ml-1 leading-6 text-gray-800 dark:text-gray-200">Step 2 - Attach / Merge Population Data</p>
                    </div>
                    <form id="uploadpopulationdataform" name="uploadpopulationdataform">
                      <input type="hidden" id="project_codex" name="project_codex" value="${projectMainCodex}"/>
                      <input type="hidden" id="filecontentsraw" name="filecontentsraw" value=""/>
                      <input type="hidden" id="reservedfieldsarray" name="reservedfieldsarray" value=""/>
                      <input type="hidden" id="formedarrayfirststep" name="formedarrayfirststep" value=""/>
                      <input type="hidden" id="formedarraysecondstep" name="formedarraysecondstep" value=""/>
                      <input type="hidden" id="areanamefield" name="areanamefield" value=""/>
                      <input type="hidden" id="populationfield" name="populationfield" value=""/>
                      <input type="hidden" id="setpopulationstring" name="setpopulationstring" value=""/>
                      <div class="text-sm font-normal text-justify pt-3 text-gray-800 dark:text-gray-200">
                        <p>You can upload a *.csv file that contains <strong>area name</strong> and <strong>population data</strong> to complete the data to be processed. Please notice that the first line in your *.csv file will be treated as a header row.</p>
                      </div>
                      <div id="microformwizard">
                        <div class="flex flex-col justify-between pt-3">
                          <label id="labeltxtcsvfile" class="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Select a *.csv file containing population data</label>
                          <input aria-labelledby="labeltxtcsvfile" type="file" id="filetoupload" name="filetoupload" class="mt-3 text-gray-600 dark:text-gray-200"/>
                        </div>
                        <div class="flex flex-row justify-end mt-8">
                          <button role="button" id="loadpopulationdatastep1" class="focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 text-sm font-semibold leading-none text-white focus:outline-none bg-blue-900 border hover:bg-pink-600 py-4 px-4">Next</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center"></span>`;
              document.getElementById('data_view_body').innerHTML = populationDataDOM;
              if(objData.xpopulation_attribute == '1'){
                let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">You have population data set before.</p></div></div></div>`;
                document.getElementById('cwxnotice').innerHTML = noticeDOM;
                setTimeout(function(){
                  document.getElementById('cwxnotice').innerHTML = "";
                }, 5000);
              }
              lib.uploadPopulationDataFirstStep();
            } else {
              let noticeDOM = `<span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center w-full"><div class="flex items-center justify-center px-4 w-full"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">There was an internal application error. Please restart the application and start over.</p></div></div></div></span>`;
              document.getElementById('data_view_body').innerHTML = noticeDOM;
              setTimeout(function(){
                document.getElementById('data_view_body').innerHTML = "";
              }, 5000);
            }
          };
          xhr.open('POST', 'http://localhost:7447/fastReadMainFile');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(reqPayload);
        } else {
          let noticeDOM = `<span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center w-full"><div class="flex items-center justify-center px-4 w-full"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left"><strong>Application's Restriction:</strong> You don't have any main project file. Please provide it by uploading shapefile first.</p></div></div></div></span>`;
          document.getElementById('data_view_body').innerHTML = noticeDOM;
          setTimeout(function(){
            document.getElementById('data_view_body').innerHTML = "";
          }, 5000);
        }
      } else if(cmdId == 'addparliamentquota'){
        let prjMainFile = document.getElementById('view_mainfile_codex').value;
        if(prjMainFile != '-'){
          let reqPayload = JSON.stringify({"mainfile":prjMainFile});
          let xhr = new XMLHttpRequest();
          xhr.responseType = 'json';
          xhr.onload = function(){
            let resObj = xhr.response;
            let mainFileData = resObj.data;
            let parliamentSeatsDOM = `<div class="flex flex-col items-center justify-center">
                <div class="bg-white dark:bg-gray-900 w-1/2 p-8 mt-4 border border-blue-900 dark:border-blue-300">
                  <div class="flex justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-current text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="focus:outline-none text-lg font-bold ml-1 leading-6 text-gray-800 dark:text-gray-200">Step 3 - Set Parliament Seats Number</p>
                  </div>
                  <form id="parliamentdataform" name="parliamentdataform">
                    <input type="hidden" id="project_codex" name="codex" value="${mainFileData.codex}"/>
                    <div class="text-sm font-normal text-justify pt-3 text-gray-800 dark:text-gray-200">
                      <p>Please enter the following numbers to complete the configuration process.</p>
                    </div>
                    <div>
                      <label id="labelparliamentseats" class="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Parliament Seats Number</label>
                      <input aria-labelledby="labelparliamentseats" type="text" id="parliamentseats" name="parliamentseats" value="${mainFileData.parliament_seats}" class="focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 bg-gray-200 dark:bg-gray-600 border text-md font-sans font-semibold leading-none text-gray-800 dark:text-gray-200 py-3 w-full px-3 mt-2 text-right"/>
                    </div>
                    <div class="mt-2">
                      <label id="labelminimumseats" class="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Minimum Seat Allocation District Magnitude</label>
                      <input aria-labelledby="labelminimumseats" type="text" id="minimumseats" name="minimumseats" value="${mainFileData.minimum_seats}" class="focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 bg-gray-200 dark:bg-gray-600 border text-md font-sans font-semibold leading-none text-gray-800 dark:text-gray-200 py-3 w-full px-3 mt-2 text-right"/>
                    </div>
                    <div class="mt-2">
                      <label id="labelmaximumseats" class="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Maximum Seat Allocation District Magnitude</label>
                      <input aria-labelledby="labelmaximumseats" type="text" id="maximumseats" name="maximumseats" value="${mainFileData.maximum_seats}" class="focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 bg-gray-200 dark:bg-gray-600 border text-md font-sans font-semibold leading-none text-gray-800 dark:text-gray-200 py-3 w-full px-3 mt-2 text-right"/>
                    </div>
                    <div class="flex flex-row justify-end mt-8">
                      <button role="button" id="updateparliamentseats" class="focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 text-sm font-semibold leading-none text-white focus:outline-none bg-blue-900 border hover:bg-pink-600 py-4 px-4">Save</button>
                    </div>
                  </form>
                </div>
              </div>
              <span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center"></span>`;
            document.getElementById('data_view_body').innerHTML = parliamentSeatsDOM;
            lib.setParliamentSeatsFunction();
          };
          xhr.open('POST', 'http://localhost:7447/fastReadMainFile');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(reqPayload);
        } else {
          let noticeDOM = `<span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center w-full"><div class="flex items-center justify-center px-4 w-full"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left"><strong>Application's Restriction:</strong> You don't have any main project file. Please provide it by uploading shapefile first.</p></div></div></div></span>`;
          document.getElementById('data_view_body').innerHTML = noticeDOM;
          setTimeout(function(){
            document.getElementById('data_view_body').innerHTML = "";
          }, 5000);
        }
      } else if(cmdId == 'addstandarddeviation'){
        let prjMainFile = document.getElementById('view_mainfile_codex').value;
        if(prjMainFile != '-'){
          let reqPayload = JSON.stringify({"mainfile":prjMainFile});
          let xhr = new XMLHttpRequest();
          xhr.responseType = 'json';
          xhr.onload = function(){
            let resObj = xhr.response;
            let mainFileData = resObj.data;
            let stddevvalue = parseInt(parseFloat(mainFileData.stddev) * 100);
            let stdDevDOM = `<div class="flex flex-col items-center justify-center">
                <div class="bg-white dark:bg-gray-900 w-1/2 p-8 mt-4 border border-blue-900 dark:border-blue-300">
                  <div class="flex justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-current text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="focus:outline-none text-lg font-bold ml-1 leading-6 text-gray-800 dark:text-gray-200">Step 4 - Set Standard Deviation</p>
                  </div>
                  <form id="stddevdataform" name="stddevdataform">
                    <input type="hidden" id="project_codex" name="project_codex" value="${projectMainCodex}"/>
                    <input type="hidden" id="workspace_name" name="workspace_name" value=""/>
                    <input type="hidden" id="ignoreflag" name="ignoreflag" value="0"/>
                    <div class="text-sm font-normal text-justify pt-3 text-gray-800 dark:text-gray-200">
                      <p>You can either set a standard deviation value or ignoring it here, as an optional configuration step. You can put the standard deviation starts from 0 to 50.</p>
                    </div>
                    <div>
                      <label id="labelstddev" class="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Standard Deviation</label>
                      <input aria-labelledby="labelstddev" type="number" id="standarddeviation" name="standarddeviation" min="0" max="50" value="${stddevvalue}" class="focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 bg-gray-200 dark:bg-gray-600 border text-md font-sans font-semibold leading-none text-gray-800 dark:text-gray-200 py-3 w-full px-3 mt-2 text-right"/>
                    </div>
                    <div class="flex flex-row justify-start items-center gap-3 mt-1">
                      <input type="checkbox" id="checkignore" name="checkignore" value="1"/>
                      <div class="text-sm">Ignore standard deviation value</div>
                    </div>
                    <div class="flex flex-row justify-end mt-8">
                      <button role="button" id="updatestandarddeviation" class="focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 text-sm font-semibold leading-none text-white focus:outline-none bg-blue-900 border hover:bg-pink-600 py-4 px-4">Save</button>
                    </div>
                  </form>
                </div>
              </div>
              <span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center"></span>`;
            document.getElementById('data_view_body').innerHTML = stdDevDOM;
            let ignoreStdDevCheckbox = document.getElementById('checkignore');
            if(mainFileData.xstddev_ignore == 1){
              document.getElementById('ignoreflag').value = 1;
              if(ignoreStdDevCheckbox.checked == true){
                ignoreStdDevCheckbox.checked = true;
              } else {
                ignoreStdDevCheckbox.checked = true;
              }
            }
            lib.setStandardDeviationFunction();
          };
          xhr.open('POST', 'http://localhost:7447/fastReadMainFile');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(reqPayload);
        } else {
          let noticeDOM = `<span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center w-full"><div class="flex items-center justify-center px-4 w-full"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left"><strong>Application's Restriction:</strong> You don't have any main project file. Please provide it by uploading shapefile first.</p></div></div></div></span>`;
          document.getElementById('data_view_body').innerHTML = noticeDOM;
          setTimeout(function(){
            document.getElementById('data_view_body').innerHTML = "";
          }, 5000);
        }
      } else if(cmdId == 'addoverlays'){
        let prjMainFile = document.getElementById('view_mainfile_codex').value;
        if(prjMainFile != '-'){
          let reqPayload = JSON.stringify({"mainfile":prjMainFile});
          let xhr = new XMLHttpRequest();
          xhr.responseType = 'json';
          xhr.onload = function(){
            let responseObj = xhr.response;
            let loadOverlayDOM = `<div class="flex flex-col items-center justify-center">
                <div class="bg-white dark:bg-gray-900 w-1/2 p-8 mt-4 border border-blue-900 dark:border-blue-300">
                  <div class="flex justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 stroke-current text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p class="focus:outline-none text-lg font-bold ml-1 leading-6 text-gray-800 dark:text-gray-200">Add Map Overlays</p>
                  </div>
                  <form id="uploadoverlayform" name="uploadoverlayform">
                    <input type="hidden" id="project_codex" name="project_codex" value="${responseObj.codex}"/>
                    <input type="hidden" id="uploadedfilecodex" name="uploadedfilecodex" value=""/>
                    <input type="hidden" id="overlaytitlename" name="overlaytitlename" value=""/>
                    <div class="text-sm font-normal text-justify pt-3 text-gray-800 dark:text-gray-200">
                      <p>As the optional map features, you can add overlays such as river, roads, and mountain to your map by uploading a shapefile here, with the same technical specification as the base shapefile previously uploaded.</p>
                      <ul class="list-disc pl-6">
                        <li>A compressed (*.zip) shapefile that contains *.shp, *.shx, *.dbf, and *.prj files.</li>
                        <li>Contains at least a field that will be used as the feature(s) label of the overlay.</li>
                        <li>Coordinate Reference System (CRS): EPSG:4326 (WGS84)</li>
                        <li>Geometry format: POINT, LINE, or POLYGON.</li>
                      </ul>
                    </div>
                    <div id="microformwizard">
                      <div>
                        <label id="labeloverlaytitle" class="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Overlay Title</label>
                        <input aria-labelledby="labeloverlaytitle" type="text" id="overlaytitle" name="overlaytitle" value="" class="focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 bg-gray-200 dark:bg-gray-600 border text-md font-sans font-semibold leading-none text-gray-800 dark:text-gray-200 py-3 w-full px-3 mt-2"/>
                      </div>
                      <div class="flex flex-col justify-between pt-3">
                        <label id="labelshapefile" class="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Select a *.zip compressed shapefile</label>
                        <input aria-labelledby="labelshapefile" type="file" id="filetoupload" name="filetoupload" class="mt-3 text-gray-600 dark:text-gray-200"/>
                      </div>
                      <div class="flex flex-row justify-end mt-8">
                        <button role="button" id="loadoverlayshapefile" class="focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 text-sm font-semibold leading-none text-white focus:outline-none bg-blue-900 border hover:bg-pink-600 py-4 px-4">Load File</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center"></span>`;
            document.getElementById('data_view_body').innerHTML = loadOverlayDOM;
            lib.uploadOverlayFirstStep();
          };
          xhr.open('POST', 'http://localhost:7447/fastReadMainFile');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(reqPayload);
        } else {
          let noticeDOM = `<span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center w-full"><div class="flex items-center justify-center px-4 w-full"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left"><strong>Application's Restriction:</strong> You don't have any main project file. Please provide it by uploading shapefile first.</p></div></div></div></span>`;
          document.getElementById('data_view_body').innerHTML = noticeDOM;
          setTimeout(function(){
            document.getElementById('data_view_body').innerHTML = "";
          }, 5000);
        }
      } else if(cmdId == 'showdatatable'){
        let prjMainFile = document.getElementById('view_mainfile_codex').value;
        if(prjMainFile != '-'){
          let reqPayload = JSON.stringify({"mainfile":prjMainFile});
          let xhr = new XMLHttpRequest();
          xhr.responseType = 'json';
          xhr.onload = function(){
            let resObj = xhr.response; 
            let mainFileData = resObj.data;
            datautils.createUtilityDataTable(mainFileData);
          };
          xhr.open('POST', 'http://localhost:7447/fastReadMainFile');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(reqPayload);
        } else {
          let noticeDOM = `<span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center w-full"><div class="flex items-center justify-center px-4 w-full"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left"><strong>Application's Restriction:</strong> You don't have any main project file. Please provide it by uploading shapefile first.</p></div></div></div></span>`;
          document.getElementById('data_view_body').innerHTML = noticeDOM;
          setTimeout(function(){
            document.getElementById('data_view_body').innerHTML = "";
          }, 5000);
        }
      } else if(cmdId == 'showmap'){
        let prjMainFile = document.getElementById('view_mainfile_codex').value;
        if(prjMainFile != '-'){
          let reqPayload = JSON.stringify({"mainfile":prjMainFile});
          let xhr = new XMLHttpRequest();
          xhr.responseType = 'json';
          xhr.onload = function(){
            let resObj = xhr.response;
            let mainFileData = resObj.data;
            webmap.createUtilityMap(mainFileData);
          };
          xhr.open('POST', 'http://localhost:7447/fastReadMainFile');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(reqPayload);
        } else {
          let noticeDOM = `<span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center w-full"><div class="flex items-center justify-center px-4 w-full"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left"><strong>Application's Restriction:</strong> You don't have any main project file. Please provide it by uploading shapefile first.</p></div></div></div></span>`;
          document.getElementById('data_view_body').innerHTML = noticeDOM;
          setTimeout(function(){
            document.getElementById('data_view_body').innerHTML = "";
          }, 5000);
        }
      /* } else if(cmdId == 'projectsettings'){
        let prjMainFile = document.getElementById('view_mainfile_codex').value;
        if(prjMainFile != '-'){
          let reqPayload = JSON.stringify({"mainfile":prjMainFile});
          let xhr = new XMLHttpRequest();
          xhr.responseType = 'json';
          xhr.onload = function(){
            let resObj = xhr.response;
            let mainFileData = resObj.data;
            
          };
          xhr.open('POST', 'http://localhost:7447/fastReadMainFile');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(reqPayload);
        } else {
          let noticeDOM = `<span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center w-full"><div class="flex items-center justify-center px-4 w-full"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left"><strong>Application's Restriction:</strong> You don't have any main project file. Please provide it by uploading shapefile first.</p></div></div></div></span>`;
          document.getElementById('data_view_body').innerHTML = noticeDOM;
          setTimeout(function(){
            document.getElementById('data_view_body').innerHTML = "";
          }, 5000);
        } */
      } else if(cmdId == 'projectremove'){
        let prjMainCodex = document.getElementById('view_project_codex').value;
        let prjMainFile = document.getElementById('view_mainfile_codex').value;
        if(prjMainFile != '-'){
          if(prjMainCodex == 'a9b7c5d3e1fa'){
            let noticeDOM = `<span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center w-full"><div class="flex items-center justify-center px-4 w-full"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left"><strong>Application's Restriction:</strong> You can not delete the default project.</p></div></div></div></span>`;
            document.getElementById('data_view_body').innerHTML = noticeDOM;
            setTimeout(function(){
              document.getElementById('data_view_body').innerHTML = "";
            }, 5000);
          } else {
            let confirmDelete = confirm('Are you really want to delete this project?');
            if(confirmDelete === true){
              let reqPayload = JSON.stringify({"codex":prjMainCodex,"mainfile":prjMainFile});
              let xhr = new XMLHttpRequest();
              xhr.responseType = 'json';
              xhr.onload = function(){
                let resObj = xhr.response;
                if(resObj.code == 200 && resObj.message == 'success'){
                  document.getElementById('app_main_body').innerHTML = '';
                  document.getElementById('app_main_body').innerHTML = lib.start_project_ui();
                  lib.start_project_actions();
                } else {
                  alert('Delete project failed.');
                }
              };
              xhr.open('POST', 'http://localhost:7447/removeProject');
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.send(reqPayload);
            } else {
              return;
            }
          }
        } else {
          let noticeDOM = `<span id="cwxnotice" class="mt-10 flex flex-col items-center justify-center w-full"><div class="flex items-center justify-center px-4 w-full"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left"><strong>Application's Restriction:</strong> You don't have any main project file. Please provide it by uploading shapefile first.</p></div></div></div></span>`;
          document.getElementById('data_view_body').innerHTML = noticeDOM;
          setTimeout(function(){
            document.getElementById('data_view_body').innerHTML = "";
          }, 5000);
        }
      } else {
        console.log('undefined');
      }
    });
  });
  if(arrId[2] != '-'){
    let initMapMainfile = arrId[2];
    let reqInitMapPayload = JSON.stringify({"mainfile":initMapMainfile});
    let xhrInitMap = new XMLHttpRequest();
    xhrInitMap.responseType = 'json';
    xhrInitMap.onload = function(){
      let resInitMapDataObj = xhrInitMap.response;
      let initMapMainFileData = resInitMapDataObj.data;
      webmap.createUtilityMap(initMapMainFileData);
    };
    xhrInitMap.open('POST', 'http://localhost:7447/fastReadMainFile');
    xhrInitMap.setRequestHeader('Content-Type', 'application/json');
    xhrInitMap.send(reqInitMapPayload);
  }
};

lib.uploadShapefileFirstStep = function(){
  document.getElementById('loadshapefilestep1').addEventListener('click', function(evt){
    evt.preventDefault();
    let projectCodex = document.getElementById('project_codex').value;
    let workspaceName = document.getElementById('workspace_name').value;
    let fileToUpload = document.getElementById('filetoupload');
    if(fileToUpload == '' || fileToUpload.length == 0){
      let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="px-1 text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">A *.zip compressed shapefile are mandatories. Please supply this file to continue the process.</p></div></div></div>`;
      document.getElementById('cwxnotice').innerHTML = noticeDOM;
      setTimeout(function(){
        document.getElementById('cwxnotice').innerHTML = "";
      }, 5000);
    } else {
      let xhrUpload = new XMLHttpRequest();
      let formData = new FormData();
      formData.append('filetoupload', fileToUpload.files[0]);
      formData.append('project_codex', projectCodex);
      formData.append('workspace_name', workspaceName);
      xhrUpload.responseType = 'json';
      xhrUpload.open('POST', 'http://localhost:7447/upload');
      xhrUpload.onreadystatechange = function () {
        if(xhrUpload.readyState === XMLHttpRequest.DONE) {
          var status = xhrUpload.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            let resUploadObj = xhrUpload.response;
            if(resUploadObj.code == 200 && resUploadObj.message == 'success'){
              document.getElementById('microformwizard').innerHTML = '';
              let secondStepDOM = `<div class="flex flex-col justify-between pt-3">
                  <label id="labelareanameselector" class="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Select an attribute from your uploaded shapefile to be <strong>area name</strong>.</label>
                  <select aria-labelledby="labelareanameselector" id="areanameselector" name="areanameselector" class="mt-3 text-gray-800 dark:text-gray-800 py-2 border-gray-600 dark:border-gray-400"></select>
                </div>
                <p class="text-sm my-4 text-gray-800 dark:text-gray-200">Attribute's values:</p>
                <div id="attributeValueList" class="mt-4 w-full h-40 overflow-auto bg-gray-200 dark:bg-gray-600"></div>
                <div class="flex flex-row justify-end mt-8">
                  <button role="button" id="loadshapefilestep2" class="focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 text-sm font-semibold leading-none text-white focus:outline-none bg-blue-900 border hover:bg-pink-600 py-4 px-4">Next</button>
                </div>`;
              document.getElementById('microformwizard').innerHTML = secondStepDOM;
              document.getElementById('uploadedfilecodex').value = resUploadObj.codex;
              document.getElementById('view_mainfile_codex').value = resUploadObj.codex;
              let areaNameSelectorDOM = `<option value="-" class="text-md border-gray-300 text-gray-800 dark:text-gray-800">Select Reserved Attribute</option>`;
              let arrayFeatures = resUploadObj.data.features;
              let featuresArray = resUploadObj.data.features[0];
              let featureProperties = featuresArray.properties;
              let featurePropKeysArray = Object.keys(featureProperties);
              featurePropKeysArray.forEach(function(prop){
                if(prop != 'xfid' && prop != 'fill_red_channel' && prop != 'fill_green_channel' && prop != 'fill_blue_channel' && prop != 'fill_alpha_channel' && prop != 'stroke_red_channel' && prop != 'stroke_green_channel' && prop != 'stroke_blue_channel' && prop != 'stroke_alpha_channel' && prop != 'stroke_width' && prop != 'centroid'){
                  areaNameSelectorDOM += `<option value="${prop}" class="text-md border-gray-300 text-gray-800 dark:text-gray-800">${prop}</option>`;
                }
              });
              document.getElementById('areanameselector').innerHTML = areaNameSelectorDOM;
              lib.uploadShapefileSecondStep(arrayFeatures);
            } else {
              let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">`+ resUploadObj.message +`</p></div></div></div>`;
              document.getElementById('cwxnotice').innerHTML = noticeDOM;
              setTimeout(function(){
                document.getElementById('cwxnotice').innerHTML = "";
              }, 5000);
            }
          } else {
            let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">There was an internal application error. Please restart the application and start over.</p></div></div></div>`;
            document.getElementById('cwxnotice').innerHTML = noticeDOM;
            setTimeout(function(){
              document.getElementById('cwxnotice').innerHTML = "";
            }, 5000);
          }
        }
      };
      xhrUpload.send(formData);
    }
  });
};

lib.uploadOverlayFirstStep = function(){
  document.getElementById('loadoverlayshapefile').addEventListener('click', function(evt){
    evt.preventDefault();
    let projectCodex = document.getElementById('project_codex').value;
    let overlayTitle = document.getElementById('overlaytitle').value;
    let fileToUpload = document.getElementById('filetoupload');
    if(fileToUpload == '' || fileToUpload.length == 0){
      let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="px-1 text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">A *.zip compressed shapefile are mandatories. Please supply this file to continue the process.</p></div></div></div>`;
      document.getElementById('cwxnotice').innerHTML = noticeDOM;
      setTimeout(function(){
        document.getElementById('cwxnotice').innerHTML = "";
      }, 5000);
    } else {
      let xhrUpload = new XMLHttpRequest();
      let formData = new FormData();
      formData.append('filetoupload', fileToUpload.files[0]);
      formData.append('project_codex', projectCodex);
      formData.append('overlay_title', overlayTitle);
      xhrUpload.responseType = 'json';
      xhrUpload.open('POST', 'http://localhost:7447/uploadOverlay');
      xhrUpload.onreadystatechange = function () {
        if(xhrUpload.readyState === XMLHttpRequest.DONE) {
          var status = xhrUpload.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            let resUploadObj = xhrUpload.response;
            if(resUploadObj.code == 200 && resUploadObj.message == 'success'){
              document.getElementById('microformwizard').innerHTML = '';
              let secondStepDOM = `<div class="flex flex-col justify-between pt-3">
                  <label id="labeloverlayselector" class="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Select an attribute from your uploaded shapefile to be <strong>overlay features' label</strong>.</label>
                  <select aria-labelledby="labeloverlayselector" id="overlaylabelselector" name="overlaylabelselector" class="mt-3 text-gray-800 dark:text-gray-800 py-2 border-gray-600 dark:border-gray-400"></select>
                </div>
                <p class="text-sm my-4 text-gray-800 dark:text-gray-200">Attribute's values:</p>
                <div id="attributeValueList" class="mt-4 w-full h-40 overflow-auto bg-gray-200 dark:bg-gray-600"></div>
                <div class="flex flex-row justify-end mt-8">
                  <button role="button" id="loadoverlayfinalise" class="focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 text-sm font-semibold leading-none text-white focus:outline-none bg-blue-900 border hover:bg-pink-600 py-4 px-4">Finish</button>
                </div>`;
              document.getElementById('microformwizard').innerHTML = secondStepDOM;
              document.getElementById('uploadedfilecodex').value = resUploadObj.codex;
              document.getElementById('overlaytitlename').value = resUploadObj.overlay_title;
              document.getElementById('view_mainfile_codex').value = resUploadObj.mainfile;
              let overlayLabelSelectorDOM = `<option value="-" class="text-md border-gray-300 text-gray-800 dark:text-gray-800">Select Reserved Attribute</option>`;
              let arrayFeatures = resUploadObj.data.features;
              let featuresArray = resUploadObj.data.features[0];
              let featureProperties = featuresArray.properties;
              let featurePropKeysArray = Object.keys(featureProperties);
              featurePropKeysArray.forEach(function(prop){
                if(prop != 'ovfid'){
                  overlayLabelSelectorDOM += `<option value="${prop}" class="text-md border-gray-300 text-gray-800 dark:text-gray-800">${prop}</option>`;
                }
              });
              document.getElementById('overlaylabelselector').innerHTML = overlayLabelSelectorDOM;
              lib.uploadOverlayFinalise(arrayFeatures);
            } else {
              let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">`+ resUploadObj.message +`</p></div></div></div>`;
              document.getElementById('cwxnotice').innerHTML = noticeDOM;
              setTimeout(function(){
                document.getElementById('cwxnotice').innerHTML = "";
              }, 5000);
            }
          } else {
            let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">There was an internal application error. Please restart the application and start over.</p></div></div></div>`;
            document.getElementById('cwxnotice').innerHTML = noticeDOM;
            setTimeout(function(){
              document.getElementById('cwxnotice').innerHTML = "";
            }, 5000);
          }
        }
      };
      xhrUpload.send(formData);
    }
  });
};

lib.uploadOverlayFinalise = function(data){
  var dataArray = data;
  const overlayLabelSelectorElm = document.getElementById('overlaylabelselector');
  document.getElementById('overlaylabelselector').addEventListener('change', function(evt){
    evt.preventDefault();
    document.getElementById('attributeValueList').innerHTML = '';
    let dataKey = overlayLabelSelectorElm.value;
    let attrValueListDOM = '';
    if(dataKey != '-'){
      for (const [key, value] of Object.entries(dataArray)) {
        let propertiesArray = value.properties;
        for (const [itemKey, itemValue] of Object.entries(propertiesArray)) {
          if(itemKey == dataKey){
            attrValueListDOM += `<p class="text-sm py-1 border-b border-gray-500 text-gray-800 dark:text-gray-200">${itemValue}</p>`;
          }
        }
      }
    }
    document.getElementById('attributeValueList').innerHTML = attrValueListDOM;
  });
  document.getElementById('loadoverlayfinalise').addEventListener('click', function(evt){
    evt.preventDefault();
    let mainFileCodex = document.getElementById('project_codex').value;
    let overlayFileCodex = document.getElementById('uploadedfilecodex').value;
    let overlayTitle = document.getElementById('overlaytitlename').value;
    let selectedAttribute = overlayLabelSelectorElm.value;
    if(selectedAttribute == '-'){
      let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">You must select an attribute to continue.</p></div></div></div>`;
      document.getElementById('cwxnotice').innerHTML = noticeDOM;
      setTimeout(function(){
        document.getElementById('cwxnotice').innerHTML = "";
      }, 5000);
    } else {
      let xhr = new XMLHttpRequest();
      let formData = new FormData();
      formData.append('mainfile', mainFileCodex);
      formData.append('overlayfile', overlayFileCodex);
      formData.append('labelkey', selectedAttribute);
      formData.append('overlaytitle', overlayTitle);
      xhr.responseType = 'json';
      xhr.open('POST', 'http://localhost:7447/setOverlayLabelAttribute');
      xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE) {
          var status = xhr.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            let responseObj = xhr.response;
            if(responseObj.code == 200 && responseObj.message == 'success'){
              document.getElementById('data_view_body').innerHTML = "";
              webmap.createUtilityMap(responseObj.data);
            } else {
              let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">`+ responseObj.message +`</p></div></div></div>`;
              document.getElementById('cwxnotice').innerHTML = noticeDOM;
              setTimeout(function(){
                document.getElementById('cwxnotice').innerHTML = "";
              }, 5000);
            }
          } else {
            let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">There was an internal application error. Please restart the application and start over.</p></div></div></div>`;
            document.getElementById('cwxnotice').innerHTML = noticeDOM;
            setTimeout(function(){
              document.getElementById('cwxnotice').innerHTML = "";
            }, 5000);
          }
        }
      };
      xhr.send(formData);
    }
  });
};

lib.uploadShapefileSecondStep = function(data){
  var dataArray = data;
  const areaSelectorElm = document.getElementById('areanameselector');
  document.getElementById('areanameselector').addEventListener('change', function(evt){
    evt.preventDefault();
    document.getElementById('attributeValueList').innerHTML = '';
    let dataKey = areaSelectorElm.value;
    let attrValueListDOM = '';
    if(dataKey != '-'){
      for (const [key, value] of Object.entries(dataArray)) {
        let propertiesArray = value.properties;
        for (const [itemKey, itemValue] of Object.entries(propertiesArray)) {
          if(itemKey == dataKey){
            attrValueListDOM += `<p class="text-sm py-1 border-b border-gray-500 text-gray-800 dark:text-gray-200">${itemValue}</p>`;
          }
        }
      }
    }
    document.getElementById('attributeValueList').innerHTML = attrValueListDOM;
  });
  document.getElementById('loadshapefilestep2').addEventListener('click', function(evt){
    evt.preventDefault();
    let mainFileCodex = document.getElementById('uploadedfilecodex').value;
    let selectedAttribute = areaSelectorElm.value;
    if(selectedAttribute == '-'){
      let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">You must select an attribute to continue.</p></div></div></div>`;
      document.getElementById('cwxnotice').innerHTML = noticeDOM;
      setTimeout(function(){
        document.getElementById('cwxnotice').innerHTML = "";
      }, 5000);
    } else {
      let xhr = new XMLHttpRequest();
      let formData = new FormData();
      formData.append('filecodex', mainFileCodex);
      formData.append('areakey', selectedAttribute);
      xhr.responseType = 'json';
      xhr.open('POST', 'http://localhost:7447/setAreaAttribute');
      xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE) {
          var status = xhr.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            let resAreaNameModifiedObj = xhr.response;
            if(resAreaNameModifiedObj.code == 200 && resAreaNameModifiedObj.message == 'success'){
              document.getElementById('microformwizard').innerHTML = '';
              let thirdStepDOM = `<div class="flex flex-col justify-between pt-3">
                  <label id="labelpopulationdataselector" class="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Select an attribute from your uploaded shapefile to be <strong>population data</strong>.</label>
                  <select aria-labelledby="labelpopulationdataselector" id="populationdataselector" name="populationdataselector" class="mt-3 text-gray-800 dark:text-gray-800 py-2 border-gray-600 dark:border-gray-400"></select>
                </div>
                <p class="text-sm my-4 text-gray-800 dark:text-gray-200">Attribute's values:</p>
                <div id="attributeValueList" class="mt-4 w-full h-40 overflow-auto bg-gray-200 dark:bg-gray-600"></div>
                <p id="populationformatotfnotice" class="text-sm my-4 text-gray-800 dark:text-gray-200"><span>Notes: Please select an attribute which values are integer numbers.</span></p>
                <div class="flex flex-row justify-end mt-8">
                  <button role="button" id="finalisedoitlater" class="focus:ring-1 focus:ring-offset-1 focus:ring-pink-800 text-sm font-semibold leading-none text-white focus:outline-none bg-pink-800 border hover:bg-blue-900 py-4 px-4">I'll do it later, and finish now</button>
                  <button role="button" id="finaliseupload" class="focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 text-sm font-semibold leading-none text-white focus:outline-none bg-blue-900 border hover:bg-pink-600 py-4 px-4">Finish</button>
                </div>`;
              document.getElementById('microformwizard').innerHTML = thirdStepDOM;
              document.getElementById('uploadedfilecodex').value = resAreaNameModifiedObj.codex;
              document.getElementById('view_mainfile_codex').value = resAreaNameModifiedObj.codex;
              let populationDataSelectorDOM = `<option value="-" class="text-md border-gray-300 text-gray-800 dark:text-gray-800">Select Reserved Attribute</option>`;
              let arrayFeatures = resAreaNameModifiedObj.data.features;
              let featuresArray = resAreaNameModifiedObj.data.features[0];
              let featureProperties = featuresArray.properties;
              let featurePropKeysArray = Object.keys(featureProperties);
              featurePropKeysArray.forEach(function(prop){
                if(prop != 'xfid' && prop != 'xareaname' && prop != 'fill_red_channel' && prop != 'fill_green_channel' && prop != 'fill_blue_channel' && prop != 'fill_alpha_channel' && prop != 'stroke_red_channel' && prop != 'stroke_green_channel' && prop != 'stroke_blue_channel' && prop != 'stroke_alpha_channel' && prop != 'stroke_width' && prop != 'centroid'){
                  populationDataSelectorDOM += `<option value="${prop}" class="text-md border-gray-300 text-gray-800 dark:text-gray-800">${prop}</option>`;
                }
              });
              document.getElementById('populationdataselector').innerHTML = populationDataSelectorDOM;
              lib.uploadShapefileThirdStep(arrayFeatures);
            } else {
              let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">`+ resUploadObj.message +`</p></div></div></div>`;
              document.getElementById('cwxnotice').innerHTML = noticeDOM;
              setTimeout(function(){
                document.getElementById('cwxnotice').innerHTML = "";
              }, 5000);
            }
          } else {
            let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">There was an internal application error. Please restart the application and start over.</p></div></div></div>`;
            document.getElementById('cwxnotice').innerHTML = noticeDOM;
            setTimeout(function(){
              document.getElementById('cwxnotice').innerHTML = "";
            }, 5000);
          }
        }
      };
      xhr.send(formData);
    }
  });
};

lib.uploadShapefileThirdStep = function(data){
  var dataArray = data;
  const populationDataSelectorElm = document.getElementById('populationdataselector');
  let buttonDoItLaterFinalise = document.getElementById('finalisedoitlater');
  let buttonSetPopulationDataFinalise = document.getElementById('finaliseupload');
  document.getElementById('populationdataselector').addEventListener('change', function(evt){
    evt.preventDefault();
    document.getElementById('samplepopulationdata').value = '-';
    let valueDataEntry = '';
    document.getElementById('attributeValueList').innerHTML = '';
    let dataKey = populationDataSelectorElm.value;
    let attrValueListDOM = '';
    if(dataKey != '-'){
      for (const [key, value] of Object.entries(dataArray)) {
        let propertiesArray = value.properties;
        for (const [itemKey, itemValue] of Object.entries(propertiesArray)) {
          if(itemKey == dataKey){
            attrValueListDOM += `<p class="text-sm py-1 border-b border-gray-500 text-gray-800 dark:text-gray-200">${itemValue}</p>`;
            valueDataEntry = ''+itemValue+'';
          }
        }
      }
    }
    document.getElementById('attributeValueList').innerHTML = attrValueListDOM;
    if(lib.numericCheck(valueDataEntry)){
      document.getElementById('samplepopulationdata').value = valueDataEntry;
      let noticeSelectionDOM = `<span class="text-green-800">Notes: Your selection seems good.</span>`;
      document.getElementById('populationformatotfnotice').innerHTML = noticeSelectionDOM;
      setTimeout(function(){
        let noticeSelectionResetDOM = `<span>Notes: Please select an attribute which values are integer numbers.</span>`;
        document.getElementById('populationformatotfnotice').innerHTML = noticeSelectionResetDOM;
      }, 2000);
    } else {
      let noticeSelectionDOM = `<span class="text-red-800">Notes: Your selection is unacceptable.</span>`;
      document.getElementById('populationformatotfnotice').innerHTML = noticeSelectionDOM;
      setTimeout(function(){
        let noticeSelectionResetDOM = `<span>Notes: Please select an attribute which values are integer numbers.</span>`;
        document.getElementById('populationformatotfnotice').innerHTML = noticeSelectionResetDOM;
      }, 2000);
    }
  });
  buttonDoItLaterFinalise.addEventListener('click', function(evt){
    evt.preventDefault();
    let mainFileCodex = document.getElementById('uploadedfilecodex').value;
    let xhr = new XMLHttpRequest();
    let formData = new FormData();
    formData.append('filecodex', mainFileCodex);
    xhr.responseType = 'json';
    xhr.open('POST', 'http://localhost:7447/setDelayedPopulationAttribute');
    xhr.onreadystatechange = function () {
      if(xhr.readyState === XMLHttpRequest.DONE) {
        var status = xhr.status;
        if (status === 0 || (status >= 200 && status < 400)) {
          let responseObj = xhr.response;
          if(responseObj.code == 200 && responseObj.message == 'success'){
            document.getElementById('data_view_body').innerHTML = "";
            webmap.createUtilityMap(responseObj.data);
          } else {
            let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">`+ resUploadObj.message +`</p></div></div></div>`;
            document.getElementById('cwxnotice').innerHTML = noticeDOM;
            setTimeout(function(){
              document.getElementById('cwxnotice').innerHTML = "";
            }, 5000);
          }
        } else {
          let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">There was an internal application error. Please restart the application and start over.</p></div></div></div>`;
          document.getElementById('cwxnotice').innerHTML = noticeDOM;
          setTimeout(function(){
            document.getElementById('cwxnotice').innerHTML = "";
          }, 5000);
        }
      }
    };
    xhr.send(formData);
  });
  buttonSetPopulationDataFinalise.addEventListener('click', function(evt){
    evt.preventDefault();
    let mainFileCodex = document.getElementById('uploadedfilecodex').value;
    let selectedAttribute = populationDataSelectorElm.value;
    let samplepopdata = document.getElementById('samplepopulationdata').value;
    if(samplepopdata == '-'){
      let xhr = new XMLHttpRequest();
      let formData = new FormData();
      formData.append('filecodex', mainFileCodex);
      xhr.responseType = 'json';
      xhr.open('POST', 'http://localhost:7447/setDelayedPopulationAttribute');
      xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE) {
          var status = xhr.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            let responseObj = xhr.response;
            if(responseObj.code == 200 && responseObj.message == 'success'){
              document.getElementById('data_view_body').innerHTML = "";
              webmap.createUtilityMap(responseObj.data);
            } else {
              let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">`+ resUploadObj.message +`</p></div></div></div>`;
              document.getElementById('cwxnotice').innerHTML = noticeDOM;
              setTimeout(function(){
                document.getElementById('cwxnotice').innerHTML = "";
              }, 5000);
            }
          } else {
            let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">There was an internal application error. Please restart the application and start over.</p></div></div></div>`;
            document.getElementById('cwxnotice').innerHTML = noticeDOM;
            setTimeout(function(){
              document.getElementById('cwxnotice').innerHTML = "";
            }, 5000);
          }
        }
      };
      xhr.send(formData);
    } else {
      let xhr = new XMLHttpRequest();
      let formData = new FormData();
      formData.append('filecodex', mainFileCodex);
      formData.append('populationkey', selectedAttribute);
      xhr.responseType = 'json';
      xhr.open('POST', 'http://localhost:7447/setPopulationAttributeFinalise');
      xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE) {
          var status = xhr.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            let responseObj = xhr.response;
            if(responseObj.code == 200 && responseObj.message == 'success'){
              document.getElementById('data_view_body').innerHTML = "";
              webmap.createUtilityMap(responseObj.data);
            } else {
              let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">`+ resUploadObj.message +`</p></div></div></div>`;
              document.getElementById('cwxnotice').innerHTML = noticeDOM;
              setTimeout(function(){
                document.getElementById('cwxnotice').innerHTML = "";
              }, 5000);
            }
          } else {
            let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">There was an internal application error. Please restart the application and start over.</p></div></div></div>`;
            document.getElementById('cwxnotice').innerHTML = noticeDOM;
            setTimeout(function(){
              document.getElementById('cwxnotice').innerHTML = "";
            }, 5000);
          }
        }
      };
      xhr.send(formData);
    }
  });
};

lib.uploadPopulationDataFirstStep = function(){
  let buttonNext = document.getElementById('loadpopulationdatastep1');
  let fileTextCSV = document.getElementById('filetoupload');
  buttonNext.addEventListener('click', function(evt){
    evt.preventDefault();
    Papa.parse(fileTextCSV.files[0], {
      header: true,
      complete: function(results) {
        document.getElementById('filecontentsraw').value = JSON.stringify(results.data);
        document.getElementById('reservedfieldsarray').value = JSON.stringify(results.meta.fields);
        document.getElementById('microformwizard').innerHTML = '';
        let secondStepDOM = `<div class="flex flex-col justify-between pt-3">
            <label id="labelareanameselector" class="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Select an attribute from your *.csv file to be <strong>area name</strong>.</label>
            <select aria-labelledby="labelareanameselector" id="areanameselector" name="areanameselector" class="mt-3 text-gray-800 dark:text-gray-800 py-2 border-gray-600 dark:border-gray-400"></select>
          </div>
          <p class="text-sm my-4 text-gray-800 dark:text-gray-200">Attribute's values:</p>
          <div id="attributeAreaNameValueList" class="mt-4 w-full h-40 overflow-auto bg-gray-200 dark:bg-gray-600"></div>
          <div class="flex flex-row justify-end mt-8">
            <button role="button" id="loadpopulationdatastep2" class="focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 text-sm font-semibold leading-none text-white focus:outline-none bg-blue-900 border hover:bg-pink-600 py-4 px-4">Next</button>
          </div>`;
        document.getElementById('microformwizard').innerHTML = secondStepDOM;
        let areaNameSelectorDOM = `<option value="-" class="text-md border-gray-300 text-gray-800 dark:text-gray-800">Select Reserved Attribute</option>`;
        let arrayHeaderFields = results.meta.fields;
        arrayHeaderFields.forEach(function(field){
          areaNameSelectorDOM += `<option value="${field}" class="text-md border-gray-300 text-gray-800 dark:text-gray-800">${field}</option>`;
        });
        document.getElementById('areanameselector').innerHTML = areaNameSelectorDOM;
        lib.uploadPopulationDataSecondStep();
      }
    });
  });
};

lib.uploadPopulationDataSecondStep = function(){
  let buttonNext = document.getElementById('loadpopulationdatastep2');
  let areaSelectorElm = document.getElementById('areanameselector');
  document.getElementById('areanameselector').addEventListener('change', function(evt){
    evt.preventDefault();
    document.getElementById('attributeAreaNameValueList').innerHTML = '';
    let strDataReserved = document.getElementById('filecontentsraw').value;
    let arrayObjectDataReserved = JSON.parse(strDataReserved);
    let dataKey = areaSelectorElm.value;
    let attrValueListDOM = '';
    if(dataKey != '-'){
      arrayObjectDataReserved.forEach(function(datarow){
        for (const [key, value] of Object.entries(datarow)) {
          if(key == dataKey){
            attrValueListDOM += `<p class="text-sm py-1 border-b border-gray-500 text-gray-800 dark:text-gray-200">${value}</p>`;
            Object.assign(datarow, {"xareaname":value});
          }
        }
      });
      document.getElementById('attributeAreaNameValueList').innerHTML = attrValueListDOM;
      document.getElementById('formedarrayfirststep').value = JSON.stringify(arrayObjectDataReserved);
      document.getElementById('areanamefield').value = dataKey;
    }
  });
  buttonNext.addEventListener('click', function(evt){
    evt.preventDefault();
    document.getElementById('microformwizard').innerHTML = '';
    let secondStepDOM = `<div class="flex flex-col justify-between pt-3">
        <label id="labelpopulationdataselector" class="text-sm font-medium leading-none text-gray-800 dark:text-gray-200">Select an attribute from your *.csv file to be <strong>area population data</strong>.</label>
        <select aria-labelledby="labelpopulationdataselector" id="populationdataselector" name="populationdataselector" class="mt-3 text-gray-800 dark:text-gray-800 py-2 border-gray-600 dark:border-gray-400"></select>
      </div>
      <p class="text-sm my-4 text-gray-800 dark:text-gray-200">Attribute's values:</p>
      <div id="attributePopulationDataValueList" class="mt-4 w-full h-40 overflow-auto bg-gray-200 dark:bg-gray-600"></div>
      <div class="flex flex-row justify-end mt-8">
        <button role="button" id="finishloadpopulationdata" class="focus:ring-1 focus:ring-offset-1 focus:ring-blue-900 text-sm font-semibold leading-none text-white focus:outline-none bg-blue-900 border hover:bg-pink-600 py-4 px-4">Finish</button>
      </div>`;
    document.getElementById('microformwizard').innerHTML = secondStepDOM;
    let populationDataSelectorDOM = `<option value="-" class="text-md border-gray-300 text-gray-800 dark:text-gray-800">Select Reserved Attribute</option>`;
    let selectedAreaNameField = document.getElementById('areanamefield').value;
    let strReservedHeaderFields = document.getElementById('reservedfieldsarray').value;
    let arrayHeaderFields = JSON.parse(strReservedHeaderFields);
    arrayHeaderFields.forEach(function(field){
      if(field != selectedAreaNameField){
        populationDataSelectorDOM += `<option value="${field}" class="text-md border-gray-300 text-gray-800 dark:text-gray-800">${field}</option>`;
      }
    });
    document.getElementById('populationdataselector').innerHTML = populationDataSelectorDOM;
    lib.uploadPopulationDataFinalStep();
  });
};

lib.uploadPopulationDataFinalStep = function(){
  /*
    <input type="hidden" id="filecontentsraw" name="filecontentsraw" value=""/>
    <input type="hidden" id="reservedfieldsarray" name="reservedfieldsarray" value=""/>
    <input type="hidden" id="formedarrayfirststep" name="formedarrayfirststep" value=""/>
    <input type="hidden" id="formedarraysecondstep" name="formedarraysecondstep" value=""/>
    <input type="hidden" id="areanamefield" name="areanamefield" value=""/>
    <input type="hidden" id="populationfield" name="populationfield" value=""/>
    <input type="hidden" id="setpopulationstring" name="setpopulationstring" value=""/>
  */
  let buttonFinish = document.getElementById('finishloadpopulationdata');
  let populationDataSelectorElm = document.getElementById('populationdataselector');
  let strReservedHeaderFields = document.getElementById('reservedfieldsarray').value;
  let objCSVHeaderFields = JSON.parse(strReservedHeaderFields);
  document.getElementById('populationdataselector').addEventListener('change', function(evt){
    evt.preventDefault();
    document.getElementById('attributePopulationDataValueList').innerHTML = '';
    let strDataReserved = document.getElementById('formedarrayfirststep').value;
    let arrayObjectDataReserved = JSON.parse(strDataReserved);
    let dataKey = populationDataSelectorElm.value;
    let attrValueListDOM = '';
    if(dataKey != '-'){
      arrayObjectDataReserved.forEach(function(datarow){
        for (const [key, value] of Object.entries(datarow)) {
          if(key == dataKey){
            attrValueListDOM += `<p class="text-sm py-1 border-b border-gray-500 text-gray-800 dark:text-gray-200">${value}</p>`;
            Object.assign(datarow, {"xarea_population": value});
          }
        }
      });
      let objWrangledData = arrayObjectDataReserved;
      objCSVHeaderFields.forEach(function(field){
        objWrangledData.forEach(function(item){
          delete item[field];
        });
      });
      document.getElementById('attributePopulationDataValueList').innerHTML = attrValueListDOM;
      document.getElementById('formedarraysecondstep').value = JSON.stringify(arrayObjectDataReserved);
      document.getElementById('setpopulationstring').value = JSON.stringify(objWrangledData);
      document.getElementById('populationfield').value = dataKey;
    }
  });
  buttonFinish.addEventListener('click', function(evt){
    evt.preventDefault();
    let prjMainFile = document.getElementById('view_mainfile_codex').value;
    let populationDataObjectStr = document.getElementById('setpopulationstring').value;
    let populationDataObject = JSON.parse(populationDataObjectStr);
    let xhr = new XMLHttpRequest();
    let formData = new FormData();
    formData.append('mainfile', prjMainFile);
    formData.append('populationdata', JSON.stringify(populationDataObject));
    xhr.responseType = 'json';
    xhr.open('POST', 'http://localhost:7447/mergePopulationData');
    xhr.onreadystatechange = function () {
      if(xhr.readyState === XMLHttpRequest.DONE) {
        var status = xhr.status;
        if (status === 0 || (status >= 200 && status < 400)) {
          let responseObj = xhr.response;
          if(responseObj.code == 200 && responseObj.message == 'success'){
            let mainFileData = responseObj.data;
            document.getElementById('data_view_body').innerHTML = "";
            //webmap.createUtilityMap(responseObj.data);
            datautils.createUtilityDataTable(mainFileData);
          } else {
            let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">`+ resUploadObj.message +`</p></div></div></div>`;
            document.getElementById('cwxnotice').innerHTML = noticeDOM;
            setTimeout(function(){
              document.getElementById('cwxnotice').innerHTML = "";
            }, 5000);
          }
        } else {
          let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">There was an internal application error. Please restart the application and start over.</p></div></div></div>`;
          document.getElementById('cwxnotice').innerHTML = noticeDOM;
          setTimeout(function(){
            document.getElementById('cwxnotice').innerHTML = "";
          }, 5000);
        }
      }
    };
    xhr.send(formData);
  });
};

lib.setParliamentSeatsFunction = function(){
  let buttonUpdateData = document.getElementById('updateparliamentseats');
  buttonUpdateData.addEventListener('click', function(evt){
    evt.preventDefault();
    let prjMainFile = document.getElementById('view_mainfile_codex').value;
    let valueElm = document.getElementById('parliamentseats').value;
    let valueMinElm = document.getElementById('minimumseats').value;
    let valueMaxElm = document.getElementById('maximumseats').value;
    if(valueElm.length > 0){
      let reqPayload = JSON.stringify({"mainfile":prjMainFile, "parliamentseats": valueElm, "minimumseats": valueMinElm, "maximumseats": valueMaxElm});
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.onload = function(){
        let resObj = xhr.response;
        let mainFileData = resObj.data;
        if(resObj.code == 200 && resObj.message == 'success'){
          document.getElementById('data_view_body').innerHTML = "";
          datautils.createPostDataModificationTable(mainFileData);
        } else {
          let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">There was an internal application error. Please restart the application and start over.</p></div></div></div>`;
          document.getElementById('cwxnotice').innerHTML = noticeDOM;
          setTimeout(function(){
            document.getElementById('cwxnotice').innerHTML = "";
          }, 5000);
        }
      };
      xhr.open('POST', 'http://localhost:7447/updateParliamentSeats');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(reqPayload);
    } else {
      let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">You can not supply an empty value.</p></div></div></div>`;
      document.getElementById('cwxnotice').innerHTML = noticeDOM;
      setTimeout(function(){
        document.getElementById('cwxnotice').innerHTML = "";
      }, 3000);
    }
  });
};

lib.setStandardDeviationFunction = function(){
  let ignoreFlagElm = document.getElementById('ignoreflag');
  let ignoreCheckerElm = document.getElementById('checkignore');
  let buttonUpdateData = document.getElementById('updatestandarddeviation');
  var typeaheadField = document.getElementById('standarddeviation');
  typeaheadField.addEventListener('keyup', function(){
    if(this.value == '.' || this.value == ','){
      this.value = '0.';
    }
  });
  ignoreCheckerElm.addEventListener('change', function(evt){
    if(ignoreCheckerElm.checked == true){
      ignoreFlagElm.value = '1';
    } else {
      ignoreFlagElm.value = '0';
    }
  });
  buttonUpdateData.addEventListener('click', function(evt){
    evt.preventDefault();
    //let regexpDecimal = /[-+]?[0-9].?[0-9]/;
    let regexpDecimal = /[.]/;
    let fixedValue = 0;
    let valueElm = document.getElementById('standarddeviation').value;
    var isDecimal = regexpDecimal.test(valueElm);
    if(isDecimal === true){
      /* if(Math.abs(parseFloat(valueElm).toFixed(2)) >= 0 && Math.abs(parseFloat(valueElm).toFixed(2)) <= parseFloat('50.0')){
        fixedValue = Math.abs(parseFloat(valueElm).toFixed(2));
        console.log(`input: ${valueElm}, read: ${fixedValue}, pct: ${parseFloat(fixedValue / 100).toFixed(2)}%`);
      } else {
        console.log(`input: ${valueElm}, read: < 0 or > 50`);
      } */
      fixedValue = 0;
      let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">You can not supply an empty value or beyond 0 - 50 (in INTEGER value).</p></div></div></div>`;
      document.getElementById('cwxnotice').innerHTML = noticeDOM;
      setTimeout(function(){
        document.getElementById('cwxnotice').innerHTML = "";
        document.getElementById('standarddeviation').value = '0';
      }, 2000);
    } else {
      if(parseInt(valueElm) >= 0 && parseInt(valueElm) <= 50){
        fixedValue = Math.abs(parseFloat(parseInt(valueElm) / 100).toFixed(2));
        // console.log(`input: ${valueElm}, read: ${fixedValue}, pct: ${parseFloat(fixedValue * 100).toFixed(2)}%`);
        // fixedValue = parseFloat(`0.${parseInt(valueElm)}`).toFixed(2);
        // document.getElementById('standarddeviation').value = fixedValue;
        setTimeout(function(){
          let prjMainFile = document.getElementById('view_mainfile_codex').value;
          let ignoreValueElm = document.getElementById('ignoreflag').value;
          // let fixedValueElm = document.getElementById('standarddeviation').value;
          let fixedValueElm = fixedValue;
          let reqPayload = JSON.stringify({"mainfile":prjMainFile, "stddev": fixedValueElm, "ignoreflag": ignoreValueElm});
          let xhr = new XMLHttpRequest();
          xhr.responseType = 'json';
          xhr.onload = function(){
            let resObj = xhr.response;
            let mainFileData = resObj.data;
            if(resObj.code == 200 && resObj.message == 'success'){
              document.getElementById('data_view_body').innerHTML = "";
              datautils.createPostDataModificationTable(mainFileData);
            } else {
              let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">There was an internal application error. Please restart the application and start over.</p></div></div></div>`;
              document.getElementById('cwxnotice').innerHTML = noticeDOM;
              setTimeout(function(){
                document.getElementById('cwxnotice').innerHTML = "";
              }, 5000);
            }
          };
          xhr.open('POST', 'http://localhost:7447/updateStandardDeviation');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(reqPayload);
        }, 500);
      } else {
        fixedValue = 0;
        let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">You can not supply an empty value or beyond 0 - 50.</p></div></div></div>`;
        document.getElementById('cwxnotice').innerHTML = noticeDOM;
        setTimeout(function(){
          document.getElementById('cwxnotice').innerHTML = "";
          document.getElementById('standarddeviation').value = '0';
        }, 2000);
      }
    }
    /* if(valueElm.length > 0 && parseInt(valueElm) >= 1 && parseInt(valueElm) <= 50){
      fixedValue = parseFloat(`0.${parseInt(valueElm)}`).toFixed(2);
      document.getElementById('standarddeviation').value = fixedValue;
      setTimeout(function(){
        let prjMainFile = document.getElementById('view_mainfile_codex').value;
        let ignoreValueElm = document.getElementById('ignoreflag').value;
        let fixedValueElm = document.getElementById('standarddeviation').value;
        let reqPayload = JSON.stringify({"mainfile":prjMainFile, "stddev": fixedValueElm, "ignoreflag": ignoreValueElm});
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.onload = function(){
          let resObj = xhr.response;
          let mainFileData = resObj.data;
          if(resObj.code == 200 && resObj.message == 'success'){
            document.getElementById('data_view_body').innerHTML = "";
            datautils.createPostDataModificationTable(mainFileData);
          } else {
            let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">There was an internal application error. Please restart the application and start over.</p></div></div></div>`;
            document.getElementById('cwxnotice').innerHTML = noticeDOM;
            setTimeout(function(){
              document.getElementById('cwxnotice').innerHTML = "";
            }, 5000);
          }
        };
        xhr.open('POST', 'http://localhost:7447/updateStandardDeviation');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(reqPayload);
      }, 500);
    } else if(valueElm.length > 0 && parseFloat(valueElm) <= parseFloat('0.50')){
      setTimeout(function(){
        let prjMainFile = document.getElementById('view_mainfile_codex').value;
        let ignoreValueElm = document.getElementById('ignoreflag').value;
        let fixedValueElm = document.getElementById('standarddeviation').value;
        let reqPayload = JSON.stringify({"mainfile":prjMainFile, "stddev": fixedValueElm, "ignoreflag": ignoreValueElm});
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.onload = function(){
          let resObj = xhr.response;
          let mainFileData = resObj.data;
          if(resObj.code == 200 && resObj.message == 'success'){
            document.getElementById('data_view_body').innerHTML = "";
            datautils.createPostDataModificationTable(mainFileData);
          } else {
            let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">There was an internal application error. Please restart the application and start over.</p></div></div></div>`;
            document.getElementById('cwxnotice').innerHTML = noticeDOM;
            setTimeout(function(){
              document.getElementById('cwxnotice').innerHTML = "";
            }, 5000);
          }
        };
        xhr.open('POST', 'http://localhost:7447/updateStandardDeviation');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(reqPayload);
      }, 500);
    } else {
      fixedValue = 0;
      let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">You can not supply an empty value or beyond 0 - 50.</p></div></div></div>`;
      document.getElementById('cwxnotice').innerHTML = noticeDOM;
      setTimeout(function(){
        document.getElementById('cwxnotice').innerHTML = "";
      }, 3000);
    } */
    /* if(valueElm.length > 0 && parseFloat(valueElm) >= 0 && parseFloat(valueElm) <= parseFloat('0.50')){
      let reqPayload = JSON.stringify({"mainfile":prjMainFile, "stddev": valueElm, "ignoreflag": ignoreValueElm});
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.onload = function(){
        let resObj = xhr.response;
        let mainFileData = resObj.data;
        if(resObj.code == 200 && resObj.message == 'success'){
          document.getElementById('data_view_body').innerHTML = "";
          datautils.createPostDataModificationTable(mainFileData);
        } else {
          let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">There was an internal application error. Please restart the application and start over.</p></div></div></div>`;
          document.getElementById('cwxnotice').innerHTML = noticeDOM;
          setTimeout(function(){
            document.getElementById('cwxnotice').innerHTML = "";
          }, 5000);
        }
      };
      xhr.open('POST', 'http://localhost:7447/updateStandardDeviation');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(reqPayload);
    } else {
      let noticeDOM = `<div class="flex items-center justify-center px-4"><div role="alert" id="alert" class="transition duration-150 ease-in-out w-full lg:w-11/12 mx-auto bg-white dark:bg-gray-800 shadow flex flex-col py-4 md:py-0 items-center md:flex-row justify-between"><div class="flex flex-col items-center md:flex-row"><div class="mr-3 p-4 bg-yellow-400 text-white"><svg tabindex="0" role="alert" aria-label="warning" class="focus:outline-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path class="heroicon-ui" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 9a1 1 0 0 1-1-1V8a1 1 0 0 1 2 0v4a1 1 0 0 1-1 1zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" /></svg></div><p class="mr-2 text-base font-bold text-gray-800 dark:text-gray-100 mt-2 md:my-0">Warning</p><div class="h-1 w-1 bg-gray-300 dark:bg-gray-700 mr-2 hidden xl:block"></div><p class="text-sm lg:text-base dark:text-gray-400 text-gray-600 lg:pt-1 xl:pt-0 sm:mb-0 mb-2 text-center sm:text-left">You can not supply an empty value or beyond 0 - 50.</p></div></div></div>`;
      document.getElementById('cwxnotice').innerHTML = noticeDOM;
      setTimeout(function(){
        document.getElementById('cwxnotice').innerHTML = "";
      }, 3000);
    } */
  });
};

lib.numericCheck = function (strNumeric) {
  return !isNaN(strNumeric);
}

export default lib;