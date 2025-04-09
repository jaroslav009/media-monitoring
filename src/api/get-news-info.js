import { DOMAIN_NEWS_CATCHER } from "../constant/globalConst.js";
import dotenv from "dotenv";
dotenv.config();

export const exponentialBackoff = (retries) => {
  return new Promise((resolve) => {
    const delay = Math.pow(2, retries) + Math.random();
    setTimeout(resolve, delay * 1000); // Convert to milliseconds
  });
};

export const getNewsInfo = async (typeSearch, page) => {
  let q = "";
  let countries = "";
  switch (typeSearch) {
    case "search-1":
      q = `(("NEC Corporation" OR "NEC Corp*" OR necam OR "NEC America" OR "NEC Labs" OR "NEC USA" OR "NEC Laboratories" OR "NEC Financial Services" OR "@nec" OR "NEC NSS" OR ("NEC" AND "National Security Systems")) 
NOT 
("ANC" OR "National Executive Council" OR "National Economic Council" OR "Labour National Executive" OR "Northeast Corridor" OR "northeast conference" OR "Merrimack" OR "New England College" OR "Binghamton" OR "Liu" OR "Saint Joseph's" OR "Central Connecticut State" OR "Sacred Heart" OR "NEC Championship" OR "NEC Arena" OR "National Exhibition Centre" OR "necrotizing enterocolitis"))
`;
      countries = "US";
      break;
    case "search-2":
      q = `"facial recognition" AND "Madison Square Garden"`;
      countries = "US";
      break;
    case "search-3":
      q = `"facial recognition" OR "Face recognition"`;
      countries = "US,CA";
      break;
    default:
      break;
  }
  const response = await fetch(
    `${DOMAIN_NEWS_CATCHER}api/search?` +
      new URLSearchParams({
        q,
        lang: "en",
        countries,
        by_parse_date: "false",
        sort_by: "relevancy",
        ranked_only: true,
        page: `${page}`,
        page_size: "100",
        include_nlp_data: true,
        has_nlp: true,
      }).toString(),
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-token": process.env.NEWS_CATCHER_API_KEY,
      },
    }
  );
  const json = await response.json();
  console.log("response321123", json.articles);
  // const response = await axios.get(`${DOMAIN_NEWS_CATCHER}api/search`, {
  //   params: {
  //     q,
  //     search_in: "title_content",
  //     lang: "en",
  //     countries,
  //     by_parse_date: "false",
  //     sort_by: "relevancy",
  //     ranked_only: true,
  //     page: `${page}`,
  //     page_size: "100",
  //     include_nlp_data: true,
  //     has_nlp: true,
  //   },
  //   headers: {
  //     accept: "application/json",
  //     "x-api-token": "E6_kUQ0O-Nh1Gfi6lnbxddYZ4k-yugSr",
  //   },
  // });
  return json;
};

export const getAllNewsInfo = async (typeSearch) => {
  const responseArr = [];
  let retries = 0;
  let index = 0;
  const resultFirstPage = await getNewsInfo(typeSearch, 1);

  if (resultFirstPage?.total_pages) {
    const pageArr = Array.from(
      { length: resultFirstPage?.total_pages || 0 },
      (_, i) => i + 1
    );
    console.log("pageArr,", pageArr.length);

    for (const page of pageArr) {
      console.log("Start get news info", { page, typeSearch });
      try {
        const result = await getNewsInfo(typeSearch, page);
        await exponentialBackoff(0.5);

        responseArr.push(result);
        retries = 0;
        console.log("index,", index);
        index++;
      } catch (error) {
        if (error.status === 429) {
          retries += 1;
          await exponentialBackoff(retries); // Wait with exponential backoff
          continue; // Retry the current page
        }
        console.log("Error get news info", error);
      }
    }
  }
  console.log(responseArr.length);
  return responseArr;
};
