const cheerio = require("cheerio");
/**
 * Process the html returned from the request and generates the JSON.
 * @param  {string} html html string to be parsed
 * @return {Object}      worldreference object
 */
module.exports = (html) => {
  var $ = cheerio.load(html);
  var result = {};
  result.word = $("h3.headerWord").text();
  result.pronWR = $("span#pronWR").text();
  result.audio = $("div#listen_widget audio source")
    .map(function (i, el) {
      return $(this).attr("src");
    })
    .get();
  var tables = $("table.WRD")
    .map(function (i, el) {
      return $(this).html();
    })
    .get();
  result.translations = tables.map(WRDtableMap);

  return result;
};
/**
 * Parses the a table.WRD html element and return it as a json
 * @param {String} html table.WRD html
 * @return {Object} table parsed
 */
function WRDtableMap(html) {
  // read the html and set the object to be returned
  var $ = cheerio.load(html, null, false);
  var result = {};
  result.title = "";
  result.translations = [];

  //iterate for each tr element
  $("tr").map(function (i, el) {
    var element = $(this);
    var html = element.html();
    // set the title
    if (isHeaderItem(element)) {
      // Creates a header item
      result.title = element.text();
    } else if (isTranslationItem(element)) {
      // create a "translations element"
      result.translations.push(createTranslationItem(html));
    } else if (isAdditionalTo(html)) {
      if (result.translations.length > 0)
        result.translations[result.translations.length - 1].to += ", " + getAdditionalTo(html);
    } else if (isExampleItem(element)) {
      // Adds the examples
      result = pushExample(result, html);
    }
  });
  return result;
}
/*
 * Creates a translation item from the tr provided as html
 * @param  {String} html
 * @return {String}
 */
function createTranslationItem(html) {
  var $ = cheerio.load(html, null, false);
  var from = $("strong").text();
  $(".ToWrd em span").remove();
  $(".FrWrd em span").remove();
  var fromType = $(".FrWrd em").text();
  var toType = $(".ToWrd em").text();
  $(".ToWrd em").remove();
  var to = $(".ToWrd").text().replace("⇒", "").trim();
  $(".FrWrd").remove();
  $(".ToWrd").remove();
  var from2 = $("td").text();
  return {
    from,
    from2,
    fromType,
    toType,
    to,
    example: {
      from: [],
      to: [],
    },
  };
}
/**
 * push an example item contained in the html in the obj
 * @param  {Object} obj
 * @param  {String} html
 * @return {Object}
 */
function pushExample(obj, html) {
  var $ = cheerio.load(html, null, false);

  if ($(".FrEx").text() !== "") {
    obj.translations[obj.translations.length - 1].example.from.push($(".FrEx").text());
  } else if ($(".ToEx").text() !== "") {
    var txt = $(".ToEx").text();
    if (!txt.includes("Questa frase non è una traduzione della frase inglese."))
      obj.translations[obj.translations.length - 1].example.to.push(txt);
  }

  return obj;
}

function getAdditionalTo(html) {
  var $ = cheerio.load(html, null, false);
  var additionalTo = "";
  if ($(".To2 span i").length > 0) {
    additionalTo = $(".To2 span i").text();
    if (additionalTo) additionalTo = "(" + additionalTo + ") ";
  }
  if ($(".ToWrd").length > 0) {
    $("em").remove();
    additionalTo += $(".ToWrd").text().trim();
    //if ($(".ToWrd span").length > 0) additionalTo += $(".ToWrd span").text();
  }
  return additionalTo;
}
function isHeaderItem(element) {
  return element.attr("class") === "wrtopsection";
}

function isAdditionalTo(html) {
  var $ = cheerio.load(html, null, false);
  return $(".ToWrd").length > 0;
}

function isTranslationItem(element) {
  var id = element.attr("id");
  var clss = element.attr("class");
  return id !== undefined && (clss === "even" || clss === "odd");
}
function isExampleItem(element) {
  var id = element.attr("id");
  var clss = element.attr("class");
  return id === undefined && (clss === "even" || clss === "odd");
}
