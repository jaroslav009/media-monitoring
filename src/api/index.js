import { aiSummorrize } from "./aiSummorize.js";
import { getAllNewsInfo } from "./get-news-info.js";
import { bootstrapSheet } from "./sheet-util.js";
import { LocalStorage as LocalStorageLib } from "node-localstorage";
import cron from "node-cron";

import dotenv from "dotenv";
dotenv.config();

global.localStorage = new LocalStorageLib("./scratch");

const SEARCH_TYPE = ["search-1", "search-2", "search-3"];

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = LocalStorageLib;
  localStorage = new LocalStorage("./scratch");
}

export const exponentialBackoff = (retries) => {
  return new Promise((resolve) => {
    const delay = Math.pow(2, retries) + Math.random();
    setTimeout(resolve, delay * 1000); // Convert to milliseconds
  });
};

const mainSearch = async () => {
  for (const typeSearch of SEARCH_TYPE) {
    console.log("Start search", typeSearch);
    const response = await getAllNewsInfo(typeSearch);
    // console.log(response);
    await bootstrapSheet(response, typeSearch);
  }
  // const response = await getAllNewsInfo("search-3");
  // await bootstrapSheet(response, "search-3");
  // await aiSummorrize("search-1");
};
//
// mainSearch();

const mainSummorize = async () => {
  for (const typeSearch of SEARCH_TYPE) {
    console.log("Start search", typeSearch);
    await exponentialBackoff(2);
    await aiSummorrize(typeSearch);
  }
  // await aiSummorrize("search-3");
};

// mainSummorize();

const main = async () => {
  await mainSearch();
  // await mainSummorize();
};

// cron.schedule("1,2,4,5 * * * *", () => {
//   console.log("running every minute 1, 2, 4 and 5");
// });

// cron.schedule("* * * * *", () => {
//   console.log("running a task every minute");
// });

cron.schedule("0 6 * * *", () => {
  main();
});
