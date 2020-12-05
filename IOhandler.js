/*
 * Project: COMP1320 Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 * 
 * Created Date: November 11, 2020
 * Author: Jo Jo Lam
 * 
 */

const unzipper = require('unzipper'),
  fs = require("fs"),
  PNG = require('pngjs').PNG,
  path = require('path');


/**
 * Description: decompress file from given pathIn, write to given pathOut 
 *  
 * @param {string} pathIn 
 * @param {string} pathOut 
 * @return {promise}
 */

const unzip = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(pathIn)
    .pipe(unzipper.Extract({ path: pathOut }))
    .on("error", () => reject("Error occured during unzip"))
    .on("finish", () => {
      console.log("Extraction operation complete");
      resolve(pathOut);
    })
  })
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path 
 * 
 * @param {string} path 
 * @return {promise}
 */

const readDir = dir => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if(err) {
        reject(err);
      }else {
        let pngList = [];
        files.forEach((item) => {
          if(path.extname(item) === ".png") {
          pngList.push(path.join(dir, item));
          }
        })
      resolve(pngList);
      }
    })
  })
};

/**
 * Description: Read in png file by given pathIn, 
 * convert to grayscale and write to given pathOut
 * 
 * @param {string} filePath 
 * @param {string} pathProcessed 
 * @return {promise}
 */

const grayScale = ((filePath, pathProcessed) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(pathProcessed, (err) => {
      if (err) {
        reject (err)
      }
    })
    for (let i = 0; i < (filePath.length); i++) {
      fs.createReadStream(filePath[i])
      .pipe(
        new PNG()
      )
      .on("parsed", function() {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            let idx = (this.width * y + x) << 2;
            let red = this.data[idx];
            let green = this.data[idx + 1];
            let blue = this.data[idx + 2];
            let gray = ((red+green+blue)/3);
            this.data[idx] = gray;
            this.data[idx + 1] = gray;
            this.data[idx + 2] = gray;
          }
        }
      this.pack().pipe(fs.createWriteStream((path.join(pathProcessed, `out${i}.png`))));
      })
      .on("error", () => reject("Error occured during grayscale"))
    }
    resolve();
  })
});
  
module.exports = {
  unzip,
  readDir,
  grayScale
};