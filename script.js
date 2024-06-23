var ipQ = "";
var ipURL = "";
var ignoreInput = 0;

//FIX: Autocomplete - when pressing enter after typing location name, it invokes autocomplete list
// FIX: AUtocomplete - when deleting entire string the autocomplete menu don't disappear
/*TODO: Implement simple autocomplete results filter, don't fetch stuff that isn't like a city, state, or country, also some results are in
incredibly close proximity, it should be possible to get rid of it */
//WARNING: check if compass position is being reseted after typing another location in the same session
//FIX: UV bar position on resize is not correct;
//TODO: Catch errors related to unavailability in finding location from input string
//FIX: Improve CSS for responsibility - font sizes on smaller devices, scrollbars on the same position if possible, the info in panels stretch to single
//line, when resizing, panels on the left side are not equally squeezed
//FIX: Informations like using UV protection until given hour don't properly change, when we reach the hour that we should use the protection, it
//should disappear until we are in the proper hour range
//FIX: Data for current day is not correct, fetch data for a given day and current hour instead of using approximated values;
//
function adjustPanelSize(panels = 6) {
  var container = document.body
    .getElementsByClassName("forecast-container")
    .item(0);

  var containerWidth = parseFloat(getComputedStyle(container).width);

  var VISIBLE_PANELS = panels;
  var PANEL_GAP = parseFloat(getComputedStyle(container).gap);

  var calculatedPanelSize =
    (containerWidth - (VISIBLE_PANELS - 1) * PANEL_GAP) / VISIBLE_PANELS;
  var NewPanelSizeInPercentage = (calculatedPanelSize * 100) / containerWidth;

  for (var i = 0; i < 26; i++) {
    var panel = container.getElementsByClassName("panel").item(i);
    panel.style.width = String(calculatedPanelSize + "px");
  }

  var container = document.body
    .getElementsByClassName("forecast-container")
    .item(1);
  for (var i = 0; i < 10; i++) {
    var panel = container.getElementsByClassName("panel").item(i);
    panel.style.width = String(calculatedPanelSize + "px");
  }
}

function adjustPanelsAmonut() {
  if (window.matchMedia("(max-width: 1200px)").matches) {
    adjustPanelSize(5);
  }
  if (window.matchMedia("(max-width: 768px)").matches) {
    adjustPanelSize(3);
  }
}

function adjustBackgroundPos() {
  var background = document.body.getElementsByClassName("wrapper").item(1);
  var panelBackground = document.body;

  var panelImageDim =
    getComputedStyle(panelBackground).backgroundSize.split(" ");

  panelImageDim = [parseFloat(panelImageDim[0]), parseFloat(panelImageDim[1])];

  if (
    // parseFloat(getComputedStyle(panelBackground).width) >
    // parseFloat(getComputedStyle(panelBackground).height) * 1.6
    panelBackground.getBoundingClientRect().width >
    panelBackground.getBoundingClientRect().height * 1.6
  ) {
    panelBackground.style.backgroundSize =
      // getComputedStyle(panelBackground).width +
      // " " +
      // parseFloat(getComputedStyle(panelBackground).width) / 1.6 +
      // "px";

      panelBackground.getBoundingClientRect().width +
      "px" +
      " " +
      panelBackground.getBoundingClientRect().width / 1.6 +
      "px";
  } else {
    panelBackground.style.backgroundSize =
      // parseFloat(getComputedStyle(panelBackground).height) * 1.6 +
      // "px" +
      // " " +
      // getComputedStyle(panelBackground).height;
      panelBackground.getBoundingClientRect().height * 1.6 +
      "px" +
      " " +
      panelBackground.getBoundingClientRect().height +
      "px";
  }

  background.style.backgroundSize = panelBackground.style.backgroundSize;

  background.style.backgroundPositionX =
    -background.getBoundingClientRect().left + "px";
  background.style.backgroundPositionY =
    -background.getBoundingClientRect().top + "px";
}

window.addEventListener("load", (event) => {
  adjustBackgroundPos();
  adjustPanelsAmonut();
});

