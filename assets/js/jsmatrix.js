
/**
 * First row with matrix labels
 */
function getLabelRow(labels) {
    let row = document.createElement("tr");
    for (let i = 0; i < labels.length; i++) {
        let col = document.createElement("td");
        col.innerHTML = "<h2>" + labels[i] + "</h2>";
        row.appendChild(col);
    }
    return row;
}

/**
 * Make a row of buttons
 * @param {array} labels Labels for each button
 */
function getButtonRow(labels) {
    let row = document.createElement("tr");
    let buttons = {};
    for (let i = 0; i < labels.length; i++) {
        let col = document.createElement("td");
        let button = document.createElement("button");
        button.innerHTML = "Show Transformation";
        col.appendChild(button);
        row.appendChild(col);
        buttons[labels[i]] = button;
    }
    return {"buttons":buttons, "row":row};
}

/**
 * Create a 3x3 grid of different colored squares
 * @param {dom element} parent Element to which to add the squares
 * @param {double} shapeSide Dimension of the square
 */
function makeShape(parent, shapeSide) {
    let face = parent.append("g")
            .attr("viewBox", "0 0 "+shapeSide+" "+shapeSide+"");
    // make a colorful square made up of 9 smaller squares to use as the reference object
    let side = shapeSide/3;
    let colors = d3.scale.category10([3, 3]);
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            face.append("rect")
                    .attr("class", "square")
                    .attr({width: side, height: side})
                    .attr("transform", "translate(" + (j * side) + "," + (i * side) + ")")
                    .style("opacity", .5)
                    .style("fill", colors([j, i]));
        }
    };
    return face;
}

/**
 * Add coordinate axes
 * @param {dom element} parent Element to which to add the axes
 */
function makePlane(parent) {
    var plane = parent.append("g")
            .attr("viewBox", "-100 -100 200 200")
    plane.append("line").attr({x1: 0, y1: -100, x2: 0, y2: 100});
    plane.append("line").attr({x1: -100, y1: 0, x2: 100, y2: 0});
    return plane;
}

/**
 * Add the plots with the 3x3 grid of colored squares
 * @param {list of string} labels The label for each plot
 * @param {float} width Width of each plot in pixels
 * @param {float} height Height of each plot in pixels
 * @param {float} shapeSide Dimension of each square in pixels
 */
function addSquaresRow(labels, width, height, shapeSide) {
    let row = document.createElement("tr");
    let svgs = [];
    for (let i = 0; i < labels.length; i++) {
        let col = document.createElement("td");
        let svgi = d3.select(col).append("svg")
                    .attr("id", labels[i])
                    .attr("width", width)
                    .attr("height", height)
                    .attr("viewBox", "" + (-width/3) + " " + (-height/3) + " " + width + " " + height);
        row.appendChild(col);
        svgs.push(svgi);
    }
    svgs.forEach(function(item) {
        item.attr("transform", "translate(0, "+height+")");
        item.attr("transform", "scale(1, -1)")
    });
    for (let i = 0; i < svgs.length; i++) {
        let plane = makePlane(svgs[i], shapeSide);
        let shape = makeShape(plane, shapeSide);
        let m = 50;
        shape.attr("id", "shape_" + i )
                .append("circle").attr("r", 2).attr("fill", "red").attr("stroke", "black");
        plane.attr("id", "plane_" + i )
                .attr("transform", "translate("+m+", "+m+")");
    }
    return row;
}

/**
 * Create a row-major unrolled array of text inputs in a table
 * to represent matrix elements
 * @param {dom element} domElem DOM element to which to add the table
 * @param {boolean} homogenous Whether to use homogenous coordinates
 * @param {string} name Display name for the matrix
 */
function createMatrixInput(domElem, homogenous, name) {
    let table = document.createElement("table");
    table.border = 1;
    let elems = [];
    let ncols = 2;
    if (homogenous) {
        ncols = 3;
    }
    for (let i = 0; i < 2; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < ncols; j++) {
            let col = document.createElement("td");
            let input = document.createElement("input");
            input.size = 1;
            input.type = "text";
            if (i == j) {
                input.value = "1";
            }
            else {
                input.value = "0";
            }
            elems.push(input);
            col.appendChild(input);
            row.appendChild(col);
        }
        table.appendChild(row);
    }
    if (homogenous) {
        let row = document.createElement("tr");
        let vals = ["&nbsp0", "&nbsp0", "&nbsp1"];
        for (let j = 0; j < 3; j++) {
            let col = document.createElement("td");
            col.innerHTML = vals[j];
            row.appendChild(col);
        }
        table.appendChild(row);
    }

    let metaTable = document.createElement("table");
    let metaRow = document.createElement("tr");
    let metaCol1 = document.createElement("td");
    metaCol1.innerHTML = "<h2>" + name + " = " + "</h2>";
    metaRow.appendChild(metaCol1);
    let metaCol2 = document.createElement("td");
    metaCol2.appendChild(table);
    metaRow.appendChild(metaCol2);
    metaTable.appendChild(metaRow);
    domElem.appendChild(metaTable);
    return elems;
}

