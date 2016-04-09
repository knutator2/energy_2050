var app = angular.module('App', []);

app.controller('MainCtrl', function ($scope, data) {

    var palette = new Rickshaw.Color.Palette();

    var element = document.getElementById('chart');
    console.log(element);

    var gasmax = _.max(energy_data, function(item) { return item.s});
    var watermax = _.max(energy_data, function(item) { return item.q});

    var saisonmax = Math.max(gasmax.s, watermax.q);
    var tagmax = _.max(energy_data, function(item) { return item.r}).r;



    var balk_saison = new Highcharts.Chart({
        chart: {
            renderTo: document.getElementById('balkendiagramm_saison'),
            type: 'column'
        },
        title: {
            text: 'Saisonale Speicher'
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: 'GWh'
            },
            max: saisonmax

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}'
                }
            }
        },

        tooltip: {
            enabled: false
        },

        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: [{
                name: 'Power to gas',
                y: 56.33,
                color: '#F5E10C'
            }, {
                name: 'Speicherseen',
                y: 24.03,
                color: '#1784E3'
            }]
        }]
    });
    // Create the chart
    var balk_tag = new Highcharts.Chart({
        chart: {
            renderTo: document.getElementById('balkendiagramm_tag'),
            type: 'column'
        },
        title: {
            text: 'Tagesspeicher'
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: 'GWh'
            },
            max: tagmax

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}'
                }
            }
        },

        tooltip: {
            enabled: false
        },

        series: [{
            name: 'Brands',
            colorByPoint: true,
            data: [{
                name: 'Batterien',
                y: 12,
                color: '#228012'
            }]
        }]
    });

    // Create the chart
    var balk_ueberschuss = $('#balkendiagramm_ueberschuss').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Überschuss'
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: 'GWh'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}'
                }
            }
        },

        tooltip: {
            enabled: false
        },

        series: [{
            name: 'Brands',
            colorByPoint: false,
            data: [{
                name: 'Überschuss',
                y: 12,
                color: '#ED1915'
            }]
        }]
    });

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
                console.log(energy_data[index]);
                $scope.currentObject = energy_data[index];

            },
            graph: graph
        } );

        $scope.rickshawClick = function() {
            console.log('clicked rickshaw');
            console.log($scope.currentObject);
            balk_saison.series[0].setData(
                [{
                    name: 'Power to gas',
                    y: $scope.currentObject.s,
                    color: '#F5E10C'
                },
                {
                    name: 'Speicherseen',
                    y: $scope.currentObject.q,
                    color: '#1784E3'
                }]
            , true); //true / false to redraw
            balk_tag.series[0].setData(
                [{
                    name: 'Batterien',
                    y: $scope.currentObject.r,
                    color: '#228012'
                }]
                , true); //true / false to redraw

        };

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


