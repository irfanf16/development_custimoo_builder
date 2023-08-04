// Get nearest pantone

import hexRgb, { RgbaObject } from 'hex-rgb'
import rgbHex from 'rgb-hex';
import {closest,RGBColor} from 'color-diff';
import {pantonesTcx} from '@/pantonesTcx';
import {pantonesCoated} from '@/pantonesCoated';

const get_rgbObject = (hexColor: string) => {
  const rgbcolor = hexRgb(hexColor) as RgbaObject
  const rgbObject = {
    R : rgbcolor['red'],
    G : rgbcolor['green'],
    B : rgbcolor['blue']
  }
  return rgbObject
}

const get_cmykObject = (hexColor:string) => {
  const cmyk = {
    C : 0,
    M: 0,
    Y: 0,
    K: 0,
  };
    const hex_color = (hexColor.charAt(0) === "#")? hexColor.substring(1,7): hexColor;
    if(hex_color.length != 6){
      return ;
    }
    if(/[0-9a-f]{6}/i.test(hexColor) !== true){
      return;
    }
    const R = parseInt(hex_color.substring(0,2),16);
    const G = parseInt(hex_color.substring(2,4),16);
    const B = parseInt(hex_color.substring(4,6),16);

    //BLACK
    if(R===0 && G===0 && B===0){
      cmyk.K = 1;
      return cmyk;
    }
    cmyk.C = 1 - (R/255);
    cmyk.M = 1 - (G/255);
    cmyk.Y = 1 - (B/255);

    const minCMY = Math.min(cmyk.C,Math.min(cmyk.M,cmyk.Y));
    cmyk.C = ((cmyk.C - minCMY) / (1 - minCMY)) * 100;
    cmyk.M = ((cmyk.M - minCMY) / (1 - minCMY)) * 100;
    cmyk.Y = ((cmyk.Y - minCMY) / (1 - minCMY)) * 100;
    cmyk.K = minCMY * 100;

    return cmyk;

}
const cmykObjectToLabel = (cmyk:Record<any,any>) => {
  let label = "";
  Object.entries(cmyk).forEach(([key,value]) =>{
    const round_value = Math.round(value);
    label += key + ' ' + (Number.isInteger(round_value)? round_value : Math.round(round_value).toFixed(2) ) + '%' + ' ';
  })
  return label;
}

const getClosestColor = (inputHex: string, pantonesArray: Record<any, any>[]= [], colorType = 'pantone-tcx') => {
  let RGBList: RGBColor[] = [];
  let sample_pantones: Record<any, any> [] = [];

  let merged_colors: Record<any,any> [] = [];
  switch(colorType) {
    case 'pantone-tcx':
      merged_colors = pantonesTcx;
      merged_colors = [...pantonesArray as { pantone: string; name: string; hex: string; }[],...merged_colors ];
      sample_pantones = merged_colors;
      RGBList = merged_colors.map((color: Record<any, any>) => get_rgbObject(color.hex))
      break;
    case 'pantone-coated':
      merged_colors = pantonesCoated;
      merged_colors = [...pantonesArray as { pantone: string; name: string; hex: string; }[],...merged_colors ];
      sample_pantones = merged_colors;
      RGBList = merged_colors.map((color: Record<any, any>) => get_rgbObject(color.hex))
      break;
    case 'product_color':
      sample_pantones = pantonesArray as { pantone: string; name: string; hex: string; }[]
      RGBList = pantonesArray.map((color: Record<any, any>) => get_rgbObject(color.hex))
      break;
  }
  if(colorType !== 'cmyk'){
    const inputRGB = get_rgbObject(inputHex)
    const nearestColor = closest(inputRGB, RGBList)
    const nearestColorHex = rgbHex(nearestColor.R, nearestColor.G, nearestColor.B)
    const indexInColorList = sample_pantones.findIndex((x: Record<any, any>) => {
      return x.hex.toLowerCase() == `#${nearestColorHex.toLowerCase()}`
    })
    const nearestColorObject =  sample_pantones[indexInColorList]
    return nearestColorObject
  }else{
    sample_pantones = pantonesArray as { pantone: string; name: string; hex: string; }[];
    const colorObject = sample_pantones.find((pantone) => pantone.hex === inputHex);
    if(colorObject){
      return colorObject;
    }
    else{
      return {pantone:null, name: cmykObjectToLabel((get_cmykObject(inputHex) as Record<any, any>)), hex: inputHex.includes('#')?inputHex:'#'+inputHex}
    }

  }

}

const getColorEncoding = (inputEncoding: string, colorType= 'pantone') => {
  let colorEncoding:Record<any, any> | undefined = {pantone : null, name: null, hex: null};
  switch(colorType){
    case 'pantone-coated':
      colorEncoding = pantonesCoated.find((color) => {
        return inputEncoding.toLowerCase() == color.pantone.toLowerCase()
      });
      break;
    case 'pantone-tcx':
      colorEncoding = pantonesTcx.find((color, index) => {
        return inputEncoding.toLowerCase() == color.pantone.toLowerCase()
      });
      break;
    case 'cmyk':
      colorEncoding = {pantone:null, name: cmykObjectToLabel((get_cmykObject(inputEncoding) as Record<any, any>)), hex: inputEncoding};
      break;
  }
  return colorEncoding
}

export {getClosestColor, pantonesTcx, getColorEncoding, get_cmykObject, cmykObjectToLabel}
