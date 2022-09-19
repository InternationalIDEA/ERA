var lib = {};

lib.create_configuration = function(workspaceId){
  let popupDiv = document.getElementById('popup-workspace');
  let popupDOM = `<div id="popup-wx-content" class="w-full h-full bg-gray-900 z-0 absolute inset-0"></div>
      <div class="mx-auto container">
          <div class="flex items-center justify-center h-full w-full">
              <div class="bg-white rounded-md shadow fixed overflow-y-auto sm:h-auto w-10/12 md:w-8/12 lg:w-1/2 2xl:w-2/5">
                <div class="bg-gray-100 rounded-tl-md rounded-tr-md px-4 md:px-8 md:py-4 py-7 flex items-center justify-between">
                  <p class="text-base font-semibold">Edit Workspace Configuration</p>
                  <button role="button" aria-label="close label" class="focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 focus:outline-none popup-closer">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 7L7 21" stroke="#A1A1AA" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>
                      <path d="M7 7L21 21" stroke="#A1A1AA" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                  </button>
                </div>
                <div class="px-4 md:px-10 pt-6 md:pb-4 pb-7">
                  <form id="editconfigform" name="editconfigform" class="mt-0">
                    <div class="flex items-center">
                      <input placeholder="Seat Quota" id="seatquota" name="seatquota" type="number" min="0" class="focus:ring-2 focus:ring-gray-400 w-full focus:outline-none placeholder-gray-500 py-3 px-3 text-sm leading-none text-gray-800 bg-white border rounded border-gray-200" />
                    </div>
                  </form>
                  <div class="flex items-center justify-between mt-9">
                    <button role="button" aria-label="close button" class="focus:ring-2 focus:ring-offset-2 focus:bg-gray-600 focus:ring-gray-600 focus:outline-none px-6 py-3 bg-gray-600 hover:bg-gray-500 shadow rounded text-sm text-white popup-closer">Cancel</button>
                    <button aria-label="add user" role="button" class="focus:ring-2 focus:ring-offset-2 focus:ring-indigo-800 focus:outline-none px-6 py-3 bg-indigo-700 hover:bg-opacity-80 shadow rounded text-sm text-white">Update Configuration</button>
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
      let popupDiv = document.getElementById('popup-workspace');
      let popupContent = document.getElementById('popup-wx-content');
      popupDiv.classList.add('hidden');
      popupContent.remove();
    });
  });
};

export default lib;