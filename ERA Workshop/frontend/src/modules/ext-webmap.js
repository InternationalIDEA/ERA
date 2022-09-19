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

lib.appendSelectedObject = function(initialArray, newObject) {
  const dynamicObject = Object.freeze(newObject);
  return Object.freeze(initialArray.concat(dynamicObject));
}

lib.hexToRGBA = function(hex, opacity) {
  return 'rgba(' + (hex = hex.replace('#', '')).match(new RegExp('(.{' + hex.length/3 + '})', 'g')).map(function(l) { return parseInt(hex.length%2 ? l+l : l, 16) }).concat(isFinite(opacity) ? opacity : 1).join(',') + ')';
};

export default lib;