/**
 * Convert a grid of text inputs into a glMatrix.mat3 object
 * @param {list of dom elements} elems Text inputs
 */
function textToMatrix(elems) {
    let m = glMatrix.mat3.create();
    let ms = [];
    for (let i = 0; i < elems.length; i++) {
        ms.push(parseFloat(elems[i].value));
    }
    if (ms.length == 4) {
        ms = [ms[0], ms[1], 0, ms[2], ms[3], 0];
    }
    for (let i = 0; i < ms.length; i++) {
        m[i] = ms[i];
    }
    return m;
}

/**
 * Copy glMatrix.mat3 values over to text input elements
 * @param {glMatrix.mat3} m matrix
 * @param {list of dom elements} elems Text inputs
 */
function matrixToText(m, elems) {
    if (elems.length == 4) {
        elems[0].value = "" + m[0];
        elems[1].value = "" + m[1];
        elems[2].value = "" + m[3];
        elems[3].value = "" + m[4];
    }
    else {
        for (let i = 0; i < elems.length; i++) {
            elems[i].value = "" + m[i];
        }
    }
}

/**
 * Convert a 3x3 homogenous matrix into svg format, noting that
 * glMatrix stores it in row major and svg stores it in column major
 * @param {glMatrix.mat3} m The matrix
 * @param {float} sideLen The length of a side of a square.
 *                        Scale the translation by this amount
 */
function mat3ToSVG(m, sideLen) {
    let ret = [m[0], m[3], m[1], m[4], sideLen*m[2], sideLen*m[5]];
    return ret;
}

const EYE = [1, 0, 0, 1, 0, 0];
function transformSquareGrid(label, As, delay, sideLen) {
    let shape = d3.select("#shape_"+label);
    shape.attr("transform", "matrix(" + EYE + ")");
    As.forEach(function(A, index) {
        shape.transition().delay(delay*(index+1))
        .attr("transform", "matrix("+mat3ToSVG(A, sideLen)+")");
    });
}

/**
 * Add the matrix widgets to a particular div element
 * for Ax, Bx, A(Bx), and (AB)x
 * @param {dom element} parent Parent element to which to add this widget
 * @param {boolean} homogenous Whether to use homogenous coordinates
 * @param {float} width Width of each transformation plot in pixels
 * @param {float} height Height of each transformation plot in pixels
 * @param {float} shapeSide Dimension of each square in pixels in the transformation plots
 * @param {glMatrix.mat3} AInit Initial A matrix
 * @param {glMatrix.mat3} BInit Initial B matrix
 */
function add2CompositionMatrixWidgets(parent, homogenous, width, height, sideLen, AInit, BInit) {
    if (AInit === undefined) {
        AInit = glMatrix.mat3.create();
    }
    if (BInit === undefined) {
        BInit = glMatrix.mat3.create();
    }
    let labels = ["Ax", "Bx", "B(Ax)", "(BA)x"];
    let table = document.createElement("table");
    parent.appendChild(table);
    // First row with labels
    table.appendChild(getLabelRow(labels));
    // Second row with buttons
    let res = getButtonRow(labels);
    table.appendChild(res.row);
    let buttons = res.buttons;
    // Third row with colorful squares
    res = addSquaresRow(labels, width, height, sideLen);
    table.appendChild(res);
    // Add two matrix inputs
    let matrixRow = document.createElement("tr");
    let col = document.createElement("td");
    let AInputs = createMatrixInput(col, homogenous, "A");
    matrixToText(AInit, AInputs);
    matrixRow.appendChild(col);
    col = document.createElement("td");
    let BInputs = createMatrixInput(col, homogenous, "B");
    matrixToText(BInit, BInputs);
    matrixRow.appendChild(col);
    table.appendChild(matrixRow);
    buttons["Ax"].onclick = function() {
        let A = textToMatrix(AInputs);
        transformSquareGrid(0, [A], 1000, sideLen);
    }
    buttons["Bx"].onclick = function() {
        let B = textToMatrix(BInputs);
        transformSquareGrid(1, [B], 1000, sideLen);
    }
    buttons["B(Ax)"].onclick = function() {
        let A = textToMatrix(AInputs);
        let B = textToMatrix(BInputs);
        let BA = glMatrix.mat3.create();
        glMatrix.mat3.multiply(BA, B, A);
        transformSquareGrid(2, [A, BA], 1000, sideLen);
    }
    buttons["(BA)x"].onclick = function() {
        let A = textToMatrix(AInputs);
        let B = textToMatrix(BInputs);
        let BA = glMatrix.mat3.create();
        glMatrix.mat3.multiply(BA, B, A);
        transformSquareGrid(3, [BA], 1000, sideLen);
    }
    return {"table":table, "AInputs":AInputs, "BInputs":BInputs};
}