window.addEventListener("resize", (event) => {
  document
    .getElementsByClassName("input")
    .item(0)
    .scrollTo(0, document.getElementsByClassName("input").item(0).scrollHeight);

  adjustPanelSize();
  adjustPanelsAmonut();
  controlInputFieldHeight();
  adjustBackgroundPos();
  setUVIndexOnScale();

  if (
    document.body.getElementsByClassName("autocomplete-wrapper").item(0).style
      .display === "flex" &&
    document.body
      .getElementsByClassName("autocomplete")
      .item(0)
      .getElementsByClassName("link").length > 3
  ) {
    setAutocompleteHeight();
  }
});

function setInputField(address) {
  var inputField = document.body.getElementsByClassName("input").item(0);
  inputField.innerText = address;
}

document
  .getElementsByClassName("weather-app")
  .item(0)
  .getElementsByClassName("wrapper")
  .item(0)
  .addEventListener("scroll", (event) => {
    adjustBackgroundPos();
  });

function setAPIandFetch(position) {
  var base =
    "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
  var key = "RCUMANR55PYX597H8HVA76TXL";
  // var key = "TWLUVFEP8JG3DYXCQTZ66XJ7Z"; //test key
  // var date = "2024-03-10";
  fetchData(
    base +
      position +
      "/" +
      // "2023-10-29/2023-10-30/" +
      // "2024-03-31/2024-04-01/" +
      "?unitGroup=metric&iconSet=icons2&lang=en&key=" +
      key,
  );
}

function processAutocompleteLink(name, coords) {
  setAPIandFetch(coords);
  setInputField(name);

  document.body
    .getElementsByClassName("autocomplete-wrapper")
    .item(0).style.display = "none";
}

window.addEventListener("load", (event) => {
  currentLocationWeather();
  adjustPanelSize();
  var height = parseFloat(
    getComputedStyle(document.body.getElementsByClassName("input").item(0))
      .height,
  );
  controlInputFieldHeight(height);
});

function currentLocationWeather() {
  var revGeocodeBase = "https://api.geoapify.com/v1/geocode/reverse?";
  var key = "49f3ae5a400e4337996df170cda571d5";
  var lang = "en";
  var resolvedLocation = "";

  var coords = navigator.geolocation.getCurrentPosition(function (pos) {
    var position =
      "lat=" + pos.coords.latitude + "&" + "lon=" + pos.coords.longitude;
    // console.log(revGeocodeBase + position + "&lang=" + lang + "&apiKey=" + key);
    fetch(revGeocodeBase + position + "&lang=" + lang + "&apiKey=" + key)
      .then((response) => response.json())
      .then((data) => {
        resolvedLocation = JSON.stringify(
          data.features[0].properties.formatted,
        );
        setAPIandFetch(resolvedLocation);
        setInputField(resolvedLocation);
      });
  });
}

window.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    document.body
      .getElementsByClassName("autocomplete-wrapper")
      .item(0).style.display = "none";
    var inputValue = document.body.getElementsByClassName("input").item(0);
    inputValue.scrollTo(0, 0);

    var base = "https://api.geoapify.com/v1/geocode/search?text=";
    var key = "49f3ae5a400e4337996df170cda571d5";
    fetch(base + inputValue.innerText + "&apiKey=" + key)
      .then((response) => response.json())
      .then((data) => {
        if (data.features.length > 0) {
          // var corod-
          var coords =
            JSON.stringify(data.features[0].properties.lat) +
            "," +
            JSON.stringify(data.features[0].properties.lon);
          setAPIandFetch(coords);
          setInputField(JSON.stringify(data.features[0].properties.formatted));
        } else {
          throw new Error("Invalid name");
        }
      })
      .catch((e) => {
        handleError();
      });
  }
});

