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
  const listNews = {};
  for (const typeSearch of SEARCH_TYPE) {
    console.log("Start search", typeSearch);
    const response = await getAllNewsInfo(typeSearch);
    // console.log(response);
    const position = await bootstrapSheet(response, typeSearch);
    listNews[typeSearch] = position;
  }
  // const response = await getAllNewsInfo("search-3");
  // await bootstrapSheet(response, "search-3");
  // await aiSummorrize("search-1");
  return listNews;
};
//
// mainSearch();

const mainSummorize = async (listNews) => {
  for (const typeSearch of SEARCH_TYPE) {
    console.log("Start search", typeSearch);
    await exponentialBackoff(2);
    await aiSummorrize(typeSearch, listNews[typeSearch]);
  }
  // await aiSummorrize("search-3");
};

// mainSummorize();

const main = async () => {
  const listNews = await mainSearch();
  await mainSummorize(listNews);
};
// main();
// cron.schedule("1,2,4,5 * * * *", () => {
//   console.log("running every minute 1, 2, 4 and 5");
// });

// cron.schedule("* * * * *", () => {
//   console.log("running a task every minute");
// });

cron.schedule(
  "35 14 * * *",
  async () => {
    const listNews = await mainSearch();
    await mainSummorize(listNews);
  },
  { timezone: "Europe/Kiev" }
);
// cron.schedule(
//   "0 7 * * *",
//   () => {
//     mainSummorize();
//   },
//   { timezone: "America/New_York" }
// );
