import './src/stylesheet/style.css';
import 'ol/ol.css';
import './src/stylesheet/ol-layerswitcher.css';
import 'gridjs/dist/theme/mermaid.css';

import uihelper from './src/modules/ui-helpers';

import appWorker from './src/workers/worker?worker';

document.addEventListener('DOMContentLoaded', () => {
  const windowHTML = document.querySelector('html');
  let darkMode = localStorage.getItem('darkMode');
  if(!darkMode){
    localStorage.setItem('darkMode', 0);
    document.getElementById('lg_light_toggler').classList.remove('hidden');
    document.getElementById('lg_dark_toggler').classList.add('hidden');
  } else {
    if(darkMode == 1){
      windowHTML.classList.add('dark');
      document.getElementById('lg_light_toggler').classList.remove('hidden');
      document.getElementById('lg_dark_toggler').classList.add('hidden');
    } else {
      windowHTML.classList.remove('dark');
      document.getElementById('lg_light_toggler').classList.add('hidden');
      document.getElementById('lg_dark_toggler').classList.remove('hidden');
    }
  }
  const $darkTogglers = Array.prototype.slice.call(document.querySelectorAll('.dark-toggler'), 0);
  if ($darkTogglers.length > 0) {
    $darkTogglers.forEach( el => {
      el.addEventListener('click', () => {
        windowHTML.classList.toggle('dark');
        let isDark = localStorage.getItem('darkMode');
        if(isDark == 1){
          localStorage.setItem('darkMode', 0);
          document.getElementById('lg_dark_toggler').classList.remove('hidden');
          document.getElementById('lg_light_toggler').classList.add('hidden');
        } else {
          localStorage.setItem('darkMode', 1);
          document.getElementById('lg_dark_toggler').classList.add('hidden');
          document.getElementById('lg_light_toggler').classList.remove('hidden');
        }
      });
    });
  }
  document.querySelectorAll('.topnav-ui-component-action-item').forEach(function(elm){
    elm.addEventListener('click', function(evt){
      evt.preventDefault();
      if(this.getAttribute('id') == 'projectstart'){
        document.getElementById('app_main_body').innerHTML = '';
        document.getElementById('app_main_body').innerHTML = uihelper.start_project_ui();
        uihelper.start_project_actions();
      } else if(this.getAttribute('id') == 'serverconnect'){
        document.getElementById('app_main_body').innerHTML = '';
        document.getElementById('app_main_body').innerHTML = uihelper.start_connect_ui();
      } else {
        document.getElementById('app_main_body').innerHTML = '';
      }
    });
  });
  if (window.Worker) {
    const mainWorker = new appWorker();
    mainWorker.postMessage(['Worker is ready...']);
    mainWorker.onmessage = function(e) {
      console.log(e.data[0]);
    }
  } else {
    console.log('Your browser doesn\'t support web workers.');
  }
  console.log('Up and running!');
});