function handleError() {
  document.body.style.backgroundImage = "none";
  document.body.style.backgroundColor = "#3D3D3D";
  document.body
    .getElementsByClassName("left")
    .item(0)
    .getElementsByClassName("wrapper")
    .item(0).style.backgroundImage = "none";
  document.body
    .getElementsByClassName("left")
    .item(0)
    .getElementsByClassName("wrapper")
    .item(0).style.backgroundColor = "#3D3D3D";

  var error = document.body.getElementsByClassName("weather").item(0).children;

  error.item(0).innerText = "Error!";
  error.item(1).innerText = "";

  var errorName = document.body
    .getElementsByClassName("weather-description")
    .item(0);
  errorName.innerText = "Invalid name";

  var errorDesc = document.body
    .getElementsByClassName("precise-description")
    .item(0);
  errorDesc.innerText =
    "Oops! We can't find data for your given location! Check your spelling and try again!";
}

function performFetch() {
  var inputField = document.getElementsByClassName("input").item(0).innerText;
  var autocompleteBase =
    "https://api.geoapify.com/v1/geocode/autocomplete?text=";

  var key = "49f3ae5a400e4337996df170cda571d5";
  var autocompleteWrapper = document
    .getElementsByClassName("autocomplete-wrapper")
    .item(0);
  var autocompleteList = document
    .getElementsByClassName("autocomplete")
    .item(0);

  if (inputField.length > 2) {
    fetch(autocompleteBase + inputField + "&type=city" + "&apiKey=" + key)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (
          JSON.stringify(data.statusCode) === "400" ||
          data.features.length === 0
        ) {
          autocompleteWrapper.style.display = "none";
          return;
        }

        autocompleteWrapper.style.display = "flex";
        autocompleteList.innerHTML = "";
        for (var i = 0; i < data.features.length; i++) {
          if (data.features.length > 0) {
            var item = document.createElement("a");
            var itemName = JSON.stringify(
              data.features[i].properties.formatted,
            );
            item.innerText = JSON.stringify(
              data.features[i].properties.formatted,
            );
            // console.log(data);
            item.onclick = (function (itemName) {
              var coords =
                JSON.stringify(data.features[i].properties.lat) +
                "," +
                JSON.stringify(data.features[i].properties.lon);
              return function () {
                processAutocompleteLink(itemName, coords);
              };
            })(itemName);
            item.className = "link";
            autocompleteList.appendChild(item);
          }
        }

        filterResults(data);

        if (data.features.length > 3) {
          setAutocompleteHeight();
        } else {
          document.body
            .getElementsByClassName("autocomplete")
            .item(0).style.height = "auto";
        }
      });
  }
}

function filterResults(result) {
  // alert(result);
}

const debounce = (mainFunction, delay) => {
  // Declare a variable called 'timer' to store the timer ID
  let timer;

  // Return an anonymous function that takes in any number of arguments
  return function (...args) {
    // Clear the previous timer to prevent the execution of 'mainFunction'
    clearTimeout(timer);

    // Set a new timer that will execute 'mainFunction' after the specified delay
    timer = setTimeout(() => {
      mainFunction(...args);
    }, delay);
  };
};
var performFetch = debounce(performFetch, 200);

window.addEventListener("keydown", (event) => {
  // if (event.key === " ") {
  //   event.preventDefault();
  // }
  if (event.key === "Enter") {
    event.preventDefault();
  }

  controlInputFieldHeight();
  adjustBackgroundPos();
});

function setAutocompleteHeight() {
  var links = document.getElementsByClassName("link");
  var menu = document.getElementsByClassName("autocomplete").item(0);
  var newHeight = 0;

  for (var i = 0; i < 3; i++) {
    newHeight += links.item(i).getBoundingClientRect().height;
  }

  menu.style.height = String(newHeight) + "px";
}

function controlInputFieldHeight(maxInputFieldHeight) {
  var inputField = document.body.getElementsByClassName("input").item(0);
  var mainContainer = document.body.getElementsByClassName("searchbar").item(0);
  var pinIcon = document.body.getElementsByClassName("pin").item(0);

  var referenceField = document.body
    .getElementsByClassName("reference")
    .item(0);

  inputField.style.maxHeight = getComputedStyle(referenceField).height;
  // console.log(inputField.style.maxHeight);
}

window.addEventListener("scroll", (event) => {});