/**
 * Add the matrix widgets to a particular div element
 * for Ax, Bx, B(Ax), A(Bx)
 * @param {dom element} parent Parent element to which to add this widget
 * @param {boolean} homogenous Whether to use homogenous coordinates
 * @param {float} width Width of each transformation plot in pixels
 * @param {float} height Height of each transformation plot in pixels
 * @param {float} shapeSide Dimension of each square in pixels in the transformation plots
 * @param {glMatrix.mat3} AInit Initial A matrix
 * @param {glMatrix.mat3} BInit Initial B matrix
 */
function addCommutativeMatrixGrid(parent, homogenous, width, height, sideLen, AInit, BInit) {
    if (AInit === undefined) {
        AInit = glMatrix.mat3.create();
    }
    if (BInit === undefined) {
        BInit = glMatrix.mat3.create();
    }
    let labels = ["Ax", "Bx", "B(Ax)", "A(Bx)"];
    let table = document.createElement("table");
    parent.appendChild(table);
    // First row with labels
    table.appendChild(getLabelRow(labels));
    // Second row with buttons
    let res = getButtonRow(labels);
    table.appendChild(res.row);
    let buttons = res.buttons;
    // Third row with colorful squares
    res = addSquaresRow(labels, width, height, sideLen);
    table.appendChild(res);
    // Add two matrix inputs
    let matrixRow = document.createElement("tr");
    let col = document.createElement("td");
    let AInputs = createMatrixInput(col, homogenous, "A");
    matrixToText(AInit, AInputs);
    matrixRow.appendChild(col);
    col = document.createElement("td");
    let BInputs = createMatrixInput(col, homogenous, "B");
    matrixToText(BInit, BInputs);
    matrixRow.appendChild(col);
    table.appendChild(matrixRow);
    buttons["Ax"].onclick = function() {
        let A = textToMatrix(AInputs);
        transformSquareGrid(0, [A], 1000, sideLen);
    }
    buttons["Bx"].onclick = function() {
        let B = textToMatrix(BInputs);
        transformSquareGrid(1, [B], 1000, sideLen);
    }
    buttons["B(Ax)"].onclick = function() {
        let A = textToMatrix(AInputs);
        let B = textToMatrix(BInputs);
        let BA = glMatrix.mat3.create();
        glMatrix.mat3.multiply(BA, B, A);
        transformSquareGrid(2, [A, BA], 1000, sideLen);
    }
    buttons["A(Bx)"].onclick = function() {
        let A = textToMatrix(AInputs);
        let B = textToMatrix(BInputs);
        let AB = glMatrix.mat3.create();
        glMatrix.mat3.multiply(AB, A, B);
        transformSquareGrid(3, [B, AB], 1000, sideLen);
    }
    return {"table":table, "AInputs":AInputs, "BInputs":BInputs};
}


/**
 * Add the matrix widgets to a particular div element
 * for Ax, Bx, A(Bx), and (AB)x
 * @param {dom element} parent Parent element to which to add this widget
 * @param {boolean} homogenous Whether to use homogenous coordinates
 * @param {float} width Width of each transformation plot in pixels
 * @param {float} height Height of each transformation plot in pixels
 * @param {float} shapeSide Dimension of each square in pixels in the transformation plots
 * @param {glMatrix.mat3} AInit Initial A matrix
 */
function addSingleMultiplicationWidget(parent, homogenous, width, height, sideLen, AInit) {
    if (AInit === undefined) {
        AInit = glMatrix.mat3.create();
    }
    let labels = ["Ax"];
    let table = document.createElement("table");
    parent.appendChild(table);
    // First row with labels
    table.appendChild(getLabelRow(labels));
    // Second row with buttons
    let res = getButtonRow(labels);
    table.appendChild(res.row);
    let buttons = res.buttons;
    // Third row with colorful squares
    res = addSquaresRow(labels, width, height, sideLen);
    table.appendChild(res);
    // Add  matrix input
    let matrixRow = document.createElement("tr");
    let col = document.createElement("td");
    let AInputs = createMatrixInput(col, homogenous, "A");
    matrixToText(AInit, AInputs);
    matrixRow.appendChild(col);
    table.appendChild(matrixRow);
    buttons["Ax"].onclick = function() {
        let A = textToMatrix(AInputs);
        transformSquareGrid(0, [A], 1000, sideLen);
    }
    return {"table":table, "AInputs":AInputs};
}