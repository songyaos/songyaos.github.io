
/*this drawchart function transposes the input csv array for google API
* notice the CORS issue if you change the source csv file path.
*when the primary button is clicked, view will be updated.
*
* */

google.load("visualization", "1", {packages:["bar"]});
google.setOnLoadCallback(drawChart);
google.setOnLoadCallback(buttonPress);

function drawChart() {

    $.get("http://www.sfu.ca/~avahdat/CMPT732/occupation_genre.csv", function(csvString) {
        // transform the CSV string into a 2-dimensional array
        var arrayData = $.csv.toArrays(csvString, {onParseValue: $.csv.hooks.castToScalar});
        var transArray = transpose(arrayData);
        var newdata = new google.visualization.DataTable();
        newdata.addColumn('string', arrayData[0][0]);
        // use arrayData to load the select elements with the appropriate options
        for (var i = 1; i < arrayData.length; i++) {
            // this adds the given option to both select elements
            $("#rightValues").append("<option value='" + i + "'>" + arrayData[i][0] + "</option");
            newdata.addColumn('number', arrayData[i][0]);
        };
        newdata.addRows(transArray.length-1);
        for ( i = 1; i < transArray.length; ++i) {
            entry = transArray[i];
            for ( j = 0; j < entry.length; ++j) {
                newdata.setCell(i - 1, j, transArray[i][j]);
            }
        }
        $("#rightValues option[value='0']").attr("selected","selected");
        // this view can select a subset of the data at a time
        var view = new google.visualization.DataView(newdata);
        view.setColumns([0,13,21]);
        var options = {
            axes : {
                y : {
                    0 : {
                        side : 'left',
                        label : 'Conditional Prob.'
                    } // left y-axis.
                }
            },
        };
        var chart = new google.charts.Bar(document.getElementById('interactive_chart'));
        chart.draw(view, options);


        // set listener for the update button
        $("#btnPrimary").click(function(){//update view when clicked
            var selecteList = $("#leftValues").val();
            var selecteditems =[];
            selecteditems[0]=0;
            for(i=1;i<selecteList.length+1;i++){
                selecteditems[i] = parseInt(selecteList[i-1]);
            }
            if(selecteditems.length <1) {view.setColumns([0,13,21]);}
            else {view.setColumns(selecteditems);}
            var chart = new google.charts.Bar(document.getElementById('interactive_chart'));
            chart.draw(view, options);
        });
    });
    function transpose(a) {
        return a[0].map(function(_, c) {
            return a.map(function(r) {
                return r[c];
            });
        });
    };

};



function buttonPress(){
$("#btnLeft").click(function () {
    var selectedItem = $("#rightValues option:selected");
    $("#leftValues").append(selectedItem);
});

$("#btnRight").click(function () {
    var selectedItem = $("#leftValues option:selected");
    $("#rightValues").append(selectedItem);
});


}

