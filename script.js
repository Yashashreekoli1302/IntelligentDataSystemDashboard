// ===================================================
// TASK 1 - sensor alert table
// ===================================================

var sensors = [
  { sensorId: "S1", metric: "Temperature", value: 85, threshold: 75 },
  { sensorId: "S2", metric: "Pressure", value: 60, threshold: 80 },
  { sensorId: "S3", metric: "Humidity", value: 92, threshold: 70 },
  { sensorId: "S4", metric: "Vibration", value: 30, threshold: 50 },
  { sensorId: "S5", metric: "Voltage", value: 245, threshold: 230 },
  { sensorId: "S6", metric: "CPU Load", value: 55, threshold: 90 }
];

function showAlertTable() {
  // keep only the sensors that crossed their limit
  var breached = sensors.filter(function (s) {
    return s.value > s.threshold;
  });

  // add an "excess" field to each one using map
  var rows = breached.map(function (s) {
    return {
      sensorId: s.sensorId,
      metric: s.metric,
      value: s.value,
      threshold: s.threshold,
      excess: s.value - s.threshold
    };
  });

  // reduce to get the total excess
  var totalExcess = rows.reduce(function (sum, r) {
    return sum + r.excess;
  }, 0);

  document.getElementById("summary").textContent =
    breached.length + " of " + sensors.length +
    " sensors are over their limit (total excess: " + totalExcess + ")";

  // build the table
  var table = document.createElement("table");

  var headRow = document.createElement("tr");
  var headings = ["Sensor", "Metric", "Value", "Threshold", "Excess"];
  headings.forEach(function (h) {
    var th = document.createElement("th");
    th.textContent = h;
    headRow.appendChild(th);
  });
  table.appendChild(headRow);

  rows.forEach(function (r) {
    var tr = document.createElement("tr");
    var cells = [r.sensorId, r.metric, r.value, r.threshold, "+" + r.excess];
    cells.forEach(function (c, i) {
      var td = document.createElement("td");
      td.textContent = c;
      if (i === 4) {
        td.className = "over";
      }
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  document.getElementById("alert-table").appendChild(table);
}

showAlertTable();


// ===================================================
// TASK 2 - TreeWalker to find offline nodes
// ===================================================

document.getElementById("scan-btn").addEventListener("click", function () {
  var dashboard = document.getElementById("dashboard");

  // filter function: accept only elements with data-status="offline"
  var myFilter = {
    acceptNode: function (node) {
      if (node.getAttribute("data-status") === "offline") {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
    }
  };

  var walker = document.createTreeWalker(
    dashboard,
    NodeFilter.SHOW_ELEMENT,
    myFilter
  );

  var count = 0;
  var names = [];
  var current = walker.nextNode();

  while (current) {
    current.style.backgroundColor = "red";
    current.classList.add("warning-state");
    names.push(current.textContent);
    count++;
    current = walker.nextNode();
  }

  document.getElementById("scan-result").textContent =
    "Found " + count + " offline: " + names.join(", ");
});


// ===================================================
// TASK 3 - event flow (capturing / bubbling)
// ===================================================

var outer = document.getElementById("chart-outer");
var body = document.getElementById("chart-body");
var bars = document.querySelectorAll(".bar");
var stopBox = document.getElementById("stop-box");
var eventInfo = document.getElementById("event-info");
var eventLog = document.getElementById("event-log");
var step = 0;

function logStep(text) {
  step++;
  var li = document.createElement("li");
  li.textContent = text;
  eventLog.appendChild(li);
}

// 1) capturing listener on the outer container (useCapture = true)
outer.addEventListener("click", function (event) {
  // new click -> clear the old log (capture runs first)
  eventLog.textContent = "";
  step = 0;
  logStep("CAPTURE on outer container");
}, true);

// 2) bubbling listener on the bars (useCapture = false)
bars.forEach(function (bar) {
  bar.addEventListener("click", function (event) {
    logStep("BUBBLE on bar " + bar.textContent);

    // show the event properties
    eventInfo.textContent =
      "target: " + event.target.id + "\n" +
      "currentTarget: " + event.currentTarget.id + "\n" +
      "clientX: " + event.clientX + "\n" +
      "clientY: " + event.clientY;

    if (stopBox.checked) {
      event.stopPropagation();
      logStep("stopPropagation() called - it stops here");
    }
  }, false);
});

// 3) bubbling listener on chart body
body.addEventListener("click", function (event) {
  logStep("BUBBLE on chart body");

  // stop the link from opening the page
  if (event.target.tagName === "A") {
    event.preventDefault();
    logStep("preventDefault() - link was not opened");
    eventInfo.textContent =
      "target: link (blocked)\n" +
      "currentTarget: " + event.currentTarget.id + "\n" +
      "clientX: " + event.clientX + "\n" +
      "clientY: " + event.clientY;
  }
}, false);

// 4) bubbling listener on outer container
outer.addEventListener("click", function () {
  logStep("BUBBLE on outer container");
}, false);


// ===================================================
// TASK 4 - collapsible section + tooltip (no innerHTML)
// ===================================================

function makeCollapsible(title, contentElements, parent) {
  var wrapper = document.createElement("div");

  var content = document.createElement("div");
  content.className = "collapsible-content";
  contentElements.forEach(function (el) {
    content.appendChild(el);
  });

  var header = document.createElement("div");
  header.className = "collapsible-header";
  header.textContent = "[+] " + title;

  wrapper.appendChild(content);
  // put the header before the content
  wrapper.insertBefore(header, content);

  // start closed
  content.classList.add("hidden");

  header.addEventListener("click", function () {
    content.classList.toggle("hidden");
    if (content.classList.contains("hidden")) {
      header.textContent = "[+] " + title;
    } else {
      header.textContent = "[-] " + title;
    }
  });

  parent.appendChild(wrapper);
}

// makes a span that shows a tooltip when you hover it
function makeTipText(text, tipText) {
  var span = document.createElement("span");
  span.className = "has-tip";
  span.textContent = text;

  var tip = null;

  span.addEventListener("mouseenter", function (e) {
    tip = document.createElement("div");
    tip.className = "tooltip";
    tip.textContent = tipText;
    document.body.appendChild(tip);
    moveTip(tip, e);
  });

  span.addEventListener("mousemove", function (e) {
    if (tip) {
      moveTip(tip, e);
    }
  });

  span.addEventListener("mouseleave", function () {
    if (tip) {
      document.body.removeChild(tip);
      tip = null;
    }
  });

  return span;
}

function moveTip(tip, e) {
  var gap = 12;
  var w = tip.offsetWidth;
  var h = tip.offsetHeight;

  var left = e.clientX + gap;
  var top = e.clientY + gap;

  // if it goes past the right edge, put it on the left of the cursor
  if (left + w > window.innerWidth) {
    left = e.clientX - w - gap;
  }
  // same for the bottom edge
  if (top + h > window.innerHeight) {
    top = e.clientY - h - gap;
  }
  // never go off the top/left
  if (left < 0) left = 0;
  if (top < 0) top = 0;

  tip.style.left = left + "px";
  tip.style.top = top + "px";
}

var area = document.getElementById("collapsible-area");

// first section
var p1 = document.createElement("p");
p1.appendChild(document.createTextNode("A "));
p1.appendChild(makeTipText("threshold", "The limit a sensor value should not go above."));
p1.appendChild(document.createTextNode(" is the safe limit for a metric."));
makeCollapsible("What is a threshold?", [p1], area);

// second section
var p2 = document.createElement("p");
p2.appendChild(document.createTextNode("An "));
p2.appendChild(makeTipText("alert", "Shown in the table when value > threshold."));
p2.appendChild(document.createTextNode(" appears when a sensor goes over its limit."));
var p3 = document.createElement("p");
p3.appendChild(document.createTextNode("Move the mouse to the far right/bottom of the window - the tooltip stays inside the screen."));
makeCollapsible("What is an alert?", [p2, p3], area);


// ===================================================
// TASK 5 - async fetching with error handling
// ===================================================

var failCount = 0;

// pretend server. returns a JSON string after a delay
function fakeServer(forceError) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (forceError) {
        failCount++;
        if (failCount % 2 === 1) {
          // 1st, 3rd... time: network error
          reject(new Error("Network error: server not reachable"));
        } else {
          // 2nd, 4th... time: broken JSON
          resolve('{ "status": "ok", "readings": [ 1, 2, ');
        }
        return;
      }

      var data = {
        status: "ok",
        updated: new Date().toLocaleTimeString(),
        readings: [
          { sensorId: "S1", value: 82 },
          { sensorId: "S2", value: 61 },
          { sensorId: "S3", value: 90 }
        ]
      };
      resolve(JSON.stringify(data));
    }, 1000);
  });
}

async function loadData(forceError) {
  var output = document.getElementById("api-output");
  var bannerArea = document.getElementById("banner-area");

  bannerArea.textContent = "";          // clear old error
  output.textContent = "Loading...";

  try {
    var text = await fakeServer(forceError);
    var data = JSON.parse(text);        // can throw if JSON is bad

    // show the data
    output.textContent = "";
    var title = document.createElement("p");
    title.textContent = "Status: " + data.status + " (updated " + data.updated + ")";
    output.appendChild(title);

    var list = document.createElement("ul");
    data.readings.forEach(function (r) {
      var li = document.createElement("li");
      li.textContent = r.sensorId + " = " + r.value;
      list.appendChild(li);
    });
    output.appendChild(list);

  } catch (err) {
    output.textContent = "No data to show.";

    var banner = document.createElement("div");
    banner.className = "error-banner";
    if (err instanceof SyntaxError) {
      banner.textContent = "Could not read the response (bad JSON): " + err.message;
    } else {
      banner.textContent = "Something went wrong: " + err.message;
    }
    bannerArea.appendChild(banner);
  }
}

document.getElementById("load-btn").addEventListener("click", function () {
  loadData(false);
});

document.getElementById("fail-btn").addEventListener("click", function () {
  loadData(true);
});
