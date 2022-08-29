// Get nearest pantone

import hexRgb, { RgbaObject } from 'hex-rgb'
import rgbHex from 'rgb-hex';
import {default as diff, RGBColor} from 'color-diff'
import {pantones} from '@/pantone';
import {cmyk} from '@/cmyk';



const get_rgbObject = (hexColor: string) => {
  const rgbcolor = hexRgb(hexColor) as RgbaObject
  const rgbObject = {
    R : rgbcolor['red'],
    G : rgbcolor['green'],
    B : rgbcolor['blue']
  }
  return rgbObject
}

const getClosestColor = (inputHex: string, pantonesArray: Record<any, any>[]= [], colorType = 'pantone') => {
  let RGBList: RGBColor[] = [];
  let sample_pantones: Record<any, any> [] = [];

  let merged_colors: Record<any,any> [] = [];
  switch(colorType) {
    case 'pantone':
      merged_colors = pantones;
      merged_colors = [...pantonesArray as { pantone: string; name: string; hex: string; }[],...merged_colors ];
      sample_pantones = merged_colors;
      RGBList = merged_colors.map((color: Record<any, any>) => get_rgbObject(color.hex))
      break;
    case 'cmyk':
      merged_colors = cmyk;
      merged_colors = [...pantonesArray as { pantone: string; name: string; hex: string; }[],...merged_colors ];
      sample_pantones = merged_colors;
      RGBList = merged_colors.map((color: Record<any, any>) => get_rgbObject(color.hex))
      break;
    case 'product_color':
      sample_pantones = pantonesArray as { pantone: string; name: string; hex: string; }[]
      RGBList = pantonesArray.map((color: Record<any, any>) => get_rgbObject(color.hex))
      break;
  }
  const inputRGB = get_rgbObject(inputHex)
  const nearestColor = diff.closest(inputRGB,RGBList)
  const nearestColorHex = rgbHex(nearestColor.R,nearestColor.G,nearestColor.B)
  const indexInColorList = sample_pantones.findIndex((x: Record<any, any>) => {
    return x.hex.toLowerCase() == `#${nearestColorHex.toLowerCase()}`
  })
  const nearestColorObject =  sample_pantones[indexInColorList]
  return nearestColorObject
}

const getColorEncoding = (inputEncoding: string,colorType= 'pantone') => {
  const colorEncoding = colorType == 'cmyk' ?
    cmyk.find((color, index) => {
      return inputEncoding == color.pantone
    }):
    pantones.find((color, index) => {
    return inputEncoding == color.pantone
  });
  return colorEncoding
}

export {getClosestColor, pantones, getColorEncoding,cmyk}