window.addEventListener("keyup", (event) => {
  if (event.key != "Escape" && event.key != "Alt" && event.key != "Enter") {
    performFetch();
  }
  adjustBackgroundPos();
});

window.addEventListener("mousedown", (event) => {
  var menu = document.body
    .getElementsByClassName("autocomplete-wrapper")
    .item(0);
  var menuPosition = menu.getBoundingClientRect();

  console.log(menu);

  if (
    menu.style.display != "none" &&
    (event.clientX < menuPosition.left ||
      event.clientX > menuPosition.right ||
      event.clientY < menuPosition.top ||
      event.clientY > menuPosition.bottom)
  ) {
    menu.style.display = "none";
    console.log("here");
  }
});

var weatherIconBasePath = "./icons/weather/";

var week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function fetchData(url) {
  fetch(url)
    .then((response) => response.json())

    .then((data) => {
      // setInputField(JSON.stringify(data.properties.))
      console.log(data);
      var realcast = document.body
        .getElementsByClassName("realtime-container")
        .item(0);

      var hourlyForecast = document.body
        .getElementsByClassName("hourly-forecast")
        .item(0);
      var forecast = document.body.getElementsByClassName("forecast").item(0);

      var currentTemp = document.body
        .getElementsByClassName("weather")
        .item(0)
        .getElementsByClassName("temp")
        .item(0);
      var currentDesc = document.body
        .getElementsByClassName("weather-description")
        .item(0);
      var currentDetailedDesc = document.body
        .getElementsByClassName("precise-description")
        .item(0);

      currentTemp.innerHTML = JSON.stringify(data.currentConditions.temp);
      currentDesc.innerHTML = JSON.stringify(
        data.currentConditions.conditions,
      ).slice(1, -1);
      currentDetailedDesc.innerHTML = JSON.stringify(data.description).slice(
        1,
        -1,
      );

      var feelsLike = realcast.getElementsByClassName("realtime-value").item(0);

      var apparentTempExplanation = realcast
        .getElementsByClassName("realtime-desc")
        .item(0);
      var precipitation = realcast
        .getElementsByClassName("precipitation-value")
        .item(0);
      var precipitationDescValue = realcast
        .getElementsByClassName("precipitation-expected-value")
        .item(0);

      feelsLike.innerHTML = JSON.stringify(data.currentConditions.feelslike);

      if (Number(feelsLike.innerText) > Number(currentTemp.innerText)) {
        apparentTempExplanation.innerHTML = "Humidity is making it feel warmer";
      } else if (
        Number(feelsLike.innerText) === Number(currentTemp.innerText)
      ) {
        apparentTempExplanation.style.display = "none";
      } else {
        apparentTempExplanation.innerHTML = "Wind is making it feel colder";
      }

      precipitation.innerHTML = JSON.stringify(data.currentConditions.precip);
      precipitationDescValue.innerText = JSON.stringify(data.days[1].precip);

      var visibility = realcast
        .getElementsByClassName("visibility-value")
        .item(0);
      visibility.innerText = JSON.stringify(data.currentConditions.visibility);

      var humidity = realcast.getElementsByClassName("humidity-value").item(0);
      var dewPoint = realcast.getElementsByClassName("dew-value").item(0);

      humidity.innerText = JSON.stringify(data.currentConditions.humidity);
      dewPoint.innerHTML = JSON.stringify(data.currentConditions.dew);

      var uv = document.body.getElementsByClassName("uv-index").item(0);
      var uvValue = uv.getElementsByClassName("uv-value").item(0);
      var uvDesc = uv.getElementsByClassName("uv-desc").item(0);

      uvValue.innerHTML = JSON.stringify(data.currentConditions.uvindex);

      if (Number(uvValue.innerHTML) <= 2) {
        uvDesc.innerHTML = "Low";
      } else if (
        Number(uvValue.innerHTML) >= 3 &&
        Number(uvValue.innerHTML) <= 5
      ) {
        uvDesc.innerHTML = "Moderate";
      } else if (
        Number(uvValue.innerHTML) >= 6 &&
        Number(uvValue.innerHTML) <= 7
      ) {
        uvDesc.innerHTML = "High";
      } else if (
        Number(uvValue.innerHTML) >= 8 &&
        Number(uvValue.innerHTML) <= 10
      ) {
        uvDesc.innerHTML = "Very high";
      } else if (Number(uvValue.innerHTML) === 11) {
        uvDesc.innerHTML = "Extreme";
      }

      var uvTip = uv.getElementsByClassName("uv-tip").item(0);

      var wind = document.body.getElementsByClassName("wind").item(0);
      var windSpeed = wind.getElementsByClassName("wind-value").item(0);
      var windGusts = wind.getElementsByClassName("gust-value").item(0);

      var windNeedle = wind.getElementsByClassName("needle").item(0);

      windSpeed.innerHTML = JSON.stringify(data.currentConditions.windspeed);
      windGusts.innerHTML = JSON.stringify(data.currentConditions.windgust);

      // IIFE - Immediately Invoked Function Expression - Anonymous function
      // running as its defined.

      windNeedle.style.transform = "rotate" + "(";
      JSON.stringify(data.currentConditions.winddir) + "deg)";

      setUVIndexOnScale(Number(uvValue.innerHTML));

      var date = luxon.DateTime;
      // var localDate = date.local(2024, 3, 31, 0, 0, 0);
      // var localDate = date.local(2023, 10, 29, 3, 0, 0);
      // localDate = localDate.plus({ hour: 1 });
      // "2023-10-29/2023-10-30/" +
      var localDate = date.local();
      var time = localDate.setZone(JSON.stringify(data.timezone).slice(1, -1));
      setBackground(
        JSON.stringify(data.currentConditions.icon),
        time.c.hour,
        JSON.stringify(data.currentConditions.sunrise),
        JSON.stringify(data.currentConditions.sunset),
      );

      if (Number(JSON.stringify(data.currentConditions.uvindex)) <= 2) {
        uvTip.style.display = "none";
      } else {
        for (var t = time, flag = 1; flag === 1; ) {
          if (
            Number(
              JSON.stringify(
                data.days[t.c.day - time.c.day].hours[t.c.hour].uvindex,
              ),
            ) <= 2
          ) {
            uvTip.style.display = "initial";
            uvTip.innerText = "Use sun protection until " + t.c.hour + ":00";
            flag = 0;
          }
          t = t.plus({
            hour: 1,
          });
        }
      }

      var dayIdx = 0;
      for (var i = 0; i < 10; i++) {
        var forecastPanel = forecast.getElementsByClassName("panel").item(i);
        forecastPanel.style.display = "flex";

        var dayOfWeek = forecastPanel.getElementsByClassName("time").item(0);
        var date = forecastPanel.getElementsByClassName("date").item(0);
        dayOfWeek.innerText = week[time.weekday - 1];

        var temp = forecastPanel
          .getElementsByClassName("forecast-temp")
          .item(0);
        var icon = forecastPanel.getElementsByClassName("icon").item(0);

        date.innerHTML = JSON.stringify(data.days[dayIdx].datetime).slice(
          6,
          -1,
        );
        temp.innerHTML = JSON.stringify(data.days[dayIdx].temp);
        icon.src = weatherIconBasePath + data.days[dayIdx].icon + ".svg";

        if (i === 0) {
          date.innerHTML = "Today";
        }

        if (dayIdx === 7) {
          dayIdx = 0;
        }

        dayIdx += 1;
        time = time.plus({ day: 1 });
      }

      time = localDate.setZone(JSON.stringify(data.timezone).slice(1, -1));
      console.log(time);
      dayRef = time.c.day;

      var timeIdx = getTimeIdx(data, time);
      var dayIdx = 0;
      var end = findEnd(data, time);
      console.log("end", end);

      for (var i = 0; dayIdx === 0 || (dayIdx === 1 && timeIdx <= end); i++) {
        var forecastPanel = hourlyForecast
          .getElementsByClassName("panel")
          .item(i);

        forecastPanel.style.display = "flex";

        var hour = forecastPanel.getElementsByClassName("weather-time").item(0);
        var temp = forecastPanel.getElementsByClassName("temperature").item(0);
        var icon = forecastPanel.getElementsByClassName("icon").item(0);

        hour.innerHTML = JSON.stringify(
          data.days[dayIdx].hours[timeIdx].datetime,
        ).slice(1, -4);

        temp.innerHTML = JSON.stringify(data.days[dayIdx].hours[timeIdx].temp);
        icon.src =
          weatherIconBasePath + data.days[dayIdx].hours[timeIdx].icon + ".svg";

        if (i === 0) {
          hour.innerHTML = "Now";
        }

        timeIdx += 1;
        if (timeIdx >= data.days[dayIdx].hours.length) {
          timeIdx = 0;
          dayIdx += 1;
        }
      }
    });
}

