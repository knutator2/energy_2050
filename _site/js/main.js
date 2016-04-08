var app = angular.module('App', []);

app.controller('MainCtrl', function ($scope, data) {

    var palette = new Rickshaw.Color.Palette();

    var element = document.getElementById('chart');
    console.log(element);



    data.sumsWithoutPV(function(err, data){
        console.log(data);
        data = data.map(function(item, index) {
            return { x : index, y: item.Summe }
        });
        console.log (data);
        var graph = new Rickshaw.Graph({
            element: element,
            width: 540,
            height: 240,
            renderer: 'line',
            series: [
                // {
                //     name: "Northeast",
                //     data: [ { x: -1893456000, y: 25868573 }, { x: -1577923200, y: 29662053 }, { x: -1262304000, y: 34427091 }, { x: -946771200, y: 35976777 }, { x: -631152000, y: 39477986 }, { x: -315619200, y: 44677819 }, { x: 0, y: 49040703 }, { x: 315532800, y: 49135283 }, { x: 631152000, y: 50809229 }, { x: 946684800, y: 53594378 }, { x: 1262304000, y: 55317240 } ],
                //     color: palette.color()
                // },
                // {
                //     name: "Midwest",
                //     data: [ { x: -1893456000, y: 29888542 }, { x: -1577923200, y: 34019792 }, { x: -1262304000, y: 38594100 }, { x: -946771200, y: 40143332 }, { x: -631152000, y: 44460762 }, { x: -315619200, y: 51619139 }, { x: 0, y: 56571663 }, { x: 315532800, y: 58865670 }, { x: 631152000, y: 59668632 }, { x: 946684800, y: 64392776 }, { x: 1262304000, y: 66927001 } ],
                //     color: palette.color()
                // },
                // {
                //     name: "South",
                //     data: [ { x: -1893456000, y: 29389330 }, { x: -1577923200, y: 33125803 }, { x: -1262304000, y: 37857633 }, { x: -946771200, y: 41665901 }, { x: -631152000, y: 47197088 }, { x: -315619200, y: 54973113 }, { x: 0, y: 62795367 }, { x: 315532800, y: 75372362 }, { x: 631152000, y: 85445930 }, { x: 946684800, y: 100236820 }, { x: 1262304000, y: 114555744 } ],
                //     color: palette.color()
                // },
                // {
                //     name: "West",
                //     data: [ { x: -1893456000, y: 7082086 }, { x: -1577923200, y: 9213920 }, { x: -1262304000, y: 12323836 }, { x: -946771200, y: 14379119 }, { x: -631152000, y: 20189962 }, { x: -315619200, y: 28053104 }, { x: 0, y: 34804193 }, { x: 315532800, y: 43172490 }, { x: 631152000, y: 52786082 }, { x: 946684800, y: 63197932 }, { x: 1262304000, y: 71945553 } ],
                //     color: palette.color()
                // }
                {
                    name: "Erneuerbare Energien ohne Photovoltaik",
                    data: data,
                    color: palette.color()
                }
            ]
        } );
        var x_axis = new Rickshaw.Graph.Axis.Time( { graph: graph } );

        var y_axis = new Rickshaw.Graph.Axis.Y( {
            graph: graph,
            orientation: 'left',
            tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
            element: document.getElementById('y_axis'),
        } );

        var hoverDetail = new Rickshaw.Graph.HoverDetail( {
            onShow: function(event){
                var index = Date.parse($(".x_label").text()) / 1000;
                console.log(index);
                console.log(data[index]);
                $scope.currentObject = data[index];

            },
            graph: graph
        } );

        $scope.rickshawClick = function() {
            console.log('clicked rickshaw');
        }

        var slider = new Rickshaw.Graph.RangeSlider({
            graph: graph,
            element: document.querySelector('#slider')
        });

        var legend = new Rickshaw.Graph.Legend( {
            element: document.querySelector('#legend'),
            graph: graph
        });

        var offsetForm = document.getElementById('offset_form');

        offsetForm.addEventListener('change', function(e) {
            var offsetMode = e.target.value;

            if (offsetMode == 'lines') {
                graph.setRenderer('line');
                graph.offset = 'zero';
            } else {
                graph.setRenderer('stack');
                graph.offset = offsetMode;
            }
            graph.render();

        }, false);

        graph.render();
    });
});

app.factory('data', function($http) {
    return {
        sumsWithoutPV: function (cb) {
            $http.get('js/data_json/summe_erneuerbar.json')
                .then(function (result) {
                    cb(null, result.data);
                })
        }
    };
});