function getTimeIdx(data, date) {
  var targetHour = date.c.hour;

  console.log(date.c.hour);
  var result = 0;
  for (var i = 0; i < data.days[0].hours.length; i++) {
    result = i;
    if (
      Number(JSON.stringify(data.days[0].hours[i].datetime).slice(1, 3)) ===
      targetHour
    ) {
      break;
    }
  }

  if (date.minus({ hour: 1 }).c.hour === targetHour) {
    result += 1;
  }

  return result;
}

function findEnd(data, date) {
  var returnValue = 0;

  for (var i = 0; i < data.days[1].hours.length; i++) {
    returnValue = i;
    if (
      Number(JSON.stringify(data.days[1].hours[i].datetime).slice(1, 3)) >=
      date.c.hour
    ) {
      break;
    }
  }

  if (date.c.hour === date.plus({ hour: 1 })) {
    returnValue += 1;
  }

  return returnValue;
}

function setUVIndexOnScale(value) {
  var uv = document.body.getElementsByClassName("uv-index").item(0);
  var uvArea = uv.getElementsByClassName("visualizer").item(0);

  var uvBar = uv.getElementsByClassName("hunt").item(0);
  var barWidth = window.getComputedStyle(uvBar);

  var result = parseFloat(barWidth.width) / 10;

  if (document.getElementsByClassName("pointer").item(0) !== null) {
    document.getElementsByClassName("pointer").item(0).remove();
  }
  var p = document.createElement("img");
  p.className = "pointer";

  p.src = "./icons/pointer.svg"; 
  p.style.width = parseFloat(getComputedStyle(uvArea).height) + 8 + "px";
  p.style.height = p.style.width;
  p.style.position = "absolute";

  p.style.top = "0px";
  p.style.right = "0px";
  uvArea.appendChild(p);
  // p.style.visibility = "hidden";

  var pointerHeightToCenter = parseFloat(getComputedStyle(p).height) / 2;
  var barHeightToCenter = parseFloat(barWidth.height) / 2;

  var height = barHeightToCenter - pointerHeightToCenter;

  var oneLevelWidth = parseFloat(barWidth.width) / 11;
  console.log(oneLevelWidth);

  var pointerXOffset =
    oneLevelWidth / 2 - parseFloat(getComputedStyle(p).width) / 2;

  // p.style.left = String(oneLevelWidth * value + pointerXOffset) + "px";
  var value = Number(
    document.getElementsByClassName("uv-value").item(0).innerText,
  );

  p.style.left = String(value * oneLevelWidth + pointerXOffset) + "px";
  p.style.top = String(height) + "px";
}

function setBackground(arg, time, sunrise, sunset) {
  var background = document.body;
  var backgroundWindow = document.body
    .getElementsByClassName("wrapper")
    .item(1);

  // background.style.backgroundImage = "url('./sun.jpg')";
  // backgroundWindow.style.backgroundImage = "url('./sun.jpg')";

  var location = "./backgrounds/";
  var extension = ".jpg";

  background.style.backgroundImage =
    "url" + "('" + location + arg.slice(1, -1) + extension + "')";
  backgroundWindow.style.backgroundImage = background.style.backgroundImage;
